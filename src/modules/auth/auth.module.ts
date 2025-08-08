import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserRepository } from './domain/repositories/user.repository';
import { OtpRepository } from './domain/repositories/otp.repository';
import { OtpService } from './application/services/otp.service';

import {
  RegisterUserCommandHandler,
  VerifyOtpCommandHandler,
  LoginCommandHandler,
  ResendOtpCommandHandler,
} from './application/handlers';

import { UserEntity } from './infrastructure/persistence/user.entity';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository';
import { RedisOtpRepository } from './infrastructure/persistence/redis-otp.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { AuthController } from './presentation/controllers/auth.controller';

const CommandHandlers = [
  RegisterUserCommandHandler,
  VerifyOtpCommandHandler,
  LoginCommandHandler,
  ResendOtpCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    OtpService,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: OtpRepository,
      useClass: RedisOtpRepository,
    },
  ],
  exports: [
    JwtAuthGuard,
    RolesGuard,
    UserRepository,
    TypeOrmModule,
  ],
})
export class AuthModule {}
