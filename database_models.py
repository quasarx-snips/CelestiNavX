from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Measurement(db.Model):
    __tablename__ = 'measurements'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    pitch = db.Column(db.Float, nullable=False)
    heading = db.Column(db.Float, nullable=False)
    elevation = db.Column(db.Float, default=0.0)
    pressure = db.Column(db.Float, default=1013.25)
    temperature = db.Column(db.Float, default=15.0)
    calculation_method = db.Column(db.String(10), default='solar')
    accuracy = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    session_id = db.Column(db.Integer, db.ForeignKey('user_sessions.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'pitch': self.pitch,
            'heading': self.heading,
            'elevation': self.elevation,
            'pressure': self.pressure,
            'temperature': self.temperature,
            'calculationMethod': self.calculation_method,
            'accuracy': self.accuracy,
            'notes': self.notes,
            'sessionId': self.session_id
        }

class WeatherReading(db.Model):
    __tablename__ = 'weather_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    sky_images = db.Column(db.Text, nullable=True)  # JSON string
    conditions = db.Column(db.Text, nullable=True)  # JSON string
    ai_analysis = db.Column(db.Text, nullable=True)  # JSON string
    session_id = db.Column(db.Integer, db.ForeignKey('user_sessions.id'), nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'skyImages': json.loads(self.sky_images) if self.sky_images else {},
            'conditions': json.loads(self.conditions) if self.conditions else {},
            'aiAnalysis': json.loads(self.ai_analysis) if self.ai_analysis else {},
            'sessionId': self.session_id
        }

class UserSession(db.Model):
    __tablename__ = 'user_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    session_token = db.Column(db.String(100), unique=True, nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    location_lat = db.Column(db.Float, nullable=True)
    location_lng = db.Column(db.Float, nullable=True)
    location_accuracy = db.Column(db.Float, nullable=True)
    device_info = db.Column(db.Text, nullable=True)  # JSON string
    
    # Relationships
    measurements = db.relationship('Measurement', backref='session', lazy=True)
    weather_readings = db.relationship('WeatherReading', backref='session', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sessionToken': self.session_token,
            'startTime': self.start_time.isoformat() if self.start_time else None,
            'endTime': self.end_time.isoformat() if self.end_time else None,
            'location': {
                'lat': self.location_lat,
                'lng': self.location_lng,
                'accuracy': self.location_accuracy
            } if self.location_lat and self.location_lng else None,
            'deviceInfo': json.loads(self.device_info) if self.device_info else {},
            'measurementCount': len(self.measurements),
            'weatherReadingCount': len(self.weather_readings)
        }

class AppStats(db.Model):
    __tablename__ = 'app_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    stat_key = db.Column(db.String(50), unique=True, nullable=False)
    stat_value = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'key': self.stat_key,
            'value': self.stat_value,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }