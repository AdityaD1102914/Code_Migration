import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";



@Injectable()
export class GithubGuard extends AuthGuard('github') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['github-authorization'];
        if (!authHeader) {
            throw new UnauthorizedException('Authorization header is missing');
        }
        return super.canActivate(context);
    }
}