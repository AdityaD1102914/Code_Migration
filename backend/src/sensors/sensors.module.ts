import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Sensor, SensorSchema } from "./models/sensor.schema";
import { SensorsControllerV1 } from "./sensors.controller.v1";
import { SensorService } from "./services/sensor.service";
import { BmsReadingsModule } from "src/bms-readings/bms-readings.module";
import { SensorsControllerV2 } from "./sensors.controller.v2";
import { MiddlewareBuilder } from "@nestjs/core";
import { VersionMiddleware } from "src/middlewares/version.middleware";
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Sensor.name,
                schema: SensorSchema,
                collection: 'sensordevices'
            }
        ]),
        BmsReadingsModule
    ],
    controllers: [SensorsControllerV1, SensorsControllerV2],
    providers: [SensorService, Sensor],
    exports: [SensorService, Sensor]
})
export class SensorsModule {
    configure(consumer: MiddlewareBuilder) {
        consumer.apply(VersionMiddleware).forRoutes('sensors');
    }
}