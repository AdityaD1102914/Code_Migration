import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUser {
    firstName: string;
    lastName: string;
    @IsNotEmpty()
    @IsString()
    email: string;
    @IsOptional()
    @IsNumber()
    phoneNumber?: number;
    @IsNotEmpty()
    @IsString()
    password: string;
    @IsNotEmpty()
    @IsOptional()
    @IsArray()
    @IsString({each: true})
    @ArrayMinSize(1)
    roles: string[];
    @IsBoolean()
    isActive?: boolean;
}