'''Water Flow Sensor'''
import random
import datetime as dt
def generate_waterflow_readings(device, ts):
    
    #check if it is offline
    if device.get('status') == 'offline' or device.get('status') == 'inactive':
        return {
            "_ts": ts.isoformat(),
            "unit": "L/min",
            "value": 0,
            "anomaly": 'No',
            "fault": 'No',
            "_metaData": {
                "source_id": device.get("source_id"),
                "device_id": device.get("_id"),
                "device_type": device.get("device_type")
            }
        }
    
    #Simuate water flow, per minute
    base_range = {'min': 5, "max": 20} #L/min
    anomaly_range = {"min": 2, "max": 25} #
    #fault : continuous 0 #L/min
    fault_range = {"min": 0, "max": 1} #L/min
    
    #ganarate base reading
    flow_value = random.uniform(base_range["min"], base_range["max"])
    
    isAomaly= False
    isFault = False
    if flow_value < anomaly_range["min"] or flow_value > anomaly_range["max"]:
        isAomaly = True
    elif flow_value < fault_range["min"] or flow_value > fault_range["max"]:
        isFault = True
    else:
        isAomaly = False
        isFault = False

    return {
        "_ts": ts.isoformat(),
        "unit": "L/min",
        "value": flow_value,
        "anomaly": 'Yes' if isAomaly else 'No',
        "fault": 'Yes' if isFault else 'No',
        "_metaData": {
            "source_id": device.get("source_id"),
            "device_id": device.get("_id"),
            "device_type": device.get("device_type")
        }
    }