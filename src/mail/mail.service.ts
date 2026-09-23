import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Envío por SMTP configurable con variables de entorno (SMTP_HOST, SMTP_PORT,
// SMTP_USER, SMTP_PASS, MAIL_FROM). Sirve igual con una cuenta Gmail (clave de
// aplicación), Brevo, Resend u otro: cambiar de proveedor no toca código.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null | undefined;

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return Boolean(this.config.get<string>('SMTP_HOST') && this.config.get<string>('MAIL_FROM'));
  }

  private getTransporter(): Transporter | null {
    if (this.transporter !== undefined) return this.transporter;
    if (!this.isConfigured) return (this.transporter = null);
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: user ? { user, pass: this.config.get<string>('SMTP_PASS') } : undefined,
    });
    return this.transporter;
  }

  /** Devuelve true si se entregó al servidor SMTP; nunca lanza (un correo caído no debe romper el flujo). */
  async send(message: MailMessage): Promise<boolean> {
    const transporter = this.getTransporter();
    if (!transporter) {
      if (this.config.get<string>('NODE_ENV') === 'production') {
        this.logger.error('Correo no configurado (falta SMTP_HOST / MAIL_FROM): no se envió el mensaje.');
      } else {
        // Solo fuera de producción: permite probar la recuperación sin proveedor de correo.
        this.logger.warn(`[DEV] Correo no configurado. Mensaje para ${message.to}:\n${message.text}`);
      }
      return false;
    }
    try {
      await transporter.sendMail({ from: this.config.get<string>('MAIL_FROM'), ...message });
      return true;
    } catch (error: any) {
      this.logger.error(`No se pudo enviar el correo a un destinatario: ${error?.message}`);
      return false;
    }
  }
}
