import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// This controller handles all authentication-related HTTP requests.
// Every route here is prefixed with /api/auth (set in main.ts + this decorator).
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── UC01 ──────────────────────────────────────────────────────────────────

  // POST /api/auth/register
  // Called when a new user fills in the registration form and submits it.
  // The request body must match RegisterDto (username, name, surname, email, password).
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // GET /api/auth/verify?token=...
  // Called when the user clicks the verification link in their email.
  // The token comes from the URL query string.
  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // ── UC02 ──────────────────────────────────────────────────────────────────

  // POST /api/auth/login
  // Called when a user submits the login form.
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ── UC03 ──────────────────────────────────────────────────────────────────

  // POST /api/auth/logout
  // @UseGuards(JwtAuthGuard) means the request must include a valid JWT token.
  // If the token is missing or invalid, NestJS automatically returns 401.
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: { id: number }) {
    // @CurrentUser() extracts the user object that JwtStrategy put on the request
    return this.authService.logout(user.id);
  }

  // ── UC04 — Password Reset (implemented in next step) ──────────────────────

  // POST /api/auth/password-reset/request
  // Unauthenticated branch: user has to provide their email
  @Post('password-reset/request')
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  // POST /api/auth/password-reset/request-authenticated
  // Authenticated branch: user is already logged in, no need for email lookup
  @UseGuards(JwtAuthGuard)
  @Post('password-reset/request-authenticated')
  requestResetAuthenticated(@CurrentUser() user: { id: number }) {
    return this.authService.requestPasswordReset({} as RequestPasswordResetDto, user.id);
  }

  // POST /api/auth/password-reset/confirm
  // User submits the new password along with the token from the reset email
  @Post('password-reset/confirm')
  confirmReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.confirmPasswordReset(dto);
  }
}
