import { BPUT_LOGO_DATA_URL } from "./bputLogoData";

let cachedLogoDataUrl: string | null = null;

export async function getCupgsLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;
  cachedLogoDataUrl = BPUT_LOGO_DATA_URL;
  return cachedLogoDataUrl;
}

export function getBputLogoDataUrl(): string {
  return BPUT_LOGO_DATA_URL;
}
