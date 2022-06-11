declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      PWD: string;

      JWT_SECRET: string;
      JWT_EXPIRATION: string;
      JWT_REFRESH_SECRET: string;
      JWT_REFRESH_EXPIRATION: string;
      SESSION_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_SECRET: string;
      GOOGLE_CALLBACK: string;
      INTRA_CLIENT_ID: string;
      INTRA_SECRET: string;
      INTRA_CALLBACK: string;
      INTRA_AUTHORIZATION_URL: string;
      INTRA_TOKEN_ENDPOINT: string;
      POSTGRES_PORT: string;
      POSTGRES_USER: string;
      POSTGRES_HOST: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_DB: string;
      FRONTEND_URL: string;
      TWO_FACTOR_AUTHENTICATION_APP_NAME: string;
    }
  }
}
