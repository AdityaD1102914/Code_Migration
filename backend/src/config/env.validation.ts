import { plainToInstance } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from "class-validator";

class EnvironmentValidator {
    @IsNotEmpty()
    @IsNumber()
    SERVER_PORT: number;

    //JWT part
    @IsNotEmpty()
    @IsString()
    JWT_SECRET: string;

    @IsNotEmpty()
    @IsString()
    JWT_EXPIREIN: string;

    //DB Related
    @IsNotEmpty()
    @IsString()
    DBHOST: string;
    @IsNotEmpty()
    @IsString()
    DBNAME: string
    @IsNotEmpty()
    @IsString()
    DBUSERNAME: string
    @IsNotEmpty()
    @IsString()
    DBPASSWORD: string;

    //MQTT Related
    @IsNotEmpty()
    @IsString()
    MQTT_BROKER_URL: string;
    @IsNotEmpty()
    @IsString()
    MQTT_USERNAME: string;
    @IsNotEmpty()
    @IsString()
    MQTT_PASSWORD: string;
    @IsNotEmpty()
    @IsString()
    MQTT_DEVICE_READINGS_TOPIC: string;
    MQTT_SIMULATION_OPS_TOPIC : string;
    MQTT_DEVICE_LIST_FETCH_TOPIC : string;
    MQTT_NEW_DEVICE_TO_ADD_DEVICE : string;
}

//pass this method to the Reistrations of ConfigModule at app-moduke.ts
export const validate = (config: Record<string, unknown>) => {
    const validatedConfig = plainToInstance(EnvironmentValidator, config, {
        enableImplicitConversion: true //cast types from the destination class
    });
    //check for errors
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    })
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
} 
