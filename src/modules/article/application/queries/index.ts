import { PaginationOptions } from '../../domain/interfaces/pagination.interface';

export class GetArticleQuery {
  constructor(public readonly id: string) {}
}

export class GetAllArticlesQuery {
  constructor(public readonly paginationOptions?: PaginationOptions) {}
}

export class GetArticlesByAuthorQuery {
  constructor(public readonly authorId: string) {}
}
