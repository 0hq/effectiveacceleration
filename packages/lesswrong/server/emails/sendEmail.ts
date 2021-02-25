import { DatabaseServerSetting } from '../databaseSettings';
import type { RenderedEmail } from './renderEmail';
import nodemailer from 'nodemailer';

export const mailUrlSetting = new DatabaseServerSetting<string | null>('mailUrl', null) // The SMTP URL used to send out email

const getMailUrl = () => {
  if (mailUrlSetting.get())
    return mailUrlSetting.get();
  else if (process.env.MAIL_URL)
    return process.env.MAIL_URL;
  else
    return null;
};

// Send an email. Returns true for success or false for failure.
export const sendEmailSmtp = async (email: RenderedEmail): Promise<boolean> => {
  console.log('🚀 ~ file: sendEmail.ts ~ line 18 ~ sendEmailSmtp ~ email', email)
  const mailUrl = getMailUrl();
  
  if (!mailUrl) {
    // eslint-disable-next-line no-console
    console.log("Unable to send email because no mailserver is configured");
    return false;
  }
  
  const transport = nodemailer.createTransport(mailUrl);
  
  const result = await transport.sendMail({
    from: email.from,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
  
  return true;
}
