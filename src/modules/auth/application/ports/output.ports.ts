import { User } from '../../domain/entities/user.entity';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken?: string;
}

export abstract class RegisterUserOutputPort {
  abstract presentSuccess(user: User): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentConflictError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class VerifyOtpOutputPort {
  abstract presentSuccess(response: AuthResponse): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class LoginOutputPort {
  abstract presentSuccess(response: AuthResponse): Promise<void>;
  abstract presentValidationError(errors: string[]): Promise<void>;
  abstract presentUnauthorizedError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}

export abstract class ResendOtpOutputPort {
  abstract presentSuccess(): Promise<void>;
  abstract presentNotFoundError(message: string): Promise<void>;
  abstract presentServerError(message: string): Promise<void>;
}
