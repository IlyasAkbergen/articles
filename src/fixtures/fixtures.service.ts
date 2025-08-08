import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserCommand } from '../modules/auth/application/commands';
import { CreateAuthorCommand } from '../modules/author/application/commands/create-author.command';
import { UserRepository } from '../modules/auth/domain/repositories/user.repository';
import { AuthorRepository } from '../modules/author/domain/repositories/author.repository';
import { User } from '../modules/auth/domain/entities/user.entity';
import { Email } from '../modules/auth/domain/value-objects/email.value-object';
import { UserRole } from '../modules/auth/domain/value-objects/user-role.value-object';

@Injectable()
export class FixturesService {
  private readonly logger = new Logger(FixturesService.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly userRepository: UserRepository,
    private readonly authorRepository: AuthorRepository,
  ) {}

  async seedData(): Promise<void> {
    this.logger.log('🌱 Starting data seeding...');

    try {
      await this.createAdminUser();
      await this.createDefaultAuthor();
      this.logger.log('✅ Data seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Data seeding failed:', error.message);
      throw error;
    }
  }

  private async createAdminUser(): Promise<void> {
    const adminEmail = 'admin@articles.com';

    const existingAdmin = await this.userRepository.findByEmail(adminEmail);
    if (existingAdmin) {
      this.logger.log('👤 Admin user already exists, skipping...');

      return;
    }

    try {
      const result = await this.commandBus.execute(
        new RegisterUserCommand(adminEmail, 'Admin123!'),
      );

      const adminUser = await this.userRepository.findByEmail(adminEmail);
      if (adminUser) {
        const verifiedUser = adminUser.verifyEmail();
        const adminUserWithRole = this.updateUserRole(verifiedUser, 'admin');
        await this.userRepository.save(adminUserWithRole);
      }

      this.logger.log(`👤 Admin user created: ${adminEmail} with password: Admin123!`);
    } catch (error) {
      this.logger.error(`Failed to create admin user: ${error.message}`);
      throw error;
    }
  }

  private async createDefaultAuthor(): Promise<void> {
    const authorEmail = 'iliyas.akbergen@gmail.com';

    const existingAuthor = await this.authorRepository.findByEmail(authorEmail);
    if (existingAuthor) {
      this.logger.log('✍️ Default author already exists, skipping...');

      return;
    }

    try {
      await this.commandBus.execute(
        new CreateAuthorCommand('Iliyas', 'Akbergen', authorEmail),
      );
      
      this.logger.log(`✍️ Default author created: Iliyas Akbergen (${authorEmail})`);
    } catch (error) {
      this.logger.error(`Failed to create default author: ${error.message}`);
      throw error;
    }
  }

  private updateUserRole(user: User, role: 'admin' | 'user'): User {
    return User.reconstruct(
      user.id,
      user.email,
      user.password,
      new UserRole(role),
      user.isEmailVerified,
      user.createdAt,
      new Date(),
    );
  }
}
