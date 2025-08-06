import { Author } from '../entities/author.entity';

export abstract class AuthorRepository {
  abstract save(author: Author): Promise<Author>;
  abstract findById(id: string): Promise<Author | null>;
  abstract findAll(): Promise<Author[]>;
  abstract findByEmail(email: string): Promise<Author | null>;
  abstract delete(id: string): Promise<void>;
}
