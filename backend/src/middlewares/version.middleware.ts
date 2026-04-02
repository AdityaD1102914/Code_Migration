import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";

@Injectable()
export class VersionMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        const version = req.headers['api-version'];
        if (!version) {
            throw new HttpException('API version not specified', HttpStatus.BAD_REQUEST);
        }
        req.version = version;
        next();
    }
}