'''==== MQTT Connect Module ===='''
#Required libraries
import paho.mqtt.client as mqtt
import env
import time
# from tqdm import tqdm
mqtt_config = env.get_mqtt_config()

def connectToMQTT(on_message):
    #MQTT Config
    def on_connect(client, userdata, flags, rc):
        print('Inside on_connect')
        if rc == 0:
            print('Connected')
        else: 
            print('Failed to connect')
    #connect
    client = mqtt.Client(client_id=mqtt_config['client_id'])
    client.username_pw_set(mqtt_config['username'], mqtt_config['password'])
    client.on_connect = on_connect
    client.connect(mqtt_config['broker'], mqtt_config['port'],60)
    client.on_message = on_message
    print('Onconnect', client)
    return client


def publish(client,topic, msg):
    # print('Publishing message to topic:', type(msg))
    result = client.publish(topic,msg)
    status = result[0]
    # print('status', result)
    if status == 0:
        print(f"Send `{msg}` to topic `{topic}`")
    else: 
        print(f"Failed to send message to topic {topic}")
        
        # time.sleep(1)

def onMessageCallback(msg):
    print('msg on callback', msg.payload.decode)
    return f"{msg.payload.decode()} from {msg.topic}"

def subscribeToTopic(client, topics):
    print('Subscribing to topic:', topics)
    for topic in topics:
        print('Subscribing to topic:', topic)
        client.subscribe(topic)
        print('Subscribed to topic:', topic)

def run(on_message):
    client = connectToMQTT(on_message)
    subscribeToTopic(client, mqtt_config['MQTTTOPICS'])
    client.loop_start()
    return client
    
if __name__ == '__run__':
    run()