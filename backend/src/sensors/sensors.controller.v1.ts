import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { SensorService } from './services/sensor.service';
import { CreateSensorDto } from './dtos/createsensor.dto';
import mongoose, { SortOrder } from 'mongoose';
import { UpdateSensorDto } from './dtos/updatesensor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SENSOR_COLLECTIONS_AUTHROLES } from '../config/config';
import { BmsReadingsService } from 'src/bms-readings/bms-readings.service';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('sensordevices')
export class SensorsControllerV1 {

    constructor(private sensorService: SensorService, private readingService: BmsReadingsService) { }

    @Get()
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @CacheKey('sensors')
    @CacheTTL(10000)
    async getAllSensors(
        @Query('sort') sort: string,
        @Query('startIndex') startIndex: number,
        @Query('limit') limit: number
    ) {
        return await this.sensorService.findAllSensors(sort,startIndex,limit);
    }

    @Post()
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UsePipes(new ValidationPipe())//to enalble validation for particular endpoint
    createSensor(@Body() createSensorDto: CreateSensorDto) {
        return this.sensorService.createSensor(createSensorDto);
    }

    @Get(':id')
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findSensorById(@Param('id') id: string) {
        const isIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!isIdValid) throw new HttpException('Sensor not found', 404);
        const sensor = await this.sensorService.findSensor(id);
        if (!sensor) throw new HttpException('Sensor not found', 404);
        return sensor;
    }

    @Patch(':id')
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async updateSensor(@Param('id') id: string, @Body() sensorToUpdate: UpdateSensorDto) {
        // update sensor logic goes here
        const checkIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!checkIdValid) throw new HttpException("Invalid Sensor Id", 400);
        const updatedSensor = await this.sensorService.updateSensor(id, sensorToUpdate)
        if (!updatedSensor) throw new HttpException('Sensor not found', 404);
        return updatedSensor;
    }

    @Delete(':id')
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async deleteSensor(@Param('id') id: string) {
        const checkIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!checkIdValid) throw new HttpException("Invalid Sensor Id", 400);
        const deletedSensor = await this.sensorService.deleteSensor(id)
        if (!deletedSensor) throw new HttpException('Sensor not found', 404);
        let deletedreadings = await this.readingService.deleteReadings({ "_metaData.device_id": id });
        return "ok 204";
    }

}
