import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { supabase } from './supabase';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role: string;
    teamId: number | null;
    isAdmin: boolean;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Ingen authorization header');
    }

    // Format: "Bearer eyJhbG..."
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Ingen token');
    }

    try {
      // Validera token med Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Ogiltig token');
      }

      // Hämta profil med roll och team
      const profile = await this.prisma.profile.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          teamId: true,
        },
      });

      // Lägg till user på request med roll och team-info
      request.user = {
        sub: user.id,
        email: user.email || '',
        role: profile?.role || 'viewer',
        teamId: profile?.teamId || null,
        isAdmin: profile?.role === 'admin',
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token-validering misslyckades');
    }
  }
}
