import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class UpdateSensorDto {
    @IsNotEmpty()//to make work the validation, need to enable the validation globally or module wise
    @IsString()
    device_name: string;
    device_type: string;
    @IsNotEmpty()//to make work the validation, need to enable the validation globally or module wise
    @IsString()
    source_id: string
    status: string;
    unit: string;
    description: string;
    @IsNotEmpty()//to make work the validation, need to enable the validation globally or module wise
    @IsObject()
    device_location: {
        modelId: string;
        modelLocationId: string;
    };
    @IsObject()
    device_geolocation: {
        lat: number;
        long: number;
    }
    @IsOptional()
    normal_range: {
        min: number;
        max: number;
    }
    @IsOptional()
    anomaly_range: {
        min: number;
        max: number;
    }
    @IsOptional()
    falut_range: {
        max: number;
        min: number;
    }
}