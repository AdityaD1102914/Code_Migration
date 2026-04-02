import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsOptional } from "class-validator";

@Schema({collection: 'sensordevices'})

@Schema({_id: false})
class Location{
    @Prop({required: false})
    modelId: string;
    @Prop({required: false})
    modelLocationId: string
}
@Schema({_id: false})
class GeoLocation{
    @Prop({required: false})
    lat: number | null;
    @Prop({required: false})
    long: number | null;
}

@Schema({_id: false})
class AnomalyRange{
    @Prop({required: false})
    min: number | null
    @Prop({required: false})
    max: number | null
}
@Schema({_id: false})
class FaultRange{
    @Prop({required: false})
    min: number | null
    @Prop({required: false})
    max: number | null
}
@Schema({_id: false})
class BaseRange{
    @Prop({required: false})
    min: number | null
    @Prop({required: false})
    max: number | null
}
const LocationSchema = SchemaFactory.createForClass(Location);
const GeolocationSchema = SchemaFactory.createForClass(GeoLocation);
const AnomalySchema = SchemaFactory.createForClass(AnomalyRange);
const FaultRangeSchema = SchemaFactory.createForClass(FaultRange);
const BaseRangeSchema = SchemaFactory.createForClass(BaseRange);
@Schema({
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
})
export class Sensor {
    @Prop({ required: true })//flag to set that the field is required, we can use {unique: true} to make the props unique and non-duplicates
    device_name: string;
    @Prop({ required: true })
    device_type: string;
    @Prop({ required: true })
    source_id: string
    @Prop({ required: true })
    unit: string;
    @Prop({ required: true })
    status: string;
    @Prop({required: false})
    description: string;
    @Prop({ required: false, type: LocationSchema, default: {modelId: '', modelLocationId: ''} })
    device_location: Location;
    @Prop({required: false, type: GeolocationSchema, default: {lat: null, long: null}})
    device_geolocation: GeoLocation
    @Prop({required: false, type: AnomalyRange})
    anomaly_range: AnomalyRange
    @Prop({required: false, type: FaultRange})
    fault_range: FaultRange
    @Prop({required: false, type: BaseRange})
    normal_range: BaseRange
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);