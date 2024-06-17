import axios from "axios"
import cipher from "@/common/cipher"

//生成32位随机数
const N = 32;
let random = Math.random() + "";
random = random.substr(0, N)
while (random.length < N) {
  let rand = Math.random() + "";
  let diff = N - random.length
  rand = rand.substr(0, diff);
  random += rand;
}

//得到后端公钥
var publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcd+0zTY9Gn94iqkQJTlxYnEnCeFsLkk0a7hoAvi2B74VzDVV3xH0ZO9RkXvo1SgCB+uzbEWdrgQkzTqyjfTtgOguu3OnkVxIMJF34ibchTY0LWHGxq1m2gLGuVVqrlu1LtdV0X7xo/5zc8Mr+46veWb86kSpqe6rOAm69WWo5GwIDAQAB"

//转换响应数据，如果是加密的响应就进行转换，否则直接返回
let transformResponse = data => {
  // 对响应数据做点什么
  // console.log("transformResponse", data)
  let result = JSON.parse(data);
  let content = result.content;
  if (content == null)
    return result

  //内容解密
  content = cipher.aesWithBase64Decrypt(content, random)
  // console.log("content", content)
  //签名验证
  let signature = result.signature;
  let verify = cipher.sha1WithRsaWithBase64Verify(content, signature, publicKey)
  // console.log("verify", verify)
  if (verify)
    return JSON.parse(content)

  return Promise.reject("签名验证失败！");
}

function encryptedPost(url:string, body: object = {}) {
  let content, signature;
  content = JSON.stringify(body);
  // console.log(content, random, publicKey)
  signature = cipher.sha1WithBase64WithRsaWithBase64Encrypt(content + random, publicKey);
  content = cipher.aesWithBase64Encrypt(content, random)
  let encryptedRomdan = cipher.rsaWithBase64Encrypt(random, publicKey)
  let encryptedForm = {content, random: encryptedRomdan, signature}

  return axios.post(url, encryptedForm, {transformResponse});
}

export default encryptedPost;

let setPublicKey = (publicKey2: string) => {
  publicKey = publicKey2
}

export {
  setPublicKey,
}