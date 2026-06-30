export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const GOOGLE_SIGNIN_ENABLED = GOOGLE_CLIENT_ID.length > 0;
