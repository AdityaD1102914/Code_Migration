import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/services/user.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { AuthPayload } from './dtos/Auth.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService, private userService: UserService) { }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    async userLogin(@Body() userInfo: AuthPayload) {
        const user = await this.authService.signInUser(userInfo.username);
        return user;
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    getStatus(@Req() req: Request) {
        return {
            message: "Authorized",
            statusCode: 200
        }
    }
}
