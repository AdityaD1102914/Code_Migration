import { HttpException, Injectable } from '@nestjs/common';
import { User } from '../user/models/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/services/user.service';
import { AuthPayload } from './dtos/Auth.dto';


@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService, private userService: UserService) { } // inject User model here

    async validateUser(userCreds: AuthPayload): Promise<User> {
        const user = await this.userService.findUserByEmail(userCreds.username);
        if (user && await bcrypt.compare(userCreds.password, user.password)) {
            return user;
        }
        return null;
    }

    async signInUser(userEmail: string) {
        const user: any = await this.userService.findUserByEmail(userEmail);
        if (user) {
            const payload = { sub: user._id, email: user.email, roles: user.roles }
            const accessToken = this.jwtService.sign(payload);
            return { accessToken }
        }
        return null;
    }

}
