import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { loadMessages } from "./load-messages";
import { DEFAULT_LOCALE } from "./locales";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && hasLocale(routing.locales, requested)
      ? requested
      : DEFAULT_LOCALE;

  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
    onError(error) {
      // Never crash the UI for missing/formatting issues — fall back instead.
      if (
        error.code === "MISSING_MESSAGE" ||
        error.code === "FORMATTING_ERROR" ||
        error.code === "INVALID_MESSAGE"
      ) {
        return;
      }
      console.warn("[next-intl]", error);
    },
    getMessageFallback({ namespace, key }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
