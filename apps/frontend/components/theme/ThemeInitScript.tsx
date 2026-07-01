import { DEFAULT_THEME, STORAGE_KEY } from "@/design-system/themes";

/** Titan Spectrum is dark-only — always lock before paint. */
export function ThemeInitScript() {
  const script = `(function(){try{document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';localStorage.setItem('${STORAGE_KEY}','${DEFAULT_THEME}');}catch(e){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
