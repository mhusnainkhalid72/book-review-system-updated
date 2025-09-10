// src/tests/testMailcow.ts
import 'dotenv/config';
import readline from 'readline';
import { sendMailViaMailcow } from '../services/mailcowService';

type Args = {
  to?: string;
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (let i = 2; i < argv.length; i++) {
    const [k, v] = argv[i].split('=');
    const key = k.replace(/^--/, '');
    const next = v ?? argv[i + 1];
    const needsNext = !v && next && !next.startsWith('--');
    switch (key) {
      case 'to':
      case 'subject':
      case 'text':
      case 'html':
      case 'from':
        (args as any)[key] = needsNext ? next : v;
        if (needsNext) i++;
        break;
    }
  }
  return args;
}

function isEmailListValid(to: string) {
  const emails = to.split(',').map(s => s.trim()).filter(Boolean);
  const simple = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.length > 0 && emails.every(e => simple.test(e));
}

async function ask(question: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer: string = await new Promise(res => rl.question(question, res));
  rl.close();
  return answer.trim();
}

(async () => {
  try {
    console.log('Running Mailcow test...');

    const args = parseArgs(process.argv);

    let to = args.to;
    if (!to) {
      to = await ask('Enter recipient email (comma-separated for multiple): ');
    }
    if (!to || !isEmailListValid(to)) {
      console.error('❌ Invalid or missing --to email(s). Use --to you@example.com or comma-separated list.');
      process.exit(1);
    }

    const subject = args.subject || 'Mailcow test — hello 👋';
    const text = args.text || 'This is a test email sent via Mailcow + Nodemailer.';
    const html = args.html || `<p>This is a <b>test email</b> sent via Mailcow + Nodemailer.</p>`;
    const from = args.from; // optional override

    const res = await sendMailViaMailcow({
      to: to.split(',').map(s => s.trim()),
      subject,
      text,
      html,
      from,
    });

    if (res.ok) {
      console.log(`✅ Test succeeded: ${res.id}`);
      process.exit(0);
    } else {
      console.error('❌ Test failed:', res.error);
      process.exit(2);
    }
  } catch (err: any) {
    console.error('❌ Unexpected error:', err?.message || err);
    process.exit(3);
  }
})();
