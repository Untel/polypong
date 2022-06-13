import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/user.entity';

// doc : https://nest-modules.github.io/mailer/docs/mailer.html
@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  logger = new Logger();

  async sendUserConfirmation(user: User, app_name: string, url: string) {
    this.logger.log('in sendUserConfirmation');

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to ft_transcendance. Please confirm your email',
      template: __dirname + '/confirmation',
      context: {
        name: user.name,
        url,
        app_name,
      },
    });
  }

  async sendResetPasswordLink(email: string, url: string) {
    this.logger.log('in sendResetPasswordLink');
    this.logger.log(`mailhog host : ${process.env.MAIL_HOST}`);
    this.logger.log(`mailhog port : ${process.env.MAIL_PORT}`);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Password',
      template: __dirname + '/reset_password',
      context: {
        name: email,
        url,
        app_name: 'ft_transcendance',
      },
    });
  }
}
