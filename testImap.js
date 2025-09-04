const Imap = require('imap');

const imap = new Imap({
  user: 'vasanthkumar744896@gmail.com',
  password: 'wwuhkkwaipfsxdpv',
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.once('ready', () => console.log('✅ Connected!'));
imap.once('error', (err) => console.error(err));
imap.connect();
