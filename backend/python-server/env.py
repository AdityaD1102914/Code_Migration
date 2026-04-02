#Using Public Broker
import random

MQTTBroker = "io.adafruit.com"
MQTTPort = 1883
topic = "digitalTwin/CNC"
# MQTTClientID = f'digital-twin-mqtt-{random.randint(0, 1000)}' #No need when using public broker
MQTTClientID = 'DigitalTwin_MQTT_Controller' #No need when using public broker
MQTTUsername = 'sgaurav' #No need when using public broker
MQTTPassword = 'aio_kZnQ46o6IjW7lyKQFlKPkJIPXfVF' #No need when using public broker
MQTTTopicSensorReadings = 'sgaurav/feeds/SensorReadings'
MQTTSiumlationOPsTopic = 'sgaurav/feeds/SiumulationOps'
MQTTDeviceListTopic = 'sgaurav/feeds/DeviceList'
MQTTNewDeviceToAddTopic = 'sgaurav/feeds/NewDeviceToAdd'
MQTTUpdateDeviceTopic = 'sgaurav/feeds/UpdateDevice'
MQTTDeleteDeviceTopic = 'sgaurav/feeds/DeleteDevice'
def get_mqtt_config():
    return{
        "broker": MQTTBroker,
        "port": MQTTPort,
        "client_id": MQTTClientID,
        "username": MQTTUsername,
        "password": MQTTPassword,
        "MQTTTOPICS": [
            MQTTDeviceListTopic,MQTTSiumlationOPsTopic,MQTTNewDeviceToAddTopic,MQTTUpdateDeviceTopic,MQTTDeleteDeviceTopic
        ]
    }
DEVICE_LIST_FILE = 'device_list.json'
