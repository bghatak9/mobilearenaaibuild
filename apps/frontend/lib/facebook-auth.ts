export const FACEBOOK_APP_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? "";

export const FACEBOOK_SIGNIN_ENABLED = FACEBOOK_APP_ID.length > 0;
