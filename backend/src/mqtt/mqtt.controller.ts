import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PublishMessageDto } from './dto/publish-message.dto';
import { SubscribeTopicDto } from './dto/subscribe-topic.dto';

@Controller('mqtt')
@UseGuards(JwtAuthGuard)
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Get('status')
  getStatus() {
    const status = this.mqttService.getConnectionStatus();
    return {
      success: true,
      message: 'MQTT connection status retrieved',
      data: status,
    };
  }

  @Post('publish')
  @UseGuards(RolesGuard)
  @Roles(['ADMIN'])
  async publishMessage(@Body() publishMessageDto: PublishMessageDto) {
    await this.mqttService.publish(
      publishMessageDto.topic,
      publishMessageDto.message,
      publishMessageDto.options,
    );
    
    return {
      success: true,
      message: 'Message published successfully',
      data: {
        topic: publishMessageDto.topic,
        message: publishMessageDto.message,
      },
    };
  }

  @Post('subscribe')
  @UseGuards(RolesGuard)
  @Roles(['ADMIN'])
  async subscribeToTopic(@Body() subscribeTopicDto: SubscribeTopicDto) {
    await this.mqttService.subscribe(
      subscribeTopicDto.topic,
      { qos: subscribeTopicDto.options?.qos ?? 0 },
    );
    
    return {
      success: true,
      message: 'Subscribed to topic successfully',
      data: {
        topic: subscribeTopicDto.topic,
      },
    };
  }

  @Post('unsubscribe')
  @UseGuards(RolesGuard)
  @Roles(['ADMIN'])
  async unsubscribeFromTopic(@Body() body: { topic: string | string[] }) {
    await this.mqttService.unsubscribe(body.topic);
    
    return {
      success: true,
      message: 'Unsubscribed from topic successfully',
      data: {
        topic: body.topic,
      },
    };
  }
}