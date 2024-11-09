import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { HttpException } from "../../common/exceptions/HttpExceptions";
import MailRepository from "./mailer.repository";
import HttpStatusCodes from "../../common/constants/http-status-codes";

class MailService {
    private transporter: nodemailer.Transporter | undefined;
    private MailGenerator: Mailgen | undefined;


    static async findEmailById(id: number) {

      const email = await MailRepository.findEmailById(id);

      if(!email) throw new HttpException(HttpStatusCodes.NOT_FOUND, `Email with id ${id} not found.`);

      return email;
    }

    configure(email: string, appPassword: string): void {
        const config = {
            host: 'smtp.gmail.com', // Host SMTP khusus
            port: 587, // Port SMTP, sesuaikan dengan port yang digunakan oleh host
            secure: false, // Gunakan true jika server SMTP memerlukan TLS/SSL
            auth: {
                user: email,
                pass: appPassword
            }
        };

        this.transporter = nodemailer.createTransport(config);

        this.MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Mailgen",
                link: 'https://mailgen.js/'
            }
        });
    }

    async sendMail(
        from: string,
        to: string | string[],
        cc: string | string[],
        bcc: string | string[],
        subject: string,
        content: string,
        attachments: any[] = []
      ): Promise<void> {
        if (!this.transporter || !this.MailGenerator)
          throw new HttpException(500, "MailService is not configured");
      
        const toArray = Array.isArray(to) ? to : [to];
        const ccArray = Array.isArray(cc) ? cc : [cc];
        const bccArray = Array.isArray(bcc) ? bcc : [bcc];
        
      
        const message = {
          from: from,
          to: toArray.join(','),
          cc: ccArray.join(','),
          bcc: bccArray.join(','),
          subject: subject,
          html: content,
          attachments: attachments, 
        };
      
        await this.transporter.sendMail(message);
      }

      static async deleteEmail(id: number): Promise<void> {
        const email = await MailRepository.findEmailById(id);

        if (!email) throw new HttpException(HttpStatusCodes.NOT_FOUND, `Email with id ${id} not found.`)
        await MailRepository.deleteEmailById(email.id);

        return;
      } 
 
}

export default MailService;

