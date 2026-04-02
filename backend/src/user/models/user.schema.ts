import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
})
export class User {
    @Prop({ required: true })
    firstName: string;
    @Prop({ required: true })
    lastName: string;
    @Prop({ required: true, unique: true })
    email: string;
    @Prop({ required: false })
    phoneNumber?: number;
    @Prop({ required: true })
    password: string;
    @Prop({ required: true})
    roles: string[]
    @Prop({ required: true })
    isActive?: boolean;

}

export const UserSchema = SchemaFactory.createForClass(User);