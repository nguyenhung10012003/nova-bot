import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { IntegrationService } from './integration.service';

@Controller('integration')
export class IntegrationController {
  constructor(
    private integrationService: IntegrationService,
    private config: ConfigService,
  ) {}

  @Get('facebook')
  async facebookAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: express.Response,
  ) {
    if (!state) return new BadRequestException('Missing state');
    const { redirectUrl, chatflowId } = JSON.parse(decodeURIComponent(state));
    if (!code) {
      return res.redirect(`${redirectUrl}?error=OAuthFailed`);
    }
    const redirectUri = `${this.config.get('BASE_URL')}/integration/facebook`;
    try {
      await this.integrationService.connectFacebook({
        code,
        redirectUri,
        chatflowId,
      });
    } catch (error) {
      return res.redirect(redirectUrl);
    }

    res.redirect(redirectUrl);
  }

  @Get('facebook/connect')
  async connectFacebook(
    @Query('chatflowId') chatflowId: string,
    @Query('redirectUrl') redirectUrl: string,
    @Res() res: express.Response,
  ) {
    const redirectUri = `${this.config.get('BASE_URL')}/integration/facebook`;
    const state = encodeURIComponent(
      JSON.stringify({ redirectUrl, chatflowId }),
    );
    const clientId = this.config.get('FACEBOOK_APP_ID');
    const scope = 'pages_show_list,pages_messaging';
    const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
    return res.redirect(url);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getIntegration(
    @Query('chatflowId') chatflowId: string,
    @Query('type') type: string,
  ) {
    return this.integrationService.getIntegrations({
      chatflowId,
      type: type as 'FACEBOOK' | 'TELEGRAM',
    });
  }

  @UseGuards(AccessTokenGuard)
  @Get('/:id')
  async getIntegrationById(@Param('id') id: string) {
    return this.integrationService.getIntegration({ id });
  }

  @UseGuards(AccessTokenGuard)
  @Delete('/:id')
  async deleteIntegration(@Param('id') id: string) {
    return this.integrationService.deleteIntegration({ id });
  }
}
