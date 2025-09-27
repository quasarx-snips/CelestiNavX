from flask import Flask, request, jsonify, send_from_directory
import numpy as np
from datetime import datetime, timezone
from pysolar.solar import get_altitude, get_azimuth
from scipy.optimize import minimize
import warnings
import os

# ====================================================================
# --- FLASK SETUP AND ROUTING ---
# ====================================================================
# Flask instance must be named 'app'
app = Flask(__name__)

# Serve static HTML files from the root directory
@app.route('/')
def serve_index():
    """Serves the main entry page (now the aesthetic homepage)."""
    return send_from_directory(os.getcwd(), 'index.html')

@app.route('/camera.html')
def serve_camera():
    """Serves the camera viewfinder page (live sensors)."""
    return send_from_directory(os.getcwd(), 'camera.html')

@app.route('/results.html')
def serve_results():
    """Serves the results page."""
    return send_from_directory(os.getcwd(), 'results.html')

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

    return jsonify({
        "status": "success",
        "lat": f"{lat:.6f}",
        "lon": f"{lon:.6f}",
        "captured_time_utc": dt_utc.isoformat(),
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=os.environ.get('PORT', 8080))

