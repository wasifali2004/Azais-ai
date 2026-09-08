export type LanguageCode = "en" | "es" | "fr" | "de" | "hi" | "ar";

export type LanguageMeta = {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
};

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";
