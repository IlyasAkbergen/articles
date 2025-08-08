export class ArticleDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArticleDomainException';
  }
}

export class ArticleAlreadyExistsException extends ArticleDomainException {
  constructor(title: string) {
    super(`Article with title '${title}' already exists`);
    this.name = 'ArticleAlreadyExistsException';
  }
}

export class ArticleNotFoundException extends ArticleDomainException {
  constructor(identifier: string) {
    super(`Article not found: ${identifier}`);
    this.name = 'ArticleNotFoundException';
  }
}

export class ArticleValidationException extends ArticleDomainException {
  constructor(message: string) {
    super(message);
    this.name = 'ArticleValidationException';
  }
}

export class ArticleAlreadyPublishedException extends ArticleDomainException {
  constructor() {
    super('Article is already published');
    this.name = 'ArticleAlreadyPublishedException';
  }
}

export class ArticleAlreadyUnpublishedException extends ArticleDomainException {
  constructor() {
    super('Article is already unpublished');
    this.name = 'ArticleAlreadyUnpublishedException';
  }
}
