# Authentication module for CelestiNav - Flask adaptation of Replit Auth
import os
import requests
import jwt
import json
import secrets
from functools import wraps
from datetime import datetime, timedelta
from flask import request, jsonify, session, redirect, url_for
from database_models import db, User, AuthSession
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

# Configuration from environment variables
REPL_ID = os.environ.get('REPL_ID')
REPLIT_DOMAINS = os.environ.get('REPLIT_DOMAINS', '').split(',')
ISSUER_URL = os.environ.get('ISSUER_URL', 'https://replit.com/oidc')
SESSION_SECRET = os.environ.get('SESSION_SECRET')

class ReplitAuth:
    def __init__(self, app=None):
        self.app = app
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize the auth system with Flask app"""
        app.config['SESSION_PERMANENT'] = False
        app.config['SESSION_TYPE'] = 'filesystem'
        
        # Register auth routes
        self.register_routes(app)
    
    def register_routes(self, app):
        """Register authentication routes"""
        
        @app.route('/api/login')
        def login():
            """Redirect to Replit OAuth login with proper security"""
            if not REPL_ID:
                return jsonify({'error': 'REPL_ID not configured'}), 500
            
            # Generate secure state for CSRF protection
            state = secrets.token_urlsafe(32)
            nonce = secrets.token_urlsafe(32)
            
            # Store state and nonce in session for verification
            session['oauth_state'] = state
            session['oauth_nonce'] = nonce
            
            # Build OAuth URL for Replit
            auth_url = f"{ISSUER_URL}/authorize"
            callback_url = f"https://{request.host}/api/callback"
            
            params = {
                'client_id': REPL_ID,
                'response_type': 'code',
                'scope': 'openid email profile offline_access',
                'redirect_uri': callback_url,
                'prompt': 'login consent',
                'state': state,
                'nonce': nonce
            }
            
            # Build the full auth URL
            param_string = '&'.join([f"{k}={v}" for k, v in params.items()])
            full_url = f"{auth_url}?{param_string}"
            
            return redirect(full_url)
        
        @app.route('/api/callback')
        def callback():
            """Handle OAuth callback from Replit with security validation"""
            code = request.args.get('code')
            state = request.args.get('state')
            
            if not code:
                return jsonify({'error': 'No authorization code provided'}), 400
            
            # Verify state parameter for CSRF protection
            stored_state = session.get('oauth_state')
            if not state or not stored_state or state != stored_state:
                session.clear()  # Clear potentially compromised session
                return jsonify({'error': 'Invalid state parameter'}), 400
            
            try:
                # Exchange code for tokens
                token_data = self.exchange_code_for_token(code, request.host)
                
                # Get user info from verified token
                stored_nonce = session.get('oauth_nonce')
                user_info = self.verify_and_decode_token(token_data.get('id_token', ''), stored_nonce)
                
                # Create or update user in database
                user = self.upsert_user(user_info)
                
                # Clear OAuth session data
                session.pop('oauth_state', None)
                session.pop('oauth_nonce', None)
                
                # Store authenticated user session
                session['user_id'] = user.id
                session['user_claims'] = user_info
                session['access_token'] = token_data.get('access_token')
                session['refresh_token'] = token_data.get('refresh_token')
                session['expires_at'] = user_info.get('exp', 0)
                
                return redirect('/')
                
            except Exception as e:
                print(f"Auth callback error: {e}")
                session.clear()  # Clear session on error
                return jsonify({'error': 'Authentication failed'}), 400
        
        @app.route('/api/logout')
        def logout():
            """Log out user and clear session"""
            session.clear()
            
            # Redirect to Replit logout
            logout_url = f"{ISSUER_URL}/logout"
            post_logout_redirect = f"https://{request.host}/"
            
            return redirect(f"{logout_url}?post_logout_redirect_uri={post_logout_redirect}")
        
        @app.route('/api/auth/user')
        def get_user():
            """Get current authenticated user"""
            if not self.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            user_id = session.get('user_id')
            if not user_id:
                return jsonify({'error': 'No user session'}), 401
            
            user = User.query.get(user_id)
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify(user.to_dict())
    
    def exchange_code_for_token(self, code, host):
        """Exchange authorization code for access token"""
        token_url = f"{ISSUER_URL}/token"
        callback_url = f"https://{host}/api/callback"
        
        data = {
            'grant_type': 'authorization_code',
            'client_id': REPL_ID,
            'code': code,
            'redirect_uri': callback_url
        }
        
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        return response.json()
    
    def get_jwks(self):
        """Fetch Replit's JWKS for token verification"""
        try:
            jwks_url = f"{ISSUER_URL}/.well-known/jwks.json"
            response = requests.get(jwks_url, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"JWKS fetch error: {e}")
            return None

    def verify_and_decode_token(self, token, expected_nonce=None):
        """Securely verify and decode JWT token"""
        try:
            # Get token header to find the key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get('kid')
            
            if not kid:
                raise ValueError("No key ID in token header")
            
            # Get JWKS and find the correct key
            jwks = self.get_jwks()
            if not jwks:
                raise ValueError("Could not fetch JWKS")
            
            # Find the key
            key = None
            for jwk_key in jwks.get('keys', []):
                if jwk_key.get('kid') == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk_key)
                    break
            
            if not key:
                raise ValueError(f"Key {kid} not found in JWKS")
            
            # Verify and decode token
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=REPL_ID,
                issuer=ISSUER_URL,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True
                }
            )
            
            # Verify nonce if provided
            if expected_nonce and payload.get('nonce') != expected_nonce:
                raise ValueError("Nonce mismatch")
            
            return payload
            
        except Exception as e:
            print(f"Token verification error: {e}")
            raise ValueError(f"Token verification failed: {e}")

    def decode_token(self, token):
        """Legacy method - use verify_and_decode_token instead"""
        return self.verify_and_decode_token(token)
    
    def upsert_user(self, user_info):
        """Create or update user from OAuth claims"""
        user_id = str(user_info.get('sub', ''))
        if not user_id:
            raise ValueError("No user ID in claims")
        
        user = User.query.get(user_id)
        if not user:
            user = User()
            user.id = user_id
            db.session.add(user)
        
        # Update user fields from claims
        user.email = user_info.get('email')
        user.first_name = user_info.get('first_name')
        user.last_name = user_info.get('last_name')
        user.profile_image_url = user_info.get('profile_image_url')
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        return user
    
    def is_authenticated(self):
        """Check if user is authenticated"""
        user_id = session.get('user_id')
        expires_at = session.get('expires_at', 0)
        
        if not user_id:
            return False
        
        # Check if token is expired
        if expires_at and expires_at < datetime.utcnow().timestamp():
            return False
        
        return True
    
    def require_auth(self, f):
        """Decorator to require authentication for routes"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not self.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            return f(*args, **kwargs)
        return decorated_function

# Create auth instance
replit_auth = ReplitAuth()

def require_auth(f):
    """Decorator function for requiring authentication"""
    return replit_auth.require_auth(f)