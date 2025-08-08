import { Controller, Get, Post, Body, Param, UseGuards, UseFilters } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
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
import { AuthorExceptionFilter } from '../../infrastructure/filters/author-exception.filter';

@ApiTags('Authors')
@Controller('authors')
@UseGuards(RolesGuard)
@UseFilters(AuthorExceptionFilter)
@ApiBearerAuth('JWT-auth')
export class AuthorsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('admin')
  @ApiOperation({
    summary: 'Create a new author',
    description: 'Creates a new author with the provided information. Only accessible by administrators.',
  })
  @ApiBody({
    type: CreateAuthorDto,
    description: 'Author creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Author created successfully',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
    schema: {
      example: {
        success: false,
        statusCode: 400,
        message: 'Email format is invalid',
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/authors'
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - author with this email already exists',
    schema: {
      example: {
        success: false,
        statusCode: 409,
        message: "Author with email 'iliyas.akbergen@gmail.com' already exists",
        timestamp: '2025-01-01T00:00:00.000Z',
        path: '/authors'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin role required',
  })
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
  @ApiOperation({
    summary: 'Get all authors',
    description: 'Retrieves a list of all authors in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authors retrieved successfully',
    type: [AuthorResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getAllAuthors(): Promise<AuthorResponseDto[]> {
    const query = new GetAllAuthorsQuery();
    const authors = await this.queryBus.execute<GetAllAuthorsQuery, Author[]>(query);

    return authors.map(author => this.mapToResponseDto(author));
  }

  @Get(':id')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get author by ID',
    description: 'Retrieves a specific author by their unique identifier.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Author unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Author retrieved successfully',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getAuthorById(@Param('id') id: string): Promise<AuthorResponseDto | null> {
    const query = new GetAuthorByIdQuery(id);
    const author = await this.queryBus.execute<GetAuthorByIdQuery, Author | null>(query);

    return author ? this.mapToResponseDto(author) : null;
  }

  @Get('email/:email')
  @Roles('user', 'admin')
  @ApiOperation({
    summary: 'Get author by email',
    description: 'Retrieves a specific author by their email address.',
  })
  @ApiParam({
    name: 'email',
    type: String,
    description: 'Author email address',
    example: 'iliyas.akbergen@gmail.com',
  })
  @ApiResponse({
    status: 200,
    description: 'Author retrieved successfully',
    type: AuthorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
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
