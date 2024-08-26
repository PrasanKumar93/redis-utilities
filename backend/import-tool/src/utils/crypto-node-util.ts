// Compatibility between Node.js (crypto-node-util.ts) and browser (crypto-util.ts)

import crypto from "crypto";

interface IEncryptedElm {
  encryptedData: string;
  iv: string;
  authTag: string;
}

const ALGORITHMS = {
  AES_GCM: "aes-256-gcm",
  SHA_256: "sha256",
};

//"openssl rand -base64 32" command in terminal to generate a key
const DEFAULT_ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "BPM3TsjUXJ2bJq8Lfze8HcE2ya19xGD/1zBVGGD95i8=";

function encryptData(data: string, key: string = ""): IEncryptedElm {
  key = key || DEFAULT_ENCRYPTION_KEY || "";

  if (!key || !data) {
    throw new Error("encryptData() : Mandatory parameters are missing!");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ALGORITHMS.AES_GCM,
    Buffer.from(key, "base64"),
    iv
  );

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = (cipher as crypto.CipherGCM).getAuthTag().toString("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag,
  };
}

function decryptData(encryptedElm: IEncryptedElm, key: string = ""): string {
  key = key || DEFAULT_ENCRYPTION_KEY || "";
  const { encryptedData, iv, authTag } = encryptedElm || {};

  if (!key || !encryptedData || !iv || !authTag) {
    throw new Error("decryptData() : Mandatory parameters are missing!");
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHMS.AES_GCM,
    Buffer.from(key, "base64"),
    Buffer.from(iv, "hex")
  );
  (decipher as crypto.DecipherGCM).setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

function hashData(data: string): string {
  if (!data) {
    throw new Error("hashData() : Mandatory parameters are missing!");
  }
  return crypto
    .createHash(ALGORITHMS.SHA_256)
    .update(data, "utf8")
    .digest("hex");
}

//#region test functions (to be moved to .test.ts file)
function testServerEncryption() {
  const key = DEFAULT_ENCRYPTION_KEY;
  const data = "Hello, World Babu!";

  const hashed = hashData(data);
  console.log("Hashed : ", hashed);

  const encrypted = encryptData(data, key);
  console.log("Encrypted : ", encrypted);

  const decrypted = decryptData(encrypted, key);
  console.log("Decrypted : ", decrypted);

  console.log("Is server encryption correct : ", data === decrypted);

  /*
    Hashed :  0b7ee341de903e51b28aa39daf60e363c8a4aea1c1c5a9f0521f4d1605d872ff

    Encrypted : {
      encryptedData: '647a7b50a3ce9845b0c7d2c3e694b235a7ad',
      iv: 'adf4e891b8bca884ad5523ea',
      authTag: 'c50d8bacc81e491140fe8adba0b0c064'
    }
    Decrypted :  Hello, World Babu!
    Is server encryption correct :  true

    --- testDecryptClientData --- 

    Decrypted :  Hello, World Babu!
    Is client and server encryption same : true
  */

  testDecryptClientData();
}

function testDecryptClientData() {
  console.log("--- testDecryptClientData --- ");

  const key = DEFAULT_ENCRYPTION_KEY;
  const data = "Hello, World Babu!";

  // Encrypted data from client
  let encrypted = {
    encryptedData: "ce2cfb47234f8ad1c14d2474d60c46eff852",
    iv: "a6e4aeef2ae5fda177be8036",
    authTag: "9a3f430834bbebac9d8e92679aa60fee",
  };

  const decrypted = decryptData(encrypted, key);
  console.log("Decrypted : ", decrypted);

  console.log("Is client and server encryption same : ", data === decrypted);
}
//#endregion

// testServerEncryption();

export { encryptData, decryptData, hashData };

export type { IEncryptedElm };
