import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

// This is the shape of the data we put inside the JWT token when we sign it
export interface JwtPayload {
  sub: number;      // "subject" — standard JWT field for the user's ID
  email: string;
  userType: string;
}

// JwtStrategy tells Passport HOW to validate an incoming JWT token.
// It runs automatically whenever a route is decorated with @UseGuards(JwtAuthGuard).
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Tell Passport to look for the token in the Authorization header as a Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // The secret key used to verify the token's signature
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // This method is called automatically after the token's signature is verified.
  // The payload is the data we stored inside the token when we created it.
  // Whatever we return here gets attached to request.user in the controller.
  async validate(payload: JwtPayload) {
    // Double-check the user still exists and is still active in the database
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or account is not active');
    }

    // Return the full user object — NestJS attaches this to the request
    return user;
  }
}
