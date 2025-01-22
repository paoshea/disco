export const env = {
  // Database
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
  
  // Redis
  REDIS_URL: 'redis://localhost:6379',
  
  // Auth
  NEXTAUTH_SECRET: 'test_secret',
  NEXTAUTH_URL: 'http://localhost:3000',
  JWT_SECRET: 'test_jwt_secret',
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: 'test_google_client_id',
  GOOGLE_CLIENT_SECRET: 'test_google_client_secret',
  FACEBOOK_CLIENT_ID: 'test_facebook_client_id',
  FACEBOOK_CLIENT_SECRET: 'test_facebook_client_secret',
  
  // API Keys
  MAPBOX_API_KEY: 'test_mapbox_api_key',
  PUSHER_APP_ID: 'test_pusher_app_id',
  PUSHER_KEY: 'test_pusher_key',
  PUSHER_SECRET: 'test_pusher_secret',
  PUSHER_CLUSTER: 'test_pusher_cluster',
  
  // SMTP
  SMTP_HOST: 'test.smtp.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test@test.com',
  SMTP_PASSWORD: 'test_smtp_password',
  
  // Feature Flags
  ENABLE_WEBSOCKETS: 'true',
  ENABLE_PUSH_NOTIFICATIONS: 'true',
  
  // Other
  NODE_ENV: 'test'
};
