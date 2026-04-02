import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpException, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './services/user.service';
import { CreateUser } from './dtos/CreateUser.dto';
import { UpdateUser } from './dtos/UpdateUser.dto';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { USER_MANAGEMENT_AUTHUSERS } from '../config/config';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { UserEntity } from './models/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Get('currentUser')
    getCurrentUser(@CurrentUser() user: any){
        return user;
    }

    @Get()
    @Roles(USER_MANAGEMENT_AUTHUSERS)
    @UseGuards(RolesGuard)
    @CacheKey('users')
    @CacheTTL(10000)
    findAllUsers() {
        return this.userService.findUsers();
    }

    @Get(':id')
    @Roles(USER_MANAGEMENT_AUTHUSERS)
    @UseGuards(RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOneUser(@Param('id') id: string) {
        const checkIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!checkIdValid) throw new HttpException('User not found', 404);
        const user = await this.userService.findUserById(id);
        if (!user) throw new HttpException('User not found', 404);
        return new UserEntity({ firstName: user.firstName, lastName: user.lastName, email: user.email, phoneNumber: user.phoneNumber, roles: user.roles, isActive: user.isActive, password: user.password });
    }

    @Post('register')
    async register(@Body() user: CreateUser) {
        const registerduser = await this.userService.createNewUser(user);
        return new UserEntity({ firstName: registerduser.firstName, lastName: registerduser.lastName, email: registerduser.email, phoneNumber: registerduser.phoneNumber, roles: registerduser.roles, isActive: registerduser.isActive });
    }

    @Patch(':id')
    @Roles(USER_MANAGEMENT_AUTHUSERS)
    @UseGuards(RolesGuard)
    async updateUserInfo(@Param('id') id: string, @Body() unserInfo: UpdateUser) {
        const checkIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!checkIdValid) throw new HttpException('UserId is not valid', 400);
        const checkUser = await this.userService.findUserById(id);
        if (!checkUser) throw new HttpException('User not found', 404);
        const updateduser = await this.userService.updateUser(id, unserInfo);
        return new UserEntity({ firstName: updateduser.firstName, lastName: updateduser.lastName, email: updateduser.email, phoneNumber: updateduser.phoneNumber, roles: updateduser.roles, isActive: updateduser.isActive });
    }

    //delete user; allows only to admin
    @Delete(':id')
    @Roles(['ADMIN'])
    @UseGuards(RolesGuard)
    async deleteUserDetails(@Param('id') id: string) {
        const checkIdValid = mongoose.Types.ObjectId.isValid(id);
        if (!checkIdValid) throw new HttpException('User not found', 404);
        const userToDelete = await this.userService.deleteUser(id);
        if (!userToDelete) throw new HttpException('User not found', 404);
        return { message: 'User deleted successfully' };
    }

}
