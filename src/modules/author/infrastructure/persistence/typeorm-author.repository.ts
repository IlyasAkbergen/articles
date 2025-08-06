import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthorRepository } from '../../domain/repositories/author.repository';
import { Author } from '../../domain/entities/author.entity';
import { AuthorEntity } from './author.entity';
import { FullName } from '../../domain/value-objects/full-name.value-object';
import { Email } from '../../domain/value-objects/email.value-object';

@Injectable()
export class TypeOrmAuthorRepository implements AuthorRepository {
  constructor(
    @InjectRepository(AuthorEntity)
    private readonly authorRepository: Repository<AuthorEntity>,
  ) {}

  async save(author: Author): Promise<Author> {
    const entity = this.mapToEntity(author);
    const savedEntity = await this.authorRepository.save(entity);

    return this.mapToDomain(savedEntity);
  }

  async findById(id: string): Promise<Author | null> {
    const entity = await this.authorRepository.findOne({ where: { id } });

    if (!entity) {
      return null;
    }

    return this.mapToDomain(entity);
  }

  async findAll(): Promise<Author[]> {
    const entities = await this.authorRepository.find({
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapToDomain(entity));
  }

  async findByEmail(email: string): Promise<Author | null> {
    const entity = await this.authorRepository.findOne({ where: { email } });

    if (!entity) {
      return null;
    }

    return this.mapToDomain(entity);
  }

  async delete(id: string): Promise<void> {
    await this.authorRepository.delete(id);
  }

  private mapToEntity(author: Author): AuthorEntity {
    const entity = new AuthorEntity();
    entity.id = author.id;
    entity.firstName = author.fullName.getFirstName();
    entity.lastName = author.fullName.getLastName();
    entity.email = author.email.toString();
    entity.createdAt = author.createdAt;
    entity.updatedAt = author.updatedAt;

    return entity;
  }

  private mapToDomain(entity: AuthorEntity): Author {
    return Author.reconstruct(
      entity.id,
      new FullName({
        firstName: entity.firstName,
        lastName: entity.lastName,
      }),
      new Email(entity.email),
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
