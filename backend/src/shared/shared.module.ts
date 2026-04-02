import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BmsReadingsModule } from "src/bms-readings/bms-readings.module";
import { BmsReadingsService } from "src/bms-readings/bms-readings.service";
import { SensorsModule } from "src/sensors/sensors.module";

@Module({
    imports: [ConfigModule, BmsReadingsModule, SensorsModule],
    controllers: [],
    exports: [ConfigModule,BmsReadingsModule, SensorsModule]
})

export class SharedModule { }
