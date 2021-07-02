import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Account Created',
      template: './registration',
      context: {
        name: name        
      },
    });
  }
}