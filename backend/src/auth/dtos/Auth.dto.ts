import { IsNotEmpty, IsString } from "class-validator";

export class AuthPayload {
    @IsNotEmpty()
    @IsString()
    username: string;
    @IsNotEmpty()
    @IsString()
    password: string;
}