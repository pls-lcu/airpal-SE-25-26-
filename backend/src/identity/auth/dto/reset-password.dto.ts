import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

// Used for the unauthenticated branch: user submits their email to receive the reset link
export class RequestPasswordResetDto {
  @IsEmail()
  email: string;
}

// Used when the user clicks the reset link and submits a new password
export class ConfirmPasswordResetDto {
  // The token that came from the reset link URL
  @IsOptional()
  @IsString()
  token?: string;

  // Same password rules as registration
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  newPassword: string;
}
