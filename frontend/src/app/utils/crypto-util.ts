// Compatibility between Node.js (crypto-node-util.ts) and browser (crypto-util.ts)

import { getConfigData } from "../config";

interface IEncryptedElm {
  encryptedData: string;
  iv: string;
  authTag: string;
}

const ALGORITHMS = {
  AES_GCM: "AES-GCM",
  SHA_256: "SHA-256",
};

//"openssl rand -base64 32" command in terminal to generate a key
const DEFAULT_ENCRYPTION_KEY = "BPM3TsjUXJ2bJq8Lfze8HcE2ya19xGD/1zBVGGD95i8=";

//#region helpers

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array {
  let retItem = new Uint8Array(0);

  if (hex) {
    const matches = hex.match(/.{1,2}/g);
    if (matches) {
      retItem = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
    }
  }

  return retItem;
}

function base64ToBuffer(base64: string): Uint8Array {
  let bytes = new Uint8Array(0);

  if (base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  }
  return bytes;
}

async function importKey(base64Key: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(base64Key);
  return crypto.subtle.importKey("raw", keyBuffer, ALGORITHMS.AES_GCM, true, [
    "encrypt",
    "decrypt",
  ]);
}

//#endregion

async function encryptData(
  data: string,
  key: string = ""
): Promise<IEncryptedElm> {
  const configData = getConfigData();
  key = key || configData.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;

  if (!key || !data) {
    throw "encryptData() : Mandatory parameters are missing!";
  }

  const cryptoKey = await importKey(key);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ALGORITHMS.AES_GCM,
      iv: iv,
    },
    cryptoKey,
    encodedData
  );

  const encryptedArray = new Uint8Array(encryptedData);
  const authTag = encryptedArray.slice(-16); // Extract the last 16 bytes as the auth tag
  const cipherText = encryptedArray.slice(0, -16); // The rest is the cipher text

  return {
    encryptedData: bufferToHex(cipherText),
    iv: bufferToHex(iv),
    authTag: bufferToHex(authTag),
  };
}

async function decryptData(
  encryptedElm: IEncryptedElm,
  key: string = ""
): Promise<string> {
  const configData = getConfigData();
  key = key || configData.ENCRYPTION_KEY || DEFAULT_ENCRYPTION_KEY;

  const { encryptedData, iv, authTag } = encryptedElm || {};

  if (!key || !encryptedData || !iv || !authTag) {
    throw "decryptData() : Mandatory parameters are missing!";
  }

  const cryptoKey = await importKey(key);
  const encryptedDataArray = hexToBuffer(encryptedData);
  const ivArray = hexToBuffer(iv);
  const authTagArray = hexToBuffer(authTag);

  const combinedData = new Uint8Array([...encryptedDataArray, ...authTagArray]);

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: ALGORITHMS.AES_GCM,
      iv: ivArray,
    },
    cryptoKey,
    combinedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

async function hashData(data: string): Promise<string> {
  if (!data) {
    throw "hashData() : Mandatory parameters are missing!";
  }

  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest(
    ALGORITHMS.SHA_256,
    encodedData
  );
  return bufferToHex(new Uint8Array(hashBuffer));
}

//#region test functions (to be moved to .test.ts file)

async function testClientEncryption() {
  const key = DEFAULT_ENCRYPTION_KEY;
  const data = "Hello, World Babu!";

  const hashed = await hashData(data);
  console.log("Hashed : ", hashed);

  const encrypted = await encryptData(data, key);
  console.log("Encrypted : ", encrypted);

  const decrypted = await decryptData(encrypted, key);
  console.log("Decrypted : ", decrypted);

  console.log("Is client encryption correct : ", data === decrypted);

  await testDecryptServerData();

  /*
  Hashed: 0b7ee341de903e51b28aa39daf60e363c8a4aea1c1c5a9f0521f4d1605d872ff

  Encrypted : {
      "encryptedData": "ce2cfb47234f8ad1c14d2474d60c46eff852",
      "iv": "a6e4aeef2ae5fda177be8036",
      "authTag": "9a3f430834bbebac9d8e92679aa60fee"
  }
  Decrypted :  Hello, World Babu!
  Is client encryption correct :  true

  --- testDecryptServerData --- 

  Decrypted :  Hello, World Babu!
  Is client and server encryption same : true

  */
}

async function testDecryptServerData() {
  console.log("--- testDecryptServerData --- ");

  const key = DEFAULT_ENCRYPTION_KEY;
  const data = "Hello, World Babu!";

  // Encrypted data from server
  let encrypted = {
    encryptedData: "647a7b50a3ce9845b0c7d2c3e694b235a7ad",
    iv: "adf4e891b8bca884ad5523ea",
    authTag: "c50d8bacc81e491140fe8adba0b0c064",
  };

  const decrypted = await decryptData(encrypted, key);
  console.log("Decrypted : ", decrypted);

  console.log("Is client and server encryption same : ", data === decrypted);
}
//#endregion

//testClientEncryption();

export { encryptData, decryptData, hashData };
