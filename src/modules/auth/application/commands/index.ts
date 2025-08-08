export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class VerifyOtpCommand {
  constructor(
    public readonly userId: string,
    public readonly code: string,
  ) {}
}

export class LoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class ResendOtpCommand {
  constructor(public readonly userId: string) {}
}
