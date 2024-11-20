import jsSHA from 'jssha';
import base32Encode from 'base32-encode';

function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export function generateSecret(): string {
  const randomBytes = generateRandomBytes(20);
  return base32Encode(randomBytes, 'RFC4648');
}

export function verifyToken(token: string, secret: string): boolean {
  try {
    const now = Math.floor(Date.now() / 1000);
    const timeStep = 30;
    const counter = Math.floor(now / timeStep);
    
    // Check current and adjacent time steps
    for (let i = -1; i <= 1; i++) {
      const calculatedToken = generateTOTP(secret, counter + i);
      if (calculatedToken === token) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    return false;
  }
}

export function generateQRCodeUrl(secret: string, email: string): string {
  return `otpauth://totp/ReloadDB:${encodeURIComponent(email)}?secret=${secret}&issuer=ReloadDB&algorithm=SHA1&digits=6&period=30`;
}

function generateTOTP(secret: string, counter: number): string {
  // Convert counter to buffer
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(counter), false);

  // Decode base32 secret
  const secretBytes = base32Decode(secret);
  
  // Calculate HMAC
  const shaObj = new jsSHA('SHA-1', 'UINT8ARRAY');
  shaObj.setHMACKey(secretBytes, 'UINT8ARRAY');
  shaObj.update(new Uint8Array(buffer));
  const hmac = shaObj.getHMAC('UINT8ARRAY');

  // Get offset
  const offset = hmac[hmac.length - 1] & 0xf;
  
  // Generate 4-byte code
  const code = ((hmac[offset] & 0x7f) << 24) |
               ((hmac[offset + 1] & 0xff) << 16) |
               ((hmac[offset + 2] & 0xff) << 8) |
               (hmac[offset + 3] & 0xff);
  
  // Get 6 digits
  const token = (code % 1000000).toString().padStart(6, '0');
  return token;
}

function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const strUpper = str.toUpperCase();
  const bytes = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (let i = 0; i < strUpper.length; i++) {
    const value = alphabet.indexOf(strUpper[i]);
    if (value === -1) continue;

    buffer = (buffer << 5) | value;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bytes.push((buffer >> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }

  return new Uint8Array(bytes);
}