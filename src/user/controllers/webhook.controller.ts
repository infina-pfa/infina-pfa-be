import { WebhookAuthGuard } from '@/common/guards';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from '../domain';
import { UserSignedUpEventDto } from './dto/user-signed-up-event.dto';
import { extractNameFromEmail } from '@/common/utils/email';

@Controller('webhook')
@UseGuards(WebhookAuthGuard)
export class WebhookController {
  constructor(private readonly userService: UserService) {}

  @Post('user-signed-up')
  handleUserSignedUp(@Body() body: UserSignedUpEventDto) {
    this.userService.handleUserSignedUp(
      body.record.id,
      extractNameFromEmail(body.record.email),
    );
  }
}
