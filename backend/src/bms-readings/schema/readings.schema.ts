import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional } from "class-validator";

export type ReadingDocument = Reading & Document;

@Schema({ _id: false })
class MetaData {
    @Prop()
    source_id: string;
    @Prop()
    device_id: string;
    @Prop()
    device_type: string;
}

const MetaDataSchema = SchemaFactory.createForClass(MetaData);

@Schema({
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
})
export class Reading {
    @Prop({required: true})
    _ts: Date; //Required properties
    @Prop({ type: MetaDataSchema})
    _metaData: MetaData//Required properties
    @Prop()
    value: number;
    @Prop()
    @IsOptional()
    anomaly: string
    @Prop()
    @IsOptional()
    fault: string
    @Prop()
    @IsOptional()
    hvac_cooling: number | null
    @Prop()
    @IsOptional()
    occupancy_boost: number | null
    //the properties can be increased as per device data, will be always optional
}

export const ReadingSchema = SchemaFactory.createForClass(Reading);