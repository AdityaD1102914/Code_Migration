import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JWTStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    // AuthModule depends on other modules
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET')
        const expiresIn = configService.get<string>('JWT_EXPIREIN') || '1h'
        return {
          secret: secret,
          signOptions: { expiresIn }
        } as unknown
      }
    })

  ],
  providers: [AuthService, LocalStrategy, JWTStrategy],
  controllers: [AuthController]
})
export class AuthModule { }


