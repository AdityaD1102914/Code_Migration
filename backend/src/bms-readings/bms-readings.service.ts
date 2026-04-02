import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Reading, ReadingDocument } from './schema/readings.schema';
import { Model, SortOrder } from 'mongoose';
import { CreateReading } from './dtos/createReading.dto';

@Injectable()
export class BmsReadingsService {
    constructor(@InjectModel(Reading.name) private readingsModel: Model<ReadingDocument>) { }


    async findAllReadings(filterOptions: any = {},sort ='desc', startIndex=0, limit=50) {
        return await this.readingsModel.find(filterOptions).sort({createdAt: sort as SortOrder}).skip(startIndex).limit(limit).exec();
    }
    async createNewReadings(readingData: CreateReading) {
        const inserted = await this.readingsModel.insertMany(readingData);
        return inserted;
    }

    async deleteReadings(filterOptions: any = {}) {
        const check = await this.readingsModel.deleteMany(filterOptions).exec();
        return check;
    }

}
