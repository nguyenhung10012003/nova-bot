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
import express from 'express';
import { IntegrationService } from './integration.service';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@Controller('integration')
export class IntegrationController {
  constructor(private integrationService: IntegrationService, private config: ConfigService) {}

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
    await this.integrationService.connectFacebook({
      code,
      redirectUri,
      chatflowId,
    });

    res.redirect(redirectUrl);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/')
  async getIntegration(@Query('chatflowId') chatflowId: string, @Query('type') type: string) {
    return this.integrationService.getIntegrations({ chatflowId, type: type as 'FACEBOOK' | 'TELEGRAM' });
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
