#Occupany Readings Genration
#The Peak hours will be 9:00 AM to 6:00 PM
import numpy as np
import random
import datetime as dt


def generateOccupancyReadings(device, timestamp):
    
    #check if it is offline
    if device.get('status') == 'offline' or device.get('status') == 'inactive':
        return {
            "_ts": timestamp.isoformat(),
            "unit": "NA",
            "value": 0,
            "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
        }
    #simulate occupany readings
    #minutes of the day
    minute_of_day = (timestamp.hour * 60 + timestamp.minute)
    # print(minute_of_day)
    occupany = 1 if 540 <= minute_of_day <= 1080 else 0 #9:00 AM to 6:00 PM
    # print('occupany', occupany)
    occupany_boost = occupany * random.uniform(0.5,2.0)
    #Fault case chcek for fault if it stuck on 0 or 1 from last 24 hours
    return {
        "_ts": timestamp.isoformat(),
        "unit": "NA",
        "value": occupany,
        "occupany_boost": occupany_boost,
        "_metaData": {
            "source_id": device.get("source_id"),
            "device_id": device.get("_id"),
            "device_type": device.get("device_type")
        }
    }
        