import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AuthorEntity } from '../../../author/infrastructure/persistence/author.entity';

@Entity('articles')
export class ArticleEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  content: string;

  @Column('uuid')
  authorId: string;

  @ManyToOne(() => AuthorEntity)
  @JoinColumn({ name: 'authorId' })
  author: AuthorEntity;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;
}
