import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { getFacebookAccessToken, getFacebookPages } from '../facebook.api';

@Injectable()
export class IntegrationService {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  async connectFacebook({
    code,
    redirectUri,
    chatflowId,
  }: {
    code: string;
    redirectUri: string;
    chatflowId: string;
  }) {
    const clientId = this.configService.get('FACEBOOK_APP_ID');
    const clientSecret = this.configService.get('FACEBOOK_APP_SECRET');
    const accessToken = await getFacebookAccessToken(
      code,
      redirectUri,
      clientId,
      clientSecret,
    );
    const pages = await getFacebookPages('me', accessToken);
    Logger.debug('Get pages from facebook, result: ' + JSON.stringify(pages));
    await this.prismaService.integration.createMany({
      data: pages.map((page) => ({
        chatflowId,
        type: 'FACEBOOK',
        pageId: page.id,
        accessToken: page.access_token,
        name: page.name,
      })),
    });
  }

  async getIntegrations({
    chatflowId,
    type,
  }: {
    chatflowId: string;
    type?: 'FACEBOOK' | 'TELEGRAM';
  }) {
    return this.prismaService.integration.findMany({
      where: {
        chatflowId,
        type,
      },
    });
  }

  async getIntegration({ id }: { id: string }) {
    return this.prismaService.integration.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteIntegration({ id }: { id: string }) {
    return this.prismaService.integration.delete({
      where: {
        id,
      },
    });
  }
}
