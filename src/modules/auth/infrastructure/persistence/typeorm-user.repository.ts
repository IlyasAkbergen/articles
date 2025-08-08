import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from './user.entity';
import { Email } from '../../domain/value-objects/email.value-object';
import { Password } from '../../domain/value-objects/password.value-object';
import { UserRole } from '../../domain/value-objects/user-role.value-object';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const userEntity = new UserEntity();
    userEntity.id = user.id;
    userEntity.email = user.email.toString();
    userEntity.password = user.password.toString();
    userEntity.role = user.role.toString();
    userEntity.isEmailVerified = user.isEmailVerified;
    userEntity.createdAt = user.createdAt;
    userEntity.updatedAt = user.updatedAt;

    const savedEntity = await this.userRepository.save(userEntity);
    
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } });
    
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    
    return userEntities.map(entity => this.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  private toDomain(userEntity: UserEntity): User {
    return User.reconstruct(
      userEntity.id,
      new Email(userEntity.email),
      Password.fromHash(userEntity.password),
      new UserRole(userEntity.role as 'admin' | 'user'),
      userEntity.isEmailVerified,
      userEntity.createdAt,
      userEntity.updatedAt,
    );
  }
}
