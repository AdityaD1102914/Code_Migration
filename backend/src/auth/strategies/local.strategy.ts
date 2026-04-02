
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AuthPayload } from '../dtos/Auth.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authservice: AuthService) {
        super();
    }

    async validate(username: string, password: string) {
        const validUser = await this.authservice.validateUser({ username, password });
        if (!validUser) {
            throw new UnauthorizedException();
        }
        return validUser;
    }

}