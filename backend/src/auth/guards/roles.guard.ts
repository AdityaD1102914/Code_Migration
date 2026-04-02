import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Roles } from "../../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflactor: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflactor.get(Roles, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (requiredRoles.some(requiredRole => user.roles.includes(requiredRole))) {
            return true;
        }
        return false;
    }
}
