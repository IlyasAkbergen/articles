export class GetAllAuthorsQuery {}

export class GetAuthorByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetAuthorByEmailQuery {
  constructor(public readonly email: string) {}
}
