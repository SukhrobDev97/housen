import { BadRequestException, CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { Message } from 'apps/housen-api/src/libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;
			const bearerToken = request.headers.authorization;
			if (!bearerToken) throw new BadRequestException(Message.TOKEN_NOT_EXIST);

			const token = bearerToken.split(' ')[1],
				authMember = await this.authService.verifyToken(token),
				hasRole = () => roles.indexOf(authMember.memberType) > -1,
				hasPermission: boolean = hasRole();

			if (!authMember || !hasPermission) throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);

			console.log('memberNick[roles] =>', authMember.memberNick);
			request.body.authMember = authMember;
			return true;
		}
        return true;
		// description => http, rpc, gprs and etc are ignored
	}
}
