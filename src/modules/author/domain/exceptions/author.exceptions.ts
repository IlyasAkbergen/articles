export class AuthorDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorDomainException';
  }
}

export class AuthorAlreadyExistsException extends AuthorDomainException {
  constructor(email: string) {
    super(`Author with email '${email}' already exists`);
    this.name = 'AuthorAlreadyExistsException';
  }
}

export class AuthorNotFoundException extends AuthorDomainException {
  constructor(identifier: string) {
    super(`Author not found: ${identifier}`);
    this.name = 'AuthorNotFoundException';
  }
}

export class AuthorValidationException extends AuthorDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorValidationException';
  }
}
