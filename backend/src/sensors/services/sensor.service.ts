import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Sensor } from "../models/sensor.schema";
import { Model, SortOrder } from "mongoose";
import { CreateSensorDto } from "../dtos/createsensor.dto";
import { UpdateSensorDto } from "../dtos/updatesensor.dto";

@Injectable()
export class SensorService {
    constructor(@InjectModel(Sensor.name) private model: Model<Sensor>) { }

    async findAllSensors(sort = 'desc', startIndex = 0, limit = 50) {
        return this.model.find().sort({ createdAt: sort as SortOrder }).skip(startIndex).limit(limit).exec();
    }

    async createSensor(CreateSensorDto: CreateSensorDto) {
        const sensorData = new this.model(CreateSensorDto);
        return sensorData.save();
    }

    async findSensor(sensorId: string) {
        return this.model.findById(sensorId);
    }

    async updateSensor(id: string, sensorToUpdate: UpdateSensorDto) {
        return this.model.findByIdAndUpdate(id, sensorToUpdate, { new: true }); //adding new as a query it would return new document after updating otherwise it return the old one even if updated
    }

    async deleteSensor(id: string) {
        return this.model.findByIdAndDelete(id);
    }

}