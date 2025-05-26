import { clsx, type ClassValue } from "clsx";
import packageJson from "../../package.json";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const appVersion = packageJson.version;
