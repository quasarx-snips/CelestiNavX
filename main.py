from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import numpy as np
from datetime import datetime, timezone
from pysolar.solar import get_altitude, get_azimuth
from scipy.optimize import minimize
import warnings
import os
import json
import uuid

# Import database models
from database_models import db, User, AuthSession, Measurement, WeatherReading, UserSession, AppStats
# Import authentication - DISABLED for direct access
# from auth import replit_auth, require_auth

# ====================================================================
# --- FLASK SETUP AND DATABASE CONFIGURATION ---
# ====================================================================
# Flask instance must be named 'app'
app = Flask(__name__)

# Database configuration - Use PostgreSQL from environment
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///celestinav.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'celestinav-secret-key-' + str(uuid.uuid4()))

# Initialize database
db.init_app(app)
migrate = Migrate(app, db)

# Initialize authentication - DISABLED for direct access
# replit_auth.init_app(app)

# Create tables
with app.app_context():
    db.create_all()

# Serve static HTML files from the root directory
@app.route('/')
def serve_index():
    """Serves the main entry page (now the aesthetic homepage)."""
    return send_from_directory(os.getcwd(), 'index.html')

# Health check endpoint for API monitoring
@app.route('/health')
def health_check():
    """Health check endpoint for API monitoring."""
    return jsonify({"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()})

# ====================================================================
# --- SOLAR CALCULATION LOGIC ---
# ====================================================================

# Ignore RuntimeWarning from numpy/scipy when invalid values occur near boundaries
warnings.filterwarnings("ignore", category=RuntimeWarning)

def atmospheric_refraction(true_altitude_deg, pressure=1013.25, temperature=15):
    """Calculates atmospheric refraction correction."""
    if true_altitude_deg < -5:
        return 0.0
    
    R = 1.0 / (np.tan(np.radians(true_altitude_deg + 7.31 / (true_altitude_deg + 4.4))) + 0.0013519)
    R *= (pressure / 1010.0) * (283.0 / (273.0 + temperature))
    return R / 60.0

def calculate_error(coords, obs_data):
    """The objective function to minimize (weighted squared error)."""
    lat, lon = coords
    try:
        true_alt = get_altitude(lat, lon, obs_data['utc_time'], obs_data.get('elevation', 0.0))
        true_az = get_azimuth(lat, lon, obs_data['utc_time'])

        refr_corr = atmospheric_refraction(true_alt)
        apparent_alt = true_alt + refr_corr

        alt_error = abs(apparent_alt - obs_data['altitude'])
        diff = true_az - obs_data['azimuth']
        az_error = min(abs(diff), 360 - abs(diff))

        # Altitude error is weighted higher for stability
        return alt_error**2 * 10 + az_error**2
        
    except Exception:
        return float('inf')

def estimate_location_api(obs_data):
    """Estimates location via iterative optimization with a robust initial guess."""
    
    # --- 1. Robust Initial Guess ---
    dt_utc = obs_data['utc_time']
    alt_obs = obs_data['altitude']
    az_obs = obs_data['azimuth']
    
    # 1.1. Calculate Solar Declination (Delta)
    day_of_year = dt_utc.timetuple().tm_yday
    declination = 23.45 * np.sin(np.radians(360 / 365 * (day_of_year - 81))) 

    # 1.2. Rough Latitude Guess
    rough_lat = np.clip(90 - alt_obs + declination, -89.9, 89.9)

    # 1.3. Rough Longitude Guess (Hour Angle approximation)
    sin_alt = np.sin(np.radians(alt_obs))
    sin_lat_sin_dec = np.sin(np.radians(rough_lat)) * np.sin(np.radians(declination))
    cos_lat_cos_dec = np.cos(np.radians(rough_lat)) * np.cos(np.radians(declination))
    
    H_deg = 0.0
    if cos_lat_cos_dec != 0:
        H_arg = (sin_alt - sin_lat_sin_dec) / cos_lat_cos_dec
        H_arg = np.clip(H_arg, -1.0, 1.0)
        
        H_rad = np.arccos(H_arg)
        H_deg = np.degrees(H_rad)
        
    if az_obs < 180:
        H_deg = -H_deg

    utc_hours = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
    rough_lon = (utc_hours - 12.0) * 15 - H_deg
    rough_lon = (rough_lon + 180) % 360 - 180
    
    initial_guess = (rough_lat, rough_lon)

    # --- 2. Run Minimization ---
    bounds = [(-90, 90), (-180, 180)]

    result = minimize(
        calculate_error,
        initial_guess,
        args=(obs_data,),
        method='L-BFGS-B',
        bounds=bounds,
        options={'maxiter': 1000, 'ftol': 1e-6}
    )

    if result.success:
        return result.x[0], result.x[1]
    else:
        print(f"Optimization failed. Returning initial guess: {initial_guess}")
        return initial_guess 

# ====================================================================
# --- FLASK API ENDPOINT ---
# ====================================================================

@app.route('/calculate_latlon', methods=['GET'])
def calculate_latlon():
    """API endpoint to receive pitch/heading and return lat/lon."""
    
    try:
        # Note: obs_altitude here is the ADJUSTED value (Raw - 90) sent by camera.html
        obs_altitude = float(request.args.get('pitch'))
        obs_azimuth = float(request.args.get('heading'))
        elevation = float(request.args.get('elevation', 0.0))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing 'pitch' or 'heading' parameters."}), 400

    dt_utc = datetime.now(timezone.utc)
    
    obs_data = {
        'utc_time': dt_utc,
        'azimuth': obs_azimuth,
        'altitude': obs_altitude,
        'elevation': elevation,
    }

    try:
        lat, lon = estimate_location_api(obs_data)
    except Exception as e:
        print(f"--- FAILED CALCULATION TRACE ---")
        print(f"Internal Calculation Error: {e}")
        print(f"---------------------------------")
        return jsonify({"error": "Solar calculation failed on server. Internal error."}), 500

    # Save measurement to database
    try:
        measurement = Measurement(
            latitude=float(lat),
            longitude=float(lon),
            pitch=obs_altitude,
            heading=obs_azimuth,
            elevation=elevation,
            pressure=float(request.args.get('pressure', 1013.25)),
            temperature=float(request.args.get('temperature', 15.0)),
            calculation_method='solar',
            accuracy=1000.0,  # Default accuracy in meters
            timestamp=dt_utc
        )
        db.session.add(measurement)
        db.session.commit()
        
        measurement_id = measurement.id
    except Exception as e:
        print(f"Database save error: {e}")
        measurement_id = None

    return jsonify({
        "status": "success",
        "lat": f"{lat:.6f}",
        "lon": f"{lon:.6f}",
        "captured_time_utc": dt_utc.isoformat(),
        "measurement_id": measurement_id,
        "accuracy": 1000.0
    })

# ====================================================================
# --- REST API ENDPOINTS ---
# ====================================================================

@app.route('/api/measurements', methods=['GET'])
def get_measurements():
    """Get recent measurements."""
    try:
        limit = request.args.get('limit', 50, type=int)
        measurements = Measurement.query.order_by(Measurement.timestamp.desc()).limit(limit).all()
        return jsonify({
            "status": "success",
            "data": [m.to_dict() for m in measurements],
            "count": len(measurements)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/measurements', methods=['POST'])
def create_measurement():
    """Create a new measurement."""
    try:
        data = request.get_json()
        measurement = Measurement(
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            pitch=data['pitch'],
            heading=data['heading'],
            elevation=data.get('elevation', 0),
            pressure=data.get('pressure', 1013.25),
            temperature=data.get('temperature', 15),
            calculation_method=data.get('calculationMethod', 'solar'),
            accuracy=data.get('accuracy'),
            notes=data.get('notes')
        )
        db.session.add(measurement)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": measurement.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/weather', methods=['GET'])
def get_weather_readings():
    """Get recent weather readings."""
    try:
        limit = request.args.get('limit', 20, type=int)
        readings = WeatherReading.query.order_by(WeatherReading.timestamp.desc()).limit(limit).all()
        return jsonify({
            "status": "success",
            "data": [r.to_dict() for r in readings],
            "count": len(readings)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/weather', methods=['POST'])
def create_weather_reading():
    """Create a new weather reading."""
    try:
        data = request.get_json()
        reading = WeatherReading(
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            sky_images=json.dumps(data.get('skyImages', {})),
            conditions=json.dumps(data.get('conditions', {})),
            ai_analysis=json.dumps(data.get('aiAnalysis', {}))
        )
        db.session.add(reading)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": reading.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new user session."""
    try:
        data = request.get_json() or {}
        session = UserSession(
            session_token=str(uuid.uuid4()),
            location_lat=data.get('location', {}).get('lat'),
            location_lng=data.get('location', {}).get('lng'),
            location_accuracy=data.get('location', {}).get('accuracy'),
            device_info=json.dumps(data.get('deviceInfo', {}))
        )
        db.session.add(session)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": session.to_dict()
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sessions/<int:session_id>', methods=['PUT'])
def update_session(session_id):
    """Update an existing session."""
    try:
        session = UserSession.query.get_or_404(session_id)
        data = request.get_json()
        
        if 'endTime' in data:
            session.end_time = datetime.fromisoformat(data['endTime'].replace('Z', '+00:00'))
        if 'location' in data:
            session.location_lat = data['location'].get('lat')
            session.location_lng = data['location'].get('lng')
            session.location_accuracy = data['location'].get('accuracy')
        
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "data": session.to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get application statistics."""
    try:
        total_measurements = Measurement.query.count()
        total_weather = WeatherReading.query.count()
        total_sessions = UserSession.query.count()
        
        recent_measurement = Measurement.query.order_by(Measurement.timestamp.desc()).first()
        
        # Calculate average accuracy for measurements that have it
        measurements_with_accuracy = Measurement.query.filter(Measurement.accuracy.isnot(None)).all()
        avg_accuracy = sum(m.accuracy for m in measurements_with_accuracy) / len(measurements_with_accuracy) if measurements_with_accuracy else 0
        
        # Method breakdown
        solar_count = Measurement.query.filter(Measurement.calculation_method == 'solar').count()
        gps_count = Measurement.query.filter(Measurement.calculation_method == 'gps').count()
        
        return jsonify({
            "status": "success",
            "data": {
                "totalMeasurements": total_measurements,
                "totalWeatherReadings": total_weather,
                "totalSessions": total_sessions,
                "averageAccuracy": avg_accuracy,
                "lastMeasurement": recent_measurement.timestamp.isoformat() if recent_measurement else None,
                "methodBreakdown": {
                    "solar": solar_count,
                    "gps": gps_count
                }
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 8000...")
    print("Database: celestinav.db")
    app.run(debug=True, host='0.0.0.0', port=os.environ.get('PORT', 8000))

