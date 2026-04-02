import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection, connection } from 'mongoose';
import { SensorsModule } from './sensors/sensors.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BmsReadingsModule } from './bms-readings/bms-readings.module';
import { validate } from './config/env.validation';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { HTTPCacheInterceptor } from './interceptors/cache.interceptor';
import { MqttModule } from './mqtt/mqtt.module';
import { FilesModule } from './files/files.module';
import { GithubAuthModule } from './github-auth/github-auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate //the method to validate the env variables
    }),
    //mongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbUserName = configService.get<string>('DBUSERNAME');
        const dbPassword = configService.get<string>('DBPASSWORD');
        const dbName = configService.get<string>('DBNAME');
        const dbHost = configService.get<string>('DBHOST'); // Your MongoDB Atlas cluster URL
        const uri = `mongodb+srv://${dbUserName}:${dbPassword}@${dbHost}/${dbName}?retryWrites=true&w=majority`;
        return {
          uri,
          onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () => console.log('connected'));
            connection.on('open', () => console.log('open'));
            connection.on('disconnected', () => console.log('disconnected'));
            connection.on('reconnected', () => console.log('reconnected'));
            connection.on('disconnecting', () => console.log('disconnecting'));
          }
        }
      }
    }),
    //canche-manager
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('CACHE_HOST'),
        port: configService.get<number>('CACHE_PORT'),
        ttl: configService.get<number>('CACHE_TTL'),
        max: configService.get<number>('CACHE_MAX'),
      }),
    }),//we can provide options lke, ttl etc.
    MqttModule, SensorsModule, UserModule, AuthModule, BmsReadingsModule, FilesModule, GithubAuthModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: HTTPCacheInterceptor
  }]
})
export class AppModule { }
