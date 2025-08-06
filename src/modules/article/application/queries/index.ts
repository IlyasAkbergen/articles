export class GetArticleQuery {
  constructor(public readonly id: string) {}
}

export class GetAllArticlesQuery {
  constructor() {}
}

export class GetArticlesByAuthorQuery {
  constructor(public readonly authorId: string) {}
}
