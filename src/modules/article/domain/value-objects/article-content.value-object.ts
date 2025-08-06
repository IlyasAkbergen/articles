export interface ArticleContentProps {
  value: string;
}

export class ArticleContent {
  public readonly value: string;

  constructor(props: ArticleContentProps) {
    this.validateContent(props.value);
    this.value = props.value;
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: ArticleContent): boolean {
    return this.value === other.value;
  }

  getWordCount(): number {
    return this.value.trim().split(/\s+/).length;
  }

  getCharacterCount(): number {
    return this.value.length;
  }
}
