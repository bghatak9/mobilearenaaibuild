export const DEV_SOCIAL_CLIENT_ID = "__dev__";

export function isDevSocialClientId(id: string): boolean {
  return id === DEV_SOCIAL_CLIENT_ID;
}
