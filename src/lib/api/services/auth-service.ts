import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import prisma from '../db';
import { AdminModel, LoginResponse } from '../types/auth';

export class AuthService {
  async login(email: string, password: string): Promise<LoginResponse | null> {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return null;
    }

    return this.generateTokens(admin as unknown as AdminModel);
  }

  private generateTokens(admin: AdminModel): LoginResponse {
    const access_token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        type: 'access',
      },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    const refresh_token = jwt.sign(
      {
        adminId: admin.id,
        email: admin.email,
        type: 'refresh',
      },
      config.jwtSecret,
      { expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      access_token,
      refresh_token,
    };
  }

  async verifyToken(token: string): Promise<AdminModel | null> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        adminId?: string;
        type?: string;
      };

      if (!decoded.adminId || decoded.type !== 'access') {
        return null;
      }

      const admin = (await prisma.admin.findUnique({
        where: { id: decoded.adminId },
      })) as unknown as AdminModel | null;

      return admin;
    } catch {
      return null;
    }
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse | null> {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return this.generateTokens(admin as unknown as AdminModel);
  }
}
