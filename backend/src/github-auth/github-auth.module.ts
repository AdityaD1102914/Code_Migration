import { Module } from '@nestjs/common';
import { GithubAuthController } from './github-auth.controller';
import { GithubauthService } from './githubauth.service';
import { SharedModule } from 'src/shared/shared.module';
import { MongooseModule } from '@nestjs/mongoose';
import { InstalledApp, InstalledAppSchema } from './schema/git-app.schema';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [GithubAuthController],
  imports: [ConfigModule,
    MongooseModule.forFeature([{
      name: InstalledApp.name,
      schema: InstalledAppSchema,
      collection: 'migration-gitapps'
    }])
  ],
  providers: [GithubauthService, JwtService]
})
export class GithubAuthModule { }
