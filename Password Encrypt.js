const Rijndael = require("rijndael-js");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");
const padder = require("pkcs7-padding");
const { enc } = require("crypto-js");
var md5 = require("md5");
var mcrypt = require("js-rijndael");

function CryptJsWordArrayToUint8Array(wordArray) {
  const l = wordArray.sigBytes;
  const words = wordArray.words;
  const result = new Uint8Array(l);
  var i = 0 /*dst*/,
    j = 0; /*src*/
  while (true) {
    // here i is a multiple of 4
    if (i == l) break;
    var w = words[j++];
    result[i++] = (w & 0xff000000) >>> 24;
    if (i == l) break;
    result[i++] = (w & 0x00ff0000) >>> 16;
    if (i == l) break;
    result[i++] = (w & 0x0000ff00) >>> 8;
    if (i == l) break;
    result[i++] = w & 0x000000ff;
  }
  return result;
}
// If you are using this module in Node.js environment (or `Buffer` exists in global context),
// every data (key, iv, plaintext, ciphertext) will be converted to byte array using `Buffer.from`
// For what can be converted, please refer to Node.js documentation:
//     https://nodejs.org/api/buffer.html#buffer_class_buffer

// If you are using this module in web browser environment,
// data should be one of:
// - <TypedArray>, which will be converted into <Uint8Array>
// - <String>, which will be converted into UTF-8 byte array
// - array-like object, which:
//     - can be accepted by `Array.from()` method
//       https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
//     - every element is an integer <Number> within uint8_t range (0x00 ~ 0xff)

// Key can be 16/24/32 bytes long (128/192/256 bit)
let key = new Uint8Array(32);
let utf8Encode = new TextEncoder();
// Plaintext will be zero-padded
const text = "hellokds";
const password = "ASE256BANKADMIN++1";

// IV is necessary for CBC mode
// IV should have same length with the block size
let iv = new Uint8Array(16);

// const salt = crypto.randomBytes(8);
let salt = new Uint8Array(8);
crypto.getRandomValues(salt);
console.log("salt", salt);
const passwordArray = utf8Encode.encode(password);
console.log("passwordArray", passwordArray);
// const textArray = Buffer.from(text, "utf8");
const textArray = utf8Encode.encode(text);
const padded = padder.pad(textArray, 32); //Use 32 = 256 bits block sizes
let hash = new Uint8Array();
let keyAndIv = new Uint8Array();

for (let i = 0; i < 3 && keyAndIv.length < 48; i += 1) {
  let hashData = Uint8Array.from([
    ...Uint8Array.from([...hash, ...passwordArray]),
    ...salt,
  ]);
  //console.log(hashData)
  // hash = CryptoJS.MD5(hashData);
  hash = utf8Encode.encode(md5(hashData));
  // hash = CryptJsWordArrayToUint8Array(hash2);
  //console.log(hash)
  keyAndIv = Uint8Array.from([...keyAndIv, ...hash]);
}
console.log({ hash });
console.log({ keyAndIv });
key = keyAndIv.slice(0, 32);
iv = keyAndIv.slice(32, 48);
// key = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
// iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
console.log({ key });
console.log({ iv });

const cipher = new Rijndael(key, "cbc");
const encrypted = Buffer.from(cipher.encrypt(textArray, 128, iv));
console.log(encrypted.toString("base64"))
// var keyCodeWords = CryptoJS.enc.Hex.parse("000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F");
// var ivCodeWords = CryptoJS.enc.Hex.parse("202122232425262728292A2B2C2D2E2F");
// const res = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), keyCodeWords, { iv: ivCodeWords });
// const encrypted = utf8Encode.encode(res.ciphertext.toString());
// const encrypted = mcrypt.encrypt(text, iv, key, 'rijndael-128', 'cbc')

const salted_magic = utf8Encode.encode("Salted__");
console.log(salted_magic);
const buf = Buffer.concat([salted_magic, salt]);
const result = Buffer.concat([buf, encrypted]);
// const result =padder.pad(Buffer.concat([buf, encrypted]));
console.log(result.toString("base64"));

// `Rijndael.decrypt(ciphertext, blockSize[, iv]) -> <Array>`
const plaintext = Buffer.from(cipher.decrypt(encrypted, 128, iv));
console.log(plaintext.toString());

//original === plaintext.toSt
