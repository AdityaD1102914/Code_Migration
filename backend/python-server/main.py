import env
from utils import mqtt
# from utils import cncOps
# from utils import welRobotOps
import time
# from tqdm import tqdm
# from utils import common #reference to common utilities
import json
from utils import device_manager
import pandas as pd
from utils import common
from utils import temp_readings
import datetime as dt
from datetime import timezone
from zoneinfo import ZoneInfo
from utils import air_quality
from utils import occupany_readings
from utils import waterflow
from env import MQTTTopicSensorReadings
from utils import log_manager
SLEEP_TIME = 10
devices = None
mqtt_config = env.get_mqtt_config()

def on_message(client, userdata, msg):
    print('Message received on topic:', msg.topic)
    message = msg.payload.decode()
    print('Message content:', message)
    # Here you can add logic to handle the message
    # For example, you could parse it as JSON if it's in that format
    try:
        data = json.loads(message)
        print('Parsed data:', data)
        global devices        
        match msg.topic:
            case env.MQTTDeviceListTopic:
                isSaved = device_manager.saveDeviceList(data)
                if isSaved:
                    devices = list(device_manager.loadDeviceList(client))
                    print('Device list saved successfully')
                else:
                    devices = []
                print('Device list updated:', devices)
            case env.MQTTNewDeviceToAddTopic:
                print('device to add:', data)
                # return
                isAdded = device_manager.addNewDevice(data)
                if isAdded:
                    devices = list(device_manager.loadDeviceList(client))
                    print('New device added:', data)
                else:
                    print('Failed to add new device (might already exist):', data)
            case env.MQTTUpdateDeviceTopic:
                print('Device updated:', data)
                isUpdated = device_manager.updateExistingDevice(data)
                if isUpdated:
                    devices = list(device_manager.loadDeviceList(client))
                    print('Device updated:', devices)
                else:
                    print('Failed to update device (might not exist):', data)
            case env.MQTTDeleteDeviceTopic:
                # print('Device delete:', data)
                isDeleted = device_manager.deleteExistingDevice(data)
                if isDeleted:
                    devices = list(device_manager.loadDeviceList(client))
                    print('Device deleted:', data)
                else:
                    print('Failed to delete device (might not exist):', data)
            case _:
                print('Unknown topic:', msg.topic)
            # Here you can add logic to process sensor data
    except json.JSONDecodeError:
        print('Received non-JSON message:', message)

def main():
    print("Starting the Python server...")
    mqtt_client = mqtt.run(on_message)
    print('SLEEP_TIME', SLEEP_TIME)
    
    #Load device List to generate readings
    global devices
    devices = list(device_manager.loadDeviceList(mqtt_client)) #pass mqtt_client to load device list
    
    common.tranform_device_list(devices)
    # print('Devices loaded:', common.tranform_device_list(devices))
    timestamps = [dt.datetime.now(timezone.utc).astimezone(ZoneInfo('Asia/Kolkata')) + dt.timedelta(minutes = i) for i in range(1440)]
    # print('Timestamps generated:', timestamps)
    # return
    for i,ts in enumerate(timestamps):
        # print('Generating device readings...', i, ts)
        # Here you can add logic to generate readings for each device
        readings_payload = {"readings": []}
        if devices is None or len(devices) == 0:
            devices = list(device_manager.loadDeviceList(mqtt_client))
            print('No devices available to generate readings. Please add devices first.')
            time.sleep(SLEEP_TIME)
            continue
        for device in devices:
            match device.get("device_type"):
                case 'temperature':
                    readings = temp_readings.generateTempratureReadings(device,ts)
                    # print(f"Temperature readings for device {device.get('deviceId')}: {readings}")
                    readings_payload['readings'].append(readings)
                case 'co2':
                    readings = air_quality.generateAirQualityReadings(device, ts)
                    # print('co2 reading', readings)
                    readings_payload['readings'].append(readings)
                case 'occupancy':
                    readings = occupany_readings.generateOccupancyReadings(device, ts)
                    # print('occupancy reading', readings)
                    readings_payload['readings'].append(readings)
                case 'waterflow':
                    readings = waterflow.generate_waterflow_readings(device, ts)
                    # print('water reading', readings)
                    readings_payload['readings'].append(readings)
                case _:
                    print(f"Unknown device type: {device.get('device_type')}")
        print('Readings payload:', readings_payload)
        #Publish the readings to the MQTT broker
        mqtt.publish(mqtt_client, MQTTTopicSensorReadings, json.dumps(readings_payload))
        log_manager.log_reading_to_file(json.dumps(readings_payload))
        print(f"Published readings for timestamp {ts.isoformat()}")
        time.sleep(SLEEP_TIME)
main()