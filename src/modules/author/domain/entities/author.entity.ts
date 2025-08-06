import { v4 as uuidv4 } from 'uuid';
import { FullName } from '../value-objects/full-name.value-object';
import { Email } from '../value-objects/email.value-object';

export class Author
{
  private constructor(
    public readonly id: string,
    public readonly fullName: FullName,
    public readonly email: Email,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(fullName: FullName, email: Email): Author 
  {
    const now = new Date();

    return new Author(uuidv4(), fullName, email, now, now);
  }

  static reconstruct(
    id: string,
    fullName: FullName,
    email: Email,
    createdAt: Date,
    updatedAt: Date,
  ): Author 
  {
    return new Author(id, fullName, email, createdAt, updatedAt);
  }

  updateFullName(fullName: FullName): Author 
  {
    return new Author(
      this.id,
      fullName,
      this.email,
      this.createdAt,
      new Date(),
    );
  }

  updateEmail(email: Email): Author 
  {
    return new Author(
      this.id,
      this.fullName,
      email,
      this.createdAt,
      new Date(),
    );
  }
}
