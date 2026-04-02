import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateUser {
    @IsNotEmpty()
    @IsString()
    firstName: string;
    @IsNotEmpty()
    @IsString()
    lastName: string;
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    phoneNumber: string;
}