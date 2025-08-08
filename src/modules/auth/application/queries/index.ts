export class GetUserByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetUserByEmailQuery {
  constructor(public readonly email: string) {}
}
