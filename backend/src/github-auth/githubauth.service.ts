import { HttpException, Injectable, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InstalledApp, GitInstalledAppDocument } from './schema/git-app.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateGithubApp } from './dto/create-newapp.dto';
import axios from 'axios';

@Injectable()
export class GithubauthService {

    constructor(@InjectModel(InstalledApp.name) private installedAppmodel: Model<GitInstalledAppDocument>, private configService: ConfigService) { }

    async getGithubAppUrl() {
        return `https://github.com/apps/${this.configService.get<string>('GITHUB_APP_NAME')}/installations/new`
    }

    async gitHubCallback(installedAppDataObj: any) {
        console.log('found Object', installedAppDataObj)
        const appData = new this.installedAppmodel(installedAppDataObj);

    }

    async getInstalledAppInfo(userId: string) {
        //check if exists aleready
        return this.installedAppmodel.find({ userId: userId }).exec();
    }

    async saveInstalledApp(appInfo: CreateGithubApp) {
        //check if alerady exists
        console.log('body', appInfo);
        // const existingApp = await this.installedAppmodel.find({ installationId: appInfo.installationId }).exec()
        // if (existingApp) {
        //     //
        //     return existingApp;
        // }
        const int = new this.installedAppmodel(appInfo);
        return int.save();
    }

    async getInstallationToken(instId: string, token: string) {
        // try {
        const response = await axios.post(`https://api.github.com/app/installations/${instId}/access_tokens`, {},
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/vnd.github+json"
                }
            }
        );
        return response;
        // } catch (error) {
        //     // Handle errors appropriately (e.g., log, throw a NestJS exception)
        //     console.error('Error fetching data:', error);
        //     throw new Error('Failed to fetch data from external API');
        // }
    }

    async updateInstalledApp(instId: string, tokenObject: any) {
        console.log('updating', instId, tokenObject)
        const findApp = await this.installedAppmodel.findOne({ installationId: instId.toString() })
        if (!findApp) {
            return 'No Installed App found with this Id';
        }
        //Fetch Repos to update with
        const repoRes = this.fetchRepos(tokenObject.token);
        console.log(repoRes);
        const updatedObj = { userId: findApp.userId, installationId: findApp.installationId, githubToken: tokenObject }
        return this.installedAppmodel.findByIdAndUpdate(findApp._id, updatedObj, { new: true })
        // return this.installedAppmodel.updateOne({ installationId: instId.toString() }, { $set: { accessToken: tokenObject } }, { returnDocument: 'after' })
    }

    async fetchRepos(access_token: string) {
        //Get all access repos for the reposective installtionId Accesstoken
        try {
            const response = await axios.get('https://api.github.com/installation/repositories', {
                headers: {
                    "Authorization": `Bearer ${access_token}`,
                    "Accept": "application/vnd.github+json"
                }
            })
            return response?.data || null;
        } catch (e) {
            if (e.response.status === '401') {
                throw new HttpException(`${e.response.message} Github Action`, 500);
            }
            throw new HttpException(e.message, 500);
        }
    }

    async findAppById(id: string) {
        //check if exists aleready
        return this.installedAppmodel.findById(id);
    }

    async saveReposToRespectedAppId(appId: string, updatedObj: any) {
        return this.installedAppmodel.findByIdAndUpdate(appId, updatedObj, { new: true });
    }

}
