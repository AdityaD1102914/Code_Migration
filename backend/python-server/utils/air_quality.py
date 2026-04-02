
import random
import datetime as dt
import numpy as np

#TODO: take parameters dynamic
#paramters can be adjusted to simulate different air quality readings
#Environmental factors
# Temprature, Humidity, Light and Noise

def generateAirQualityReadings(device, timestamp):
    """
    Generate air quality readings for a given device and timestamp.
    This function simulates the generation of air quality data.
    """
    
    #check if it is offline
    if device.get('status') == 'offline' or device.get('status') == 'inactive':
        return {
            "_ts": timestamp.isoformat(),
            "unit": "ppm",
            "value": 0,
            "anomaly": 'No',
            "fault": 'No',
            "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
        }
    #required parameters can be adjusted to simulate different air quality readings
    #Take it dynamic in future
    #readings for CO2
    base_co2 = {"min": 400, "max": 800} # ppm
    co2_anomaly_threshold = 1000 #ppm > 1000
    co2_fault_threshold = 1500 #ppm > 1500
    trending_daily = 0.005 # ppm per second
    occupancy = 0
    
    #Rises when occupany and drops when wntilized
    #check for occpancy
    #TODO: Add occupancy + noise + sine + step
    # minute_of_day = (timestamp.hour * 60 + timestamp.minute)
    # #Occupany boost during work hours  (attempt to maintain -23*C)
    # occupancy = 1 if 540 <=minute_of_day <=1080 else 0#9:00 AM to 6:00 PM
    # occupany_boost = occupancy * random.uniform(0.5,2.0)
    
    
    
    
    
    co2_value = random.uniform(base_co2["min"], base_co2["max"])
    if random.random() < 0.01:  # 1% chance of anomaly
        co2_value += random.uniform(co2_anomaly_threshold, 200)
    elif random.random() < 0.001:  # 0.1% chance of fault
        co2_value += random.uniform(co2_fault_threshold, 500)
    # print('co2_value', co2_value)
    
    isAnomaly = False
    isFault = False
    
    if co2_value > co2_anomaly_threshold:
        isAnomaly = True
    elif co2_value > co2_fault_threshold:
        isFault = True
    else: 
        isAnomaly = False
        isFault = False

    return {
        "_ts": timestamp.isoformat(),
            "unit": "ppm",
            "value": co2_value,
            "anomaly": 'Yes' if isAnomaly else 'No',
            "fault": 'Yes' if isFault else 'No',
            # "hvac_cooling": hvac_cooling,
            # "occupancy_boost": occupany_boost,
            # "sunlight_boost": sunlight_boost.item(),
            "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
    }
    
  
    