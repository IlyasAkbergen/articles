export interface ArticleTitleProps {
  value: string;
}

export class ArticleTitle {
  public readonly value: string;

  constructor(props: ArticleTitleProps) {
    this.validateTitle(props.value);
    this.value = props.value;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }
    if (title.length > 255) {
      throw new Error('Title cannot exceed 255 characters');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: ArticleTitle): boolean {
    return this.value === other.value;
  }
}
