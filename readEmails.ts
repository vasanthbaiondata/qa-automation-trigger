import * as dotenv from 'dotenv';
dotenv.config();

const Imap = require('imap');
const { simpleParser } = require('mailparser');

const user = process.env.EMAIL_USER!;
const password = process.env.EMAIL_PASS!;
const host = process.env.IMAP_HOST!;
const port = parseInt(process.env.IMAP_PORT || '993', 10);
const tls = process.env.IMAP_TLS === 'true';

function formatDate(date: Date) {
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function fetchLatestOtp(minutesAgo = 20): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const imap = new Imap({
      user,
      password,
      host,
      port,
      tls,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 60000,
      connTimeout: 60000
    });

    imap.once('error', (err: Error) => reject(err));

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err: any, box: any) => {
        if (err) return reject(err);

        const sinceDate = new Date(Date.now() - minutesAgo * 60 * 1000);
        imap.search([['SINCE', formatDate(sinceDate)]], (err: any, results: number[]) => {
          if (err) return reject(err);
          if (!results || results.length === 0) return reject(new Error('No recent emails found'));

          const f = imap.fetch(results.reverse(), { bodies: '' });
          let otpFound = false;

          f.on('message', (msg: any) => {
            let emailBuffer = '';
            msg.on('body', (stream: any) => {
              stream.on('data', (chunk: Buffer) => { emailBuffer += chunk.toString('utf8'); });
            });

            msg.once('end', async () => {
              if (otpFound) return;

              try {
                const parsed = await simpleParser(emailBuffer);

                // Only process emails from TransFi OTP sender
                const fromAddress = parsed.from?.value[0]?.address || '';
                if (!fromAddress.includes('no-reply@transfi.com')) return;

                // Combine text + HTML, strip non-digit characters except digits
                const body = ((parsed.text || '') + (parsed.html || '').replace(/<[^>]+>/g, ''))
                  .replace(/[^\d]/g, ' ');

                const subject = parsed.subject || '';
                const emailDate = parsed.date || new Date(0);

                if (emailDate.getTime() < sinceDate.getTime()) return;

                console.log('--- Email ---');
                console.log('Subject:', subject);

                // Match first 6-digit number not all zeros
                const otpMatch = body.match(/\b(?!0{6})\d{6}\b/);
                if (otpMatch) {
                  otpFound = true;
                  resolve(otpMatch[0]);
                  imap.end();
                }
              } catch (err) {
                console.error('Parsing error:', err);
              }
            });
          });

          f.once('error', (fetchErr: Error) => reject(fetchErr));

          f.once('end', () => {
            if (!otpFound) reject(new Error('No valid OTP found in recent emails'));
            imap.end();
          });
        });
      });
    });

    imap.connect();
  });
}

// Usage
(async () => {
  try {
    console.log('Fetching latest OTP...');
    const otp = await fetchLatestOtp(20); // last 20 minutes
    console.log('Latest OTP:', otp);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Failed to fetch OTP:', err.message);
    } else {
      console.error('Failed to fetch OTP:', err);
    }
  }
})();
