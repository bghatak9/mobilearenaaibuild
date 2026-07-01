import { DEFAULT_THEME, STORAGE_KEY } from "@/design-system/themes";

/** Runs before paint — Titan Spectrum defaults to dark. */
export function ThemeInitScript() {
  const script = `(function(){try{var k='${STORAGE_KEY}';var d='${DEFAULT_THEME}';var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':d;}var dark=t==='dark';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
