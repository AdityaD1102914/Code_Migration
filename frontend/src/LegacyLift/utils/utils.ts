import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Only allow frontend JSP-related files
export const ALLOWED_EXTENSIONS = [
  ".jsp",
  ".jspx",
  ".jspf",
  ".html",
  ".htm",
  ".css",
  ".js",
  ".xml",
  ".properties",
];

export const hasAllowedExtension = (filename: string): boolean => {
  return ALLOWED_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
};

/**
 * 
 * @param password - Password to be encrypted
 * @param secret - Secret key to derive encryption key
 * @returns 
 */
export async function encryptPassword(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("fixed-salt"), // Use random salt in production
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}
