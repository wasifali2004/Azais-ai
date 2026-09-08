import { en, type Dictionary } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { hi } from "./hi";
import { ar } from "./ar";
import type { LanguageCode } from "../languages";

export const DICTIONARIES: Record<LanguageCode, Dictionary> = { en, es, fr, de, hi, ar };
export type { Dictionary };
