import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const isLocal = dto.provider === 'local' || !dto.provider;

    if (isLocal) {
      if (!dto.password || !dto.username || !dto.nombre) {
        throw new UnauthorizedException('Faltan campos obligatorios');
      }
    }

    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new UnauthorizedException('El email ya está registrado');
    }

    const hashedPassword =
      isLocal && dto.password ? await bcrypt.hash(dto.password, 10) : null;

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      username: dto.username ?? '',
      nombre: dto.nombre ?? '',
      provider: dto.provider ?? 'local',
      role: 'user',
    });

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nombre: user.nombre,
        provider: user.provider,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto, res: Response) {
    const provider = dto.provider || 'local';

    const user = await this.usersService.findByEmailAndProvider(
      dto.email,
      provider,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Solo verificar contraseña para provider local
    if (provider === 'local') {
      if (!dto.password) {
        throw new UnauthorizedException('Falta la contraseña');
      }
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        nombre: user.nombre,
        provider: user.provider,
        role: user.role,
      },
    };
  }

  async getUserWithRole(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      nombre: user.nombre,
      provider: user.provider,
      role: user.role,
    };
  }
}
