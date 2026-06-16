import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailStub } from '../../common/stubs/email.stub';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ConfirmPasswordResetDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserType } from '../../generated/prisma/enums';

@Injectable()
export class AuthService {
  // NestJS automatically injects these services when this class is created
  constructor(
    private readonly prisma: PrismaService,  // handles database queries
    private readonly jwt: JwtService,         // handles JWT token creation/verification
    private readonly email: EmailStub,        // placeholder for email sending
  ) {}

  // ─────────────────────────────────────────
  // UC01 — Register a new passenger account
  // ─────────────────────────────────────────

  async register(dto: RegisterDto) {
    // Step 1: Check if someone already has this email or username.
    // We use OR so a single query covers both cases.
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existingUser) {
      // 409 Conflict — the registration data is already taken
      throw new ConflictException('Email or username is already in use');
    }

    // Step 2: Hash the password before saving it.
    // bcrypt turns the plain-text password into a secure hash.
    // The "10" is the number of salt rounds — higher = more secure but slower.
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Step 3: Generate a random verification token.
    // randomBytes(32) gives us 32 random bytes, which we convert to a hex string.
    // This token is emailed to the user so they can prove they own the address.
    const verificationToken = randomBytes(32).toString('hex');

    // Step 4: Save the new user to the database.
    // isActive is false — the account is locked until they verify their email.
    // All registrations from this endpoint create a PASSENGER account.
    const newUser = await this.prisma.user.create({
      data: {
        username: dto.username,
        name: dto.name,
        surname: dto.surname,
        email: dto.email,
        password: hashedPassword,
        userType: UserType.PASSENGER,
        isActive: false,
        verificationToken: verificationToken,
      },
    });

    // Step 5: Send the verification link via email (stubbed — just logs to console).
    // In a real app this would send an actual email.
    const verificationLink = `http://localhost:3000/api/auth/verify?token=${verificationToken}`;
    await this.email.sendVerificationLink(newUser.email, verificationLink);

    return {
      message: 'Account created! Check your email (console log) to verify your account.',
    };
  }

  // ─────────────────────────────────────────
  // UC01 — Verify email address via the link
  // ─────────────────────────────────────────

  async verifyEmail(token: string) {
    // Step 1: Find the user that has this exact verification token.
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    // If no user has this token, it's either invalid or already used
    if (!user) {
      throw new NotFoundException('Verification link is invalid or has already been used');
    }

    // Step 2: Activate the account and remove the token so it can't be reused.
    const activatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isActive: true,
        verificationToken: null, // clear the token — one-time use only
      },
    });

    // Step 3: Auto-login the user by issuing a JWT token right away (UC01 requirement).
    // The token contains the user's id, email and role — this is the "payload".
    const accessToken = this.jwt.sign({
      sub: activatedUser.id,
      email: activatedUser.email,
      userType: activatedUser.userType,
    });

    return {
      message: 'Email verified! You are now logged in.',
      accessToken,
    };
  }

  // ─────────────────────────────────────────
  // UC02 — Login
  // ─────────────────────────────────────────

  async login(dto: LoginDto) {
    // Step 1: Look up the user by email address.
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Step 2: Check the password.
    // bcrypt.compare hashes the input and compares it to the stored hash.
    // We combine both checks in one if-block so we don't reveal which one failed
    // (a security best practice — don't tell attackers whether the email exists).
    const passwordMatches = user && (await bcrypt.compare(dto.password, user.password));

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Step 3: Make sure the account has been verified.
    if (!user.isActive) {
      throw new UnauthorizedException('Please verify your email address before logging in');
    }

    // Step 4: Create a JWT access token.
    // This token is sent back to the client and must be included in future requests.
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      userType: user.userType,
    });

    return {
      message: 'Login successful',
      accessToken,
      // Send back some basic user info so the frontend can display it
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email,
        userType: user.userType,
      },
    };
  }

  // ─────────────────────────────────────────
  // UC03 — Logout
  // ─────────────────────────────────────────

  async logout(_userId: number) {
    // JWTs are stateless — the server doesn't store them, so there's nothing
    // to "delete" on the server side. We simply tell the client to throw away
    // the token it has stored (e.g. clear localStorage in the browser).
    // In a real production app you'd maintain a blacklist of invalidated tokens,
    // but for this project this approach is fine.
    return { message: 'Logged out successfully. Please remove your token on the client side.' };
  }

  // ─────────────────────────────────────────
  // UC04 — Request a password reset
  //
  // This method handles both branches from the sequence diagram:
  //   - Authenticated branch: the user is already logged in, we already know who they are
  //   - Unauthenticated branch: the user provides their email so we can look them up
  // ─────────────────────────────────────────

  async requestPasswordReset(dto: RequestPasswordResetDto, authenticatedUserId?: number) {
    let user;

    if (authenticatedUserId) {
      // AUTHENTICATED BRANCH: user is logged in — find them directly by their ID
      user = await this.prisma.user.findUnique({ where: { id: authenticatedUserId } });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    } else {
      // UNAUTHENTICATED BRANCH: user provided their email — look them up
      if (!dto.email) {
        throw new BadRequestException('Email address is required');
      }

      user = await this.prisma.user.findUnique({ where: { email: dto.email } });

      // Sequence diagram shows an explicit "Account not found" error
      if (!user) {
        throw new NotFoundException('No account found with that email address');
      }
    }

    // Generate a secure random token for the reset link
    const resetToken = randomBytes(32).toString('hex');

    // Set the token to expire in 1 hour (Date.now() is milliseconds, so we add 3600000)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save the token in the database so we can verify it later
    await this.prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: expiresAt,
      },
    });

    // Send the reset link via email (stubbed — logs to console)
    const resetLink = `http://localhost:3000/api/auth/password-reset/confirm?token=${resetToken}`;
    await this.email.sendPasswordResetLink(user.email, resetLink);

    return { message: 'Password reset link sent. Check your email (console log).' };
  }

  // ─────────────────────────────────────────
  // UC04 — Confirm the new password
  //
  // Called when the user clicks the reset link and submits a new password.
  // Works the same way for both authenticated and unauthenticated users.
  // ─────────────────────────────────────────

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    if (!dto.token) {
      throw new BadRequestException('Reset token is required');
    }

    // Step 1: Find the reset token in the database
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: dto.token },
    });

    // Check the token exists, hasn't been used, and hasn't expired
    if (!resetToken) {
      throw new NotFoundException('Invalid reset token');
    }
    if (resetToken.used) {
      throw new BadRequestException('This reset link has already been used');
    }
    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('This reset link has expired. Please request a new one');
    }

    // Step 2: Hash the new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Step 3: Update the user's password in the database
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Step 4: Mark the token as used so it can't be reused
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    // Sequence diagram ends with "Redirect to login page" — we return a message for now
    return { message: 'Password updated successfully. You can now log in with your new password.' };
  }
}
