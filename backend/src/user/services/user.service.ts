import { HttpException, Injectable } from '@nestjs/common';
import { User } from '../models/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUser } from '../dtos/CreateUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUser } from '../dtos/UpdateUser.dto';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private model: Model<User>) { }

    async findUsers() {
        return this.model.find({}, { password: 0 });
    }

    async findUserById(userId: string) {
        return this.model.findById(userId);
    }

    async createNewUser(user: CreateUser) {
        const checkEmailExist = await this.model.findOne({ email: user.email }).exec();
        if (checkEmailExist) throw new HttpException('Email already exists', 400);
        const { password } = user;
        const hashedPassword = await bcrypt.hash(password, 10);//10 is salt rounds
        const updatedUser = { ...user, password: hashedPassword }
        const userTocreate = new this.model(updatedUser);
        return userTocreate.save();
    }
    async findUserByEmail(email: string) {
        return this.model.findOne({ email: email }).exec();
    }

    async updateUser(userId: string, updatedUser: UpdateUser) {
        return this.model.findByIdAndUpdate(userId, updatedUser, { new: true });
    }

    async deleteUser(userId: string) {
        return this.model.findByIdAndDelete(userId);
    }



}
