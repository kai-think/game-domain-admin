import axios from 'axios'

var url = u => "/public" + u;

var publicApi = {
  getPublicKey() {
    return axios.get(url("/getPublicKey"));
  },
  uploadCiphertext(ciphertext) {
    return axios.post(url("/uploadCiphertext"), {ciphertext})
  },
  aesDecrypt(ciphertextHex, keyHex, ivHex) {
    let form = new FormData();
    form.append("ciphertextHex", ciphertextHex);
    form.append("keyHex", keyHex);
    form.append("ivHex", ivHex);

    return axios.post(url("/aesDecrypt"), form)
  },
  aesDecrypt2(base64Ciphertext, base64Key) {
    let form = new FormData();
    form.append("base64Ciphertext", base64Ciphertext);
    form.append("base64Key", base64Key);

    return axios.post(url("/aesDecrypt2"), form)
  },
  aesEncrypt() {
    return axios.get(url("/aesEncrypt2"))
  },
  rsaDecrypt(base64Ciphertext) {
    let form = new FormData();
    form.append("base64Ciphertext", base64Ciphertext);
    return axios.post(url("/rsaDecrypt"), form)
  },
  rsaEncryptText() {
    return axios.get(url("/rsaEncryptText"))
  },
  signedText() {
    return axios.get(url("/signedText"))
  },
  verify(plaintext, signature) {
    let form = new FormData();
    form.append("plaintext", plaintext);
    form.append("signature", signature);
    return axios.post(url("/verify"), form)
  },
}

export default publicApi