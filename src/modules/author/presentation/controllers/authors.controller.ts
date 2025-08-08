import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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
import { Public } from '../../../auth/infrastructure/decorators/public.decorator';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';

@Controller('authors')
@UseGuards(RolesGuard)
export class AuthorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('admin')
  async createAuthor(
    @Body() createAuthorDto: CreateAuthorDto,
    @CurrentUser() user: any,
  ): Promise<AuthorResponseDto> {
    const command = new CreateAuthorCommand(
      createAuthorDto.firstName,
      createAuthorDto.lastName,
      createAuthorDto.email,
    );

    const author = await this.commandBus.execute<CreateAuthorCommand, Author>(command);

    return this.mapToResponseDto(author);
  }

  @Get()
  @Roles('user', 'admin')
  async getAllAuthors(): Promise<AuthorResponseDto[]> {
    const query = new GetAllAuthorsQuery();
    const authors = await this.queryBus.execute<GetAllAuthorsQuery, Author[]>(query);

    return authors.map(author => this.mapToResponseDto(author));
  }

  @Get(':id')
  @Roles('user', 'admin')
  async getAuthorById(@Param('id') id: string): Promise<AuthorResponseDto | null> {
    const query = new GetAuthorByIdQuery(id);
    const author = await this.queryBus.execute<GetAuthorByIdQuery, Author | null>(query);

    return author ? this.mapToResponseDto(author) : null;
  }

  @Get('email/:email')
  @Roles('user', 'admin')
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
