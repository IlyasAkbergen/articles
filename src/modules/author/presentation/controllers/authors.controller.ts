import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAuthorCommand } from '../../application/commands/create-author.command';
import { 
  GetAllAuthorsQuery, 
  GetAuthorByIdQuery, 
  GetAuthorByEmailQuery 
} from '../../application/queries/author.queries';
import { CreateAuthorDto } from '../dtos/request.dtos';
import { AuthorResponseDto } from '../dtos/response.dtos';
import { Author } from '../../domain/entities/author.entity';

@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createAuthor(@Body() createAuthorDto: CreateAuthorDto): Promise<AuthorResponseDto> {
    const command = new CreateAuthorCommand(
      createAuthorDto.firstName,
      createAuthorDto.lastName,
      createAuthorDto.email,
    );

    const author = await this.commandBus.execute<CreateAuthorCommand, Author>(command);

    return this.mapToResponseDto(author);
  }

  @Get()
  async getAllAuthors(): Promise<AuthorResponseDto[]> {
    const query = new GetAllAuthorsQuery();
    const authors = await this.queryBus.execute<GetAllAuthorsQuery, Author[]>(query);

    return authors.map(author => this.mapToResponseDto(author));
  }

  @Get(':id')
  async getAuthorById(@Param('id') id: string): Promise<AuthorResponseDto | null> {
    const query = new GetAuthorByIdQuery(id);
    const author = await this.queryBus.execute<GetAuthorByIdQuery, Author | null>(query);

    return author ? this.mapToResponseDto(author) : null;
  }

  @Get('email/:email')
  async getAuthorByEmail(@Param('email') email: string): Promise<AuthorResponseDto | null> {
    const query = new GetAuthorByEmailQuery(email);
    const author = await this.queryBus.execute<GetAuthorByEmailQuery, Author | null>(query);

    return author ? this.mapToResponseDto(author) : null;
  }

  private mapToResponseDto(author: Author): AuthorResponseDto {
    return {
      id: author.id,
      firstName: author.fullName.getFirstName(),
      lastName: author.fullName.getLastName(),
      fullName: author.fullName.getFullName(),
      email: author.email.toString(),
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  }
}
