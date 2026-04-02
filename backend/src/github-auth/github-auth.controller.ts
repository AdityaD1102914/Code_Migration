import { Body, Controller, Get, HttpException, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { GithubGuard } from 'src/auth/guards/github.guard';
import { GithubauthService } from './githubauth.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CreateGithubApp } from './dto/create-newapp.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { githuseceretKey } from '../config/config';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
// import {githubSe}
@Controller('github')

@UseGuards(JwtAuthGuard)
export class GithubAuthController {

    constructor(private githubservice: GithubauthService, private jwtService: JwtService, private configService: ConfigService) { }

    @Get('/connect')
    async getGithubAppUrl() {
        // console.log('user', user);
        return this.githubservice.getGithubAppUrl();
    }

    @Post('save-installation')
    async gitHubCAllback(@Body() body: any, @CurrentUser() user: any) {
        console.log('On redirect url');
        try {
            const installationId = body.installation_id;
            console.log('after installation body:', body);
            //save the installation id on db with userId
            if (installationId) {
                const appInfo: CreateGithubApp = {
                    installationId,
                    userId: user._id,
                    githubToken: null
                }

                //TODO: verify if the App is existing
                const savedresult = this.githubservice.saveInstalledApp(appInfo)
                return savedresult;
            }
        } catch (e) {
            throw new HttpException(`Comething went wrong in Installation : ${e}`, 500);
        }
    }

    @Get('installed-apps')
    async getInatallationData(
        @Query('userId') userId: string,
        @Query('instId') instId: string,
    ) {
        let filterOptions = {}
        if (userId) {
            filterOptions = { ...filterOptions, ["userId"]: userId }
        } if (instId) {
            filterOptions = { ...filterOptions, ["installationId"]: instId }
        }
        return this.githubservice.getInstalledAppInfo(userId);
    }

    @Get('generateAccessToken/:instId')
    async generateAccessTokenAndSave(@Param('instId') instId: string, @CurrentUser() user: any) {
        if (!instId) {
            throw new HttpException('No Installation Id found', 400)
        }
        try {
            // const payload = { userId: user._id, installationId: instId };
            const token = jwt.sign({
                iat: Math.floor(Date.now() / 1000) - 60,
                exp: Math.floor(Date.now() / 1000) + (10 * 60),
                iss: this.configService.get<number>('GITHUB_APP_ID') || 2318091 //'2318091'//github app Id
            }, githuseceretKey, { algorithm: 'RS256' });
            console.log('newToken', token);
            if (token) {
                try {
                    const githubToken = await this.githubservice.getInstallationToken(instId, token);
                    console.log('githubToken', githubToken.data);
                    if (githubToken.data && githubToken.data?.token) {
                        const updatedOne = await this.githubservice.updateInstalledApp(instId, githubToken.data);
                        console.log('updated object', updatedOne);
                        return updatedOne;
                    }
                    return githubToken;
                } catch (e) {
                    console.log('error', e);
                    throw new HttpException(`${e.message}`, e.status)
                }

            }
        } catch (e) {
            throw new HttpException(e, 500)
        }
    }


    @Put('updateApp/:instId')
    async updateApp(@Param('instId') instId: string, @Body() body: any) {
        return this.githubservice.updateInstalledApp(instId, body);
    }

    @Get('repos/:id') //call this api once intially and when need to get updated repo access after any configuration changes on gitapp
    async getAccessedRepos(@Param('id') appId: string) {
        const isIdValid = mongoose.Types.ObjectId.isValid(appId);
        if (!isIdValid) throw new HttpException('No Installed App Found', 404);
        try {
            //get app
            const foundApp: any = await this.githubservice.findAppById(appId);
            // console.log('foundApp', foundApp);
            if (foundApp) {
                if (foundApp?.githubToken) {
                    // return foundApp;
                    const repos: any = await this.githubservice.fetchRepos(foundApp?.githubToken?.token);
                        const updatedObj = {
                            userId: foundApp.userId,
                            installationId: foundApp.installationId,
                            githubToken: foundApp.githubToken,
                            reposData: repos || null
                        }
                        return await this.githubservice.saveReposToRespectedAppId(appId, updatedObj);
                } else {
                    return `No Git Access Token Available for the ${appId}`
                }
            }
            //get repos using apps accesstoken

        } catch (e) {
            throw new HttpException(`Error, ${e}`, 500);
        }
    }

}
