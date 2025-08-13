declare namespace NodeJS {
  interface ProcessEnv {
    NEXTAUTH_URL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    AUTH_SECRET?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    MONGODB_URI?: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
  }
}


