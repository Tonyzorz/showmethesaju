export interface Locale { code: string; name: string; htmlLang: string }
export const LOCALES: Locale[] = [
  { code: 'ko',    name: '한국어',     htmlLang: 'ko' },
  { code: 'en',    name: 'English',    htmlLang: 'en' },
  { code: 'ja',    name: '日本語',      htmlLang: 'ja' },
  { code: 'zh-cn', name: '简体中文',    htmlLang: 'zh-CN' },
  { code: 'zh-tw', name: '繁體中文',    htmlLang: 'zh-TW' },
  { code: 'es',    name: 'Español',    htmlLang: 'es' },
  { code: 'fr',    name: 'Français',   htmlLang: 'fr' },
  { code: 'de',    name: 'Deutsch',    htmlLang: 'de' },
  { code: 'pt',    name: 'Português',  htmlLang: 'pt' },
  { code: 'vi',    name: 'Tiếng Việt', htmlLang: 'vi' },
  { code: 'th',    name: 'ไทย',        htmlLang: 'th' },
];
export const DEFAULT_LOCALE = 'en';
export const isLocale = (c: string) => LOCALES.some((l) => l.code === c);
