import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from '@nova/utils';
import ms from 'ms';
import { PrismaService } from 'src/prisma/prisma.service';

type Token = {
  token: string;
  refreshToken: string;
  userId: string;
  type: string;
  issuedAt: Date;
  expireAt: Date;
};

export type TokenPayload = {
  userId: string;
};

@Injectable()
export class AuthService {
  private secret: string;
  private expriresIn: string;
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    this.secret = process.env.JWT_SECRET;
    this.expriresIn = process.env.JWT_EXPIRES_IN || '1d';
  }

  async validateUser(email: string, password: string): Promise<Token> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      if (compare(password, user.password)) {
        return this.createToken(user.id);
      } else {
        throw new HttpException(
          {
            id: 'PASSWORD_INCORRECT',
            message: 'Password is incorrect',
          },
          403,
        );
      }
    } else {
      throw new HttpException(
        {
          id: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        404,
      );
    }
  }

  async createToken(userId: string): Promise<Token> {
    const payload: TokenPayload = { userId };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: ms(this.expriresIn),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: '7d',
    });
    return {
      token: accessToken,
      refreshToken,
      userId,
      type: 'Bearer',
      issuedAt: new Date(),
      expireAt: new Date(Date.now() + ms(this.expriresIn)),
    };
  }

  async refresh(token: string): Promise<Token> {
    const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
      secret: this.secret,
    });
    return this.createToken(payload.userId);
  }

  async register(email: string, password: string) {
    await this.prisma.user.create({
      data: {
        email,
        password: await hash(password),
      },
    });

    return {
      message: 'User created successfully',
    };
  }
}
