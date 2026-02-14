/**
 * Simple client-side encryption/decryption utilities for game secrets.
 * This uses a basic XOR based obfuscation or Web Crypto API.
 * For this use case, we use Web Crypto API (AES-GCM) for "real" encryption.
 */

const SALT = 'midnight-romance-salt';

async function getKey(password: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: enc.encode(SALT),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(text: string, password = 'love'): Promise<string> {
    const enc = new TextEncoder();
    const key = await getKey(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(text)
    );

    const buffer = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + buffer.length);
    combined.set(iv);
    combined.set(buffer, iv.length);

    return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encryptedData: string, password = 'love'): Promise<string> {
    try {
        const combined = new Uint8Array(
            atob(encryptedData)
                .split('')
                .map((c) => c.charCodeAt(0))
        );
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
        const key = await getKey(password);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error('Decryption failed', e);
        return 'Decryption failed';
    }
}
