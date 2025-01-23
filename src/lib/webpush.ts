import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('VAPID keys must be set in environment variables');
}

webpush.setVapidDetails(
  'mailto:support@disco.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export { webpush };
