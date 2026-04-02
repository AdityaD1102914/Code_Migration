import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateReading {
    _metaData: {
        source_id: string;
        device_id: string;
        device_type: string;
    };
    @IsNumber()
    value: number | null;
    @IsOptional()
    anomaly: string
    @IsOptional()
    fault: string
    @IsOptional()
    hvac_cooling: number | null
    @IsOptional()
    occupancy_boost: number | null
}