import { CacheInterceptor } from "@nestjs/cache-manager";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class HTTPCacheInterceptor extends CacheInterceptor {
    protected trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest();
        const { httpAdapter } = this.httpAdapterHost;
        const isGetRequest = httpAdapter.getRequestMethod(request) === "GET";
        const excludePath = [
            '/api/v1/files/download'
        ]
        if (!isGetRequest || (isGetRequest && excludePath.includes(httpAdapter.getRequestUrl(request)))) {
            return undefined;
        }
        //handling to not cache he stream file
        if(request.url.startsWith('/api/v1/files/download') || request.url.startsWith('/api/v1/devicereadings') || request.url.startsWith('/api/v1/github')) {
            return undefined;
        }
        return httpAdapter.getRequestUrl(request);
    }
}