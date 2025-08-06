import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleRepository } from '../../domain/repositories/article.repository';
import { Article } from '../../domain/entities/article.entity';
import { ArticleEntity } from './article.entity';
import { AuthorEntity } from '../../../author/infrastructure/persistence/author.entity';
import { Author } from '../../../author/domain/entities/author.entity';
import { ArticleTitle } from '../../domain/value-objects/article-title.value-object';
import { ArticleContent } from '../../domain/value-objects/article-content.value-object';
import { FullName } from '../../../author/domain/value-objects/full-name.value-object';
import { Email } from '../../../author/domain/value-objects/email.value-object';

@Injectable()
export class TypeOrmArticleRepository implements ArticleRepository {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
  ) {}

  async save(article: Article): Promise<Article> {
    const entity = this.mapToEntity(article);
    const savedEntity = await this.articleRepository.save(entity);

    // Load the article with author relation after saving
    const entityWithAuthor = await this.articleRepository.findOne({
      where: { id: savedEntity.id },
      relations: ['author'],
    });

    if (!entityWithAuthor) {
      throw new Error('Failed to retrieve saved article');
    }

    return this.mapToDomain(entityWithAuthor);
  }

  async findById(id: string): Promise<Article | null> {
    const entity = await this.articleRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!entity) {
      return null;
    }

    return this.mapToDomain(entity);
  }

  async findAll(): Promise<Article[]> {
    const entities = await this.articleRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapToDomain(entity));
  }

  async findByAuthorId(authorId: string): Promise<Article[]> {
    const entities = await this.articleRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.mapToDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.articleRepository.delete(id);
  }

  private mapToEntity(article: Article): ArticleEntity {
    const entity = new ArticleEntity();
    entity.id = article.id;
    entity.title = article.title.toString();
    entity.content = article.content.toString();
    entity.authorId = article.author.id;
    entity.isPublished = article.isPublished;
    entity.createdAt = article.createdAt;
    entity.updatedAt = article.updatedAt;
    entity.publishedAt = article.publishedAt;

    return entity;
  }

  private mapToDomain(entity: ArticleEntity): Article {
    const author = Author.reconstruct(
      entity.author.id,
      new FullName({
        firstName: entity.author.firstName,
        lastName: entity.author.lastName,
      }),
      new Email(entity.author.email),
      entity.author.createdAt,
      entity.author.updatedAt,
    );

    return Article.reconstruct(
      entity.id,
      new ArticleTitle({ value: entity.title }),
      new ArticleContent({ value: entity.content }),
      author,
      entity.isPublished,
      entity.createdAt,
      entity.updatedAt,
      entity.publishedAt,
    );
  }
}
