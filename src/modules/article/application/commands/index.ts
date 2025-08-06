export class CreateArticleCommand {
  constructor(
    public readonly title: string,
    public readonly content: string,
    public readonly authorId: string,
  ) {}
}

export class UpdateArticleCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly content?: string,
  ) {}
}

export class DeleteArticleCommand {
  constructor(public readonly id: string) {}
}

export class PublishArticleCommand {
  constructor(public readonly id: string) {}
}

export class UnpublishArticleCommand {
  constructor(public readonly id: string) {}
}
