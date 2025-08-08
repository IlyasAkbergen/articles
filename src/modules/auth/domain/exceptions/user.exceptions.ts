export class UserDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserDomainException';
  }
}

export class UserAlreadyExistsException extends UserDomainException {
  constructor(email: string) {
    super(`User with email '${email}' already exists`);
    this.name = 'UserAlreadyExistsException';
  }
}

export class UserNotFoundException extends UserDomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = 'UserNotFoundException';
  }
}

export class UserValidationException extends UserDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'UserValidationException';
  }
}

export class InvalidCredentialsException extends UserDomainException {
  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsException';
  }
}

export class UserNotVerifiedException extends UserDomainException {
  constructor() {
    super('Email not verified. Please verify your email before logging in.');
    this.name = 'UserNotVerifiedException';
  }
}
