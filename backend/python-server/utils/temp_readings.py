import random
import datetime as dt
import numpy as np
import time
def generateTempratureReadings(device, ts):
    # print('Generating temperature readings for device:', device, ts)
    #TODO: take parameters dynamic
    #paramters can be adjusted to simulate different temperature readings
    # e.g.
    base_temp = 24
    daily_drift = 0.05
    anomaly_rate = 0.01
    fault_rate = 0.001
    sunlight_boost_max = 2
    anomaly_min = 18 # 28<t<18 means anomaly detected
    anomaly_max = 28#normal,induce_anomaly, induce fault
    fault_min = 15
    falut_max = 30
    temp_drift = 0
    cooling_efficiency = 1.5 # cooling efficiency of the HVAC system 1 unit of cooling reduces temperature by 1.5 degree
    # print('Generating temperature readings for device:', device, ts)
    
    if device.get('status') == 'offline' or device.get('status') == 'inactive':
        return {
        "_ts": "2025-07-31T16:15:54.089327",
        "unit": "°C",
        "value": 0,
        "anomaly": 'NO',
        "fault": 'No',
        "hvac_cooling": 0,
        "occupancy_boost": 0,
        "sunlight_boost": 0,
        "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
        }
    else:
        minute_of_day = (ts.hour * 60 + ts.minute)
        time_fraction = minute_of_day / 1440 #minutes in a day
            
        # Daily base sinusodial temprature variation
        temp_base_variation = np.sin(2*np.pi * time_fraction) * 5
            
        #Add sunlight effect (Gaussian-like bump centered at noon)
        hours_from_noon = (minute_of_day - 720) / 60 #720 minute = 12PM
        sunlight_factor = np.exp(-0.5 * (hours_from_noon / 2.5) **2)
        sunlight_boost = sunlight_factor * sunlight_boost_max
            #drift
        temp_drift +=0.05/1440
        #Occupany boost during work hours  (attempt to maintain -23*C)
        occupancy = 1 if 540 <=minute_of_day <=1080 else 0#9:00 AM to 6:00 PM
        occupany_boost = occupancy * random.uniform(0.5,2.0)
            
        #HAVAC cooling durin work hours  (attempt to maintain -23*C)
        hvac_cooling = 0.0
        if occupancy: 
            hvac_cooling = -random.uniform(1.0, 2.5)
        else:
            hvac_cooling = 0.0
        #final temp
        # print()
        temp = (base_temp + temp_base_variation + sunlight_boost + occupany_boost + hvac_cooling + np.random.normal(0,0.5) + temp_drift)
            
        # print(f"{ts.hour}:{temp}")
        
        isAnomaly = False
        isFault = False
        cooling_applied = 0
        cooling_required = 0
        if temp > anomaly_max or temp < anomaly_min:
            isAnomaly = True
            isFault = False
            #chcek for cooling required
            cooling_required = (temp - anomaly_max if temp > anomaly_max else anomaly_min - temp) / cooling_efficiency
            # print(f"Cooling required: {cooling_required} units")
        elif temp > falut_max or temp < fault_min:
            isFault = True
            isAnomaly = False
        else:
            isAnomaly = False
            isFault = False
        
        #TODO: Add required cooling
        return {
            "_ts": ts.isoformat(),
            "unit": "°C",
            "value": int(temp.item()),
            "anomaly": 'Yes' if isAnomaly else 'No',
            "fault": 'Yes' if isFault else 'No',
            "hvac_cooling": hvac_cooling,
            "occupancy_boost": occupany_boost,
            "sunlight_boost": sunlight_boost.item(),
            "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
        }