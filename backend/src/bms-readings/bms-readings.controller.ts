import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateReading } from './dtos/createReading.dto';
import { BmsReadingsService } from './bms-readings.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { SENSOR_COLLECTIONS_AUTHROLES } from '../config/config';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { SortOrder } from 'mongoose';

@Controller('devicereadings')
export class BmsReadingsController {
    // Implement methods for reading BMS data
    constructor(private readingService: BmsReadingsService) { }

    @Post()
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createReading(@Body() readingData: CreateReading) {
        // Create a new BMS 
        if (readingData) {
            let curentDate = new Date();
            readingData['_ts'] = curentDate.toISOString();
        }
        const createdReading = await this.readingService.createNewReadings(readingData);
        return createdReading;
    }

    @Get()
    @Roles(SENSOR_COLLECTIONS_AUTHROLES)
    @UseGuards(JwtAuthGuard, RolesGuard)
    // @CacheKey('readings')
    // @CacheTTL(3000)
    filterReadngsForSesnroId(
        @Query('device_id') sensorId: string,
        @Query('source_id') sourceId: string, //Add if needed
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('sort') sort: string,
        @Query('startIndex') startIndex: number,
        @Query('limit') limit: number
    ) {
        console.log('limit, startIndex',limit, startIndex)
        let filterOptions = {}
        if (sensorId) {
            filterOptions = { ...filterOptions, ["_metaData.device_id"]: sensorId }
        } if (start && end) {
            filterOptions = { ...filterOptions, ["_ts"]: { $gte: new Date(start), $lte: new Date(end) } }
        }
        //add sorting and limit query
        return this.readingService.findAllReadings(filterOptions,sort,startIndex, limit);
    }

}