import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { BmsReadingsService } from 'src/bms-readings/bms-readings.service';
import { SensorService } from 'src/sensors/services/sensor.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private readonly logger = new Logger(MqttService.name);

  constructor(private configService: ConfigService, private readingService: BmsReadingsService, private deviceService: SensorService) { }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    console.log('Disconnecting MQTT client...');
    if (this.client) {
      await this.client.endAsync();
    }
  }

  private async connect() {
    const brokerUrl = this.configService.get('MQTT_BROKER_URL') || 'mqtt://@io.adafruit.com';
    const port = this.configService.get('MQTT_PORT') || 1883;
    const username = this.configService.get('MQTT_USERNAME');
    const password = this.configService.get('MQTT_PASSWORD');
    const clientId = this.configService.get('MQTT_CLIENT_ID') || 'nestjs-backend';

    try {
      this.client = mqtt.connect(brokerUrl, {
        username: username,
        password: password
      });

      this.client.on('connect', () => {
        this.logger.log(`Connected to MQTT broker at ${brokerUrl}:${port}`);
        //Remove when make it dynamic as the subscription will be handled from client side 
        this.subscribe([this.configService.get('MQTT_DEVICE_READINGS_TOPIC')])
        this.subscribe(this.configService.get('MQTT_SIMULATION_OPS_TOPIC'))
      });

      this.client.on('error', (error) => {
        this.logger.error('MQTT connection error:', error);
      });

      this.client.on('disconnect', () => {
        this.logger.warn('Disconnected from MQTT broker');
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message.toString());
      });

    } catch (error) {
      this.logger.error('Failed to connect to MQTT broker:', error);
    }
  }

  async publish(topic: string, message: string | object, options?: mqtt.IClientPublishOptions): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client is not connected');
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    return new Promise((resolve, reject) => {
      this.client.publish(topic, payload, options || {}, (error) => {
        if (error) {
          this.logger.error(`Failed to publish to topic ${topic}:`, error);
          reject(error);
        } else {
          this.logger.log(`Message published to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async subscribe(topic: string | string[], options?: mqtt.IClientSubscribeOptions): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, options || {}, (error, granted) => {
        if (error) {
          this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
          reject(error);
        } else {
          this.logger.log(`Subscribed to topic(s): ${Array.isArray(topic) ? topic.join(', ') : topic}`);
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string | string[]): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client is not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (error) => {
        if (error) {
          this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
          reject(error);
        } else {
          this.logger.log(`Unsubscribed from topic(s): ${Array.isArray(topic) ? topic.join(', ') : topic}`);
          resolve();
        }
      });
    });
  }

  private handleMessage(topic: string, message: string) {
    this.logger.log(`Received message on topic ${topic}: ${message}`);
    // Write logic to track sensors readings and store to db
    // Handle different topics
    switch (topic) {
      case this.configService.get('MQTT_DEVICE_READINGS_TOPIC'):
        this.handleDeviceReadings(message);
        break;
      case this.configService.get('MQTT_SIMULATION_OPS_TOPIC'):
        const messageData = JSON.parse(message);
        if (messageData.action === 'REQUEST_DEVICE_LIST') {
          this.handleRequestOfDeviceList();
        }
        break;
      default:
        this.logger.log(`Unhandled topic: ${topic}`);
    }
  }

  // Info: Handle Readings to store
  private async handleDeviceReadings(message) {
    if (message) {
      const { readings } = JSON.parse(message);
      //Fetch readings, transform and store to DB
      readings ? await this.readingService.createNewReadings(readings) : 'No readings to generate';
    }
  }

  private async handleRequestOfDeviceList() {
    //Call device list and send back to broker
    const deviceList = await this.deviceService.findAllSensors();
    this.publish(this.configService.get('MQTT_DEVICE_LIST_FETCH_TOPIC'), JSON.stringify(deviceList), { qos: 1 });
  }

  // for future notification use
  private handleUserNotification(message: string) {
    try {
      const notification = JSON.parse(message);
      this.logger.log('Processing user notification:', notification);
      // Add your notification processing logic here
    } catch (error) {
      this.logger.error('Failed to parse user notification:', error);
    }
  }
  // for future logging use
  private handleSystemAlert(message: string) {
    try {
      const alert = JSON.parse(message);
      this.logger.log('Processing system alert:', alert);
      // Add your alert processing logic here
    } catch (error) {
      this.logger.error('Failed to parse system alert:', error);
    }
  }




  isConnected(): boolean {
    return this.client && this.client.connected;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected(),
      host: this.configService.get('MQTT_HOST'),
      port: this.configService.get('MQTT_PORT'),
      clientId: this.configService.get('MQTT_CLIENT_ID'),
    };
  }
}