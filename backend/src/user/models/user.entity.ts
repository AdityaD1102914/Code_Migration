import { Exclude, Expose } from "class-transformer";
import { ArrayMinSize, IsArray, IsString } from "class-validator";
import { ObjectId } from "mongoose";

export class UserEntity {
    firstName: string;
    lastName: string;
    @Expose() //to expose the properties
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`
    }
    email: string;
    phoneNumber: number;
    @Exclude()//to exclude the properties
    password: string;
    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    roles: string[];
    isActive?: boolean;

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }
}