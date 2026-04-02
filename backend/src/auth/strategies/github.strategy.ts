import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private configService: ConfigService) {
        console.log('on Github strategy')
        super({
            clientID: configService.get<string>("GITHUB_CLIENT_ID"),
            clientSecret: configService.get<string>("GITHUB_CLIENT_SECRET"),
            callbackURL: configService.get<string>("GITHUB_CALLBACK_URL"),
            scope: ['repo', 'user:email'], // **Crucial: Request the 'repo' scope**
        })
    }

    // async validate(accessToken: string,
    //     refreshToken: string,
    //     profile: any,
    //     done: Function,): Promise<any> {
    //     console.log('on Validate')
    //     const user = {
    //         githubId: profile.id,
    //         username: profile.username,
    //         displayName: profile.displayName,
    //         accessToken, // Store the GitHub Access Token
    //         // You would typically save this user and the accessToken to your database
    //     }
    //     done(null, user);
    // }
    async validate(payload: any) {
        return payload;
    }
}