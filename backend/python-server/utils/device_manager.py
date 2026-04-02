import pandas as pd
import json
from utils import mqtt
import os
import env
import time
def askForDeviceList(client):
    """ Ask DB or client to provide device list """
    message = {
        "message": "Please provide the device list",
        "action": "REQUEST_DEVICE_LIST"
    }
    mqtt.publish(client, env.MQTTSiumlationOPsTopic, json.dumps(message))

def loadDeviceList(mqtt_client):
    """ Load the device list from local csv file """
    try: 
        print('try')
        with open(env.DEVICE_LIST_FILE, 'r') as file:
            device_list = json.load(file)
            return device_list
    except json.JSONDecodeError:
        return []
    except FileNotFoundError:
        print('File not found, creating new device list')
        askForDeviceList(mqtt_client)
        return []
    except ValueError:
        if os.path.exists(env.DEVICE_LIST_FILE):
            os.remove(env.DEVICE_LIST_FILE)
            askForDeviceList(mqtt_client)
        else:
            print('Error loading device list:')
    
def saveDeviceList(device_list):
    """ Save the devices into local JSON file """
    print(' retrived device_list', device_list, type(device_list))
    try:
        with open('device_list.json', 'w') as file:
            json.dump(device_list, file, indent=4)
        print('Device list saved successfully')
        return True
    except Exception as e:
        print(f'Error saving device list: {e}')
        return False
        
def addNewDevice(device):
    """ Add a new device to the device list """
    with open(env.DEVICE_LIST_FILE, 'r+') as file:
        device_list = json.load(file)
        #check if device already exists
        if any(dev.get('_id') == device.get('_id') for dev in device_list):
            print(f"Device {device.get('_id')} already exists")
            return False
        device_list.append(device)
        file.seek(0)
        json.dump(device_list, file, indent=4)
        return True
def updateExistingDevice(device):
    """ Update an existing device in the device list """
    with open(env.DEVICE_LIST_FILE, 'r+') as file:
        device_list = json.load(file)
        #chcek if device exists
        if not any(dev.get('_id') == device.get('_id') for dev in device_list):
            print(f"Device {device.get('_id')} not found")
            return False
        #update device
        for idx, dev in enumerate(device_list):
            if dev.get('_id') == device.get('_id'):
                device_list[idx] = device
                break
        file.seek(0)
        file.truncate()
        json.dump(device_list, file, indent=4)
        return True
def deleteExistingDevice(device):
    print('deleting device', device['device_id'])
    """ Delete an existing device from the device list """
    with open(env.DEVICE_LIST_FILE, 'r+') as file:
        device_list = json.load(file)
        #chcek if device exists
        if not any(dev.get('_id') == device['device_id'] for dev in device_list):
            print(f"Device {device['device_id']} not found")
            return False
        #delete device
        device_list = [dev for dev in device_list if dev.get('_id') != device['device_id']]
        file.seek(0)
        file.truncate()
        json.dump(device_list, file, indent=4)
        return True
