<template>
<el-container style="height: 100%; border: 1px solid #eee">
  首页
</el-container>
</template>
<script>
import { h, resolveComponent } from 'vue'
import IconSelector from '@/components/IconSelector'
import {DicMap} from '@/config/Constant'
import publicApi from '@/api/public'
import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js'
import cipher from "@/common/cipher"
import encryptedPost from "@/common/encryptedPost"

export default {
  name: "app",
  data() {
    return {
      name: 'First',
      noActivated: false,
      show: true,
      MenuTypeVal: DicMap.MenuTypeVal,
      
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      nextNum: 10,
      handleMenuClick(menu) {
        console.log("menu", menu)
      },
      text: "文字",

      publicKey: "",
    }
  },
  created() {
    let txt = "一个新的测试文本（AES）";
    let key = "1234567890123456";
    //aes加密，后端解密
    // let ciphertext = cipher.aesWithBase64Encrypt(txt, key);
    // console.log("aes加密后", ciphertext);
    // publicApi.aesDecrypt2(ciphertext, key)
    // .then(res => {
    //   console.log("plaintext", res)
    // })
    //得到后端密文，前端解密
    // console.log("---------------------")
    // publicApi.aesEncrypt()
    // .then(res => {
    //   console.log("ciphertext", res)
    //   let plaintext = cipher.aesWithBase64Decrypt(res, key);
    //   console.log("plaintext", plaintext)
    // })

    //rsa加密解密测试
    let publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcd+0zTY9Gn94iqkQJTlxYnEnCeFsLkk0a7hoAvi2B74VzDVV3xH0ZO9RkXvo1SgCB+uzbEWdrgQkzTqyjfTtgOguu3OnkVxIMJF34ibchTY0LWHGxq1m2gLGuVVqrlu1LtdV0X7xo/5zc8Mr+46veWb86kSpqe6rOAm69WWo5GwIDAQAB";
    let privateKey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAJx37TNNj0af3iKqRAlOXFicScJ4WwuSTRruGgC+LYHvhXMNVXfEfRk71GRe+jVKAIH67NsRZ2uBCTNOrKN9O2A6C67c6eRXEgwkXfiJtyFNjQtYcbGrWbaAsa5VWquW7Uu11XRfvGj/nNzwyv7jq95ZvzqRKmp7qs4Cbr1ZajkbAgMBAAECgYAHp349EkA+DjgJrhah9elilFKvZr/dcwy+koNHIgaL4rG+jRpvP3d3MowTVOocjUA1G5dWqCVNBwTyM5kSbl/nIxSCYwdUoDid4r0JbqkXkTTsIq3euHG8eiWr9rr3SDmwDojWoJEc4liVlfme8dQuMfgxe1QKq7wTrJwCKwbeMQJBAPwpknRPRK8W9hefbbtEu8mlbzUy+ER8Puq6dvS+lnWzJ8n2chJcHRYQFwWpjl4+SZuKeEcDmYmuQ7xuqEIayO0CQQCe2YeaxcU4uuDC45RAwCcMaNw1nDJuA+Gi47lXbroBXoeOiNZunViSZVUgDgrV/Ku6V54TaZIzZ21QFjf7mXEnAkEA7dZwMpAJonOvzfwrzbQ4wyrsx2q5zC68UT1qsdGJrJ48azutwC9tp7+pV0fj5nQtjS1/4Ms+aCQb84ET5rXIyQJAM0m45tgEHZT5DPO94kooUXFp6EVOYwcNyzILnZc6p0aGLhcwZPaYqmvdWEQwa3bxW3D+sPXdJou2V61U1f9s8QJALccvYwwWlCTq1iTmegYk9fOoc+isZKH+Z0YW70kFi94AYEO+utYwmXBEAqQ5VC/bywa1O71xdL4/RGCOSxBf2A==";
    //私钥加密，后端用公钥解密
    // let ciphertext = cipher.rsaWithBase64Encrypt(txt, publicKey);
    // publicApi.rsaDecrypt(ciphertext)
    // .then(res => {
    //   console.log("plaintext", res)
    // })
    //得到后端密文，用公钥解密
    // publicApi.rsaEncryptText()
    // .then(res => {
    //     let plaintext = cipher.rsaWithBase64Decrypt(res, privateKey);
    //     console.log("plaintext", plaintext)
    // })
    //sha1加rsa加base64进行签名
    //签名数据，后端验证
    // let signature = cipher.sha1WithRsaWithBase64Sign(txt, privateKey);
    // publicApi.verify(txt, signature)
    // .then(res => {
    //   console.log("verify", res)
    // })
    //后端签名数据，这里验证
    // publicApi.signedText()
    // .then(res => {
    //     let verify = cipher.sha1WithRsaWithBase64Verify("今天不是个好日子", res, publicKey)
    //     console.log("verify", verify)
    // })
    //测试加密数据的传输
    var url = u => "/public" + u;
    encryptedPost(url("/testSecret"), {encrypted: "这是一个加密数据"})
    .then(res => {
      console.log("success", res);
    })
    .catch(res => {
      console.log("catch", res)
    })
  },
  mounted() {
    // var AES = require("crypto-js/aes");
    // let txt = "今天是个好日子啊啊啊啊，长一点，一点长，就是这样";
    // let keyHex = "000102030405060708090a0b0c0d0e0f";
    // let ivHex = "ffffffffffffffffffffffffffffffff";
    // var key = CryptoJS.enc.Hex.parse(keyHex);
    // var iv = CryptoJS.enc.Hex.parse(ivHex);

    // var encrypted = CryptoJS.AES.encrypt(txt, key, {
    //   mode: CryptoJS.mode.CBC,
    //   padding: CryptoJS.pad.Pkcs7,
    //   iv: iv
    // });

    // let ciphertextHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex)

    // console.log(encrypted)
    // console.log(encrypted.ciphertext.toString())
    // console.log(ciphertextHex)
    // console.log(encrypted.key.toString())
    // console.log(encrypted.iv.toString())

    // publicApi.aesDecrypt(ciphertextHex, keyHex, ivHex)
    // .then(res => {
    //   console.log(res)
    // })
    

    //   const encryptor = new JSEncrypt();
    //   txt = "公钥加密测试";
    //   let pk = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcd+0zTY9Gn94iqkQJTlxYnEnCeFsLkk0a7hoAvi2B74VzDVV3xH0ZO9RkXvo1SgCB+uzbEWdrgQkzTqyjfTtgOguu3OnkVxIMJF34ibchTY0LWHGxq1m2gLGuVVqrlu1LtdV0X7xo/5zc8Mr+46veWb86kSpqe6rOAm69WWo5GwIDAQAB"
    //   console.log("公钥：" + pk)

    //   encryptor.setKey(pk);
    //   console.log("加密前：", txt, txt.length)
    //   let ciphertext = encryptor.encrypt(txt);
    //   console.log("加密后：", ciphertext)

    //   publicApi.uploadCiphertext(ciphertext)
    //   .then(res => {
    //     console.log("上传后返回结果：", res)
    //   })

    // publicApi.aesEncrypt()
    // .then(res => {
    //   let key = CryptoJS.enc.Utf8.parse("0123456789123456");
    //   console.log("res", res)
    //   let plaint = res
    //   // plaint = CryptoJS.enc.Base64.stringify(plaint)
    //   plaint = CryptoJS.AES.decrypt(plaint, key, {
    //     mode: CryptoJS.mode.ECB,
    //     padding: CryptoJS.pad.Pkcs7,
    //   })
    //   console.log("aes解密后！");
    //   console.log(plaint)
    //   console.log(plaint.toString(CryptoJS.enc.Utf8))
    // })

  },
  methods: {
    randomIndex() {
      return Math.floor(Math.random() * this.items.length)
    },
    add() {
      this.items.splice(this.randomIndex(), 0, this.nextNum++)
    },
    remove() {
      this.items.splice(this.randomIndex(), 1)
    },
    clickIcon(icon) {
      console.log("clickIcon: ", icon);
    },
    setDefaultActive() {
      let current = this.$route;
      // console.log("current", current);
      let menus = this.$store.state.menus;
      for (let i = 0; i < menus.length; i++) {
        let child1 = menus[i];

        if (child1.name === current.name)
        {
          this.currentAcitve = child1.id + "";
          return;
        }

        if (!Array.isArray(child1.children))
          continue
          
        for (let j = 0; j < child1.children.length; j++) {
          let child2 = child1.children[j];
          if (child2.name === current.name)
          {
            this.currentAcitve = child1.id + "-" + child2.id;
            return;
          }

          if (!Array.isArray(child2.children))
            continue

          for (let k = 0; k < child2.children.length; k++) {
            let child3 = child2.children[k];
            if (child3.name === current.name)
            {
              this.currentAcitve = child1.id + "-" + child2.id + "-" + child3.id;
              return;
            }
          }
        }
      }
    }
  },
  components: {
    IconSelector,
    'anchored-heading': {
      render() {
        // 从 children 的文本内容中创建短横线分隔 (kebab-case) id。
        const headingId = getChildrenTextContent(this.$slots.default())
          .toLowerCase()
          .replace(/\W+/g, '-') // 用短横线替换非单词字符
          .replace(/(^-|-$)/g, '') // 删除前后短横线

        return h('h' + this.level, [
          h(
            'a',
            {
              name: headingId,
              href: '#' + headingId
            },
            this.$slots.default()
          )
        ])
      },
      props: {
        level: {
          type: Number,
          required: true
        }
      }
    },
    'cus-menu': {
      name: "CusMenu",
      props: {menus: {
        required: true,
        type: Object,
      }},
      render() {
        return renderMenu(this, this.menus);
      }
    },
  }
}

var MenuTypeVal = DicMap.MenuTypeVal
//生成Menu
function renderMenu(vm, menus) {
  console.log("Menu", Menu)
  let childs = []
  for (let menu of menus) { 
    if (menu.type === MenuTypeVal.MenuLeaf) //叶子结点直接加进去
    {
      childs.push(
        hMenuItem(vm, menu) //index 类似 1、2、3
      )
    }
    else if (menu.type === MenuTypeVal.Menu && Array.isArray(menu.children))  //有孩子数组的需要添加 SubMenu 组件
    {
      let hSubmenu = renderSubMenu(vm, menu);
      childs.push(
        hSubmenu
      )
    }
  }

  let Menu = resolveComponent('el-menu');
  console.log("childs", childs);
  return h(
    Menu,
    {
      uniqueOpened: false,            
      class: "el-menu-vertical-full",
      'text-color': "#000",
      'active-text-color': "#E91E63",
      'background-color': '#FFF',
    },
    {
      default: (props) => childs
    },
  );
}

function renderSubMenu(vm, menu, id = "") {
  let childs = []

  console.log("renderSubmenu menu", menu)
  for (let child of menu.children) { 
    if (child.type === MenuTypeVal.MenuLeaf) //叶子结点直接加进去
    {
      childs.push(
        hMenuItem(vm, child, id)
      )
    }
    else if (child.type === MenuTypeVal.Menu && Array.isArray(child.children))  //有孩子数组的需要添加 SubMenu 组件
    {
      let hSubmenu = renderSubMenu(vm, child, id + '-' + menu.id); //index 类似 2-1-1
      childs.push(
        hSubmenu
      )
    }
  }

  return h(
            resolveComponent('el-submenu'), 
            {
              index: id + menu.id, 
              class: {'menu-item2': true},
              onClick: event => event.stopPropagation() //停止事件传播
            }, 
            {
              default: (props) => childs,
              title: (props) => menu.name,
            }
          );
}

//生成menu
function hMenuItem(vm, menu, id = "") {
  if (id !== "")
    id = id + '-';

  let MenuItem = resolveComponent('el-menu-item')
  return h(
            MenuItem, 
            {
              index: id + menu.id, 
              class: "menu-item2", 
              onClick: event => {
                vm.$emit('click', menu)
              }
            }, 
            {
              default: (props) => menu.name
            }
          )
}



function getChildrenTextContent(children) {
  return children
    .map(node => {
      return typeof node.children === 'string'
        ? node.children
        : Array.isArray(node.children)
        ? getChildrenTextContent(node.children)
        : ''
    })
    .join('')
}
</script>
<style lang="scss" scoped>
  .el-menu-vertical-full {
    flex: 1;
    background-color: inherit;
  }
  .menu-item2 {
    text-align: left;
    background-color: inherit;
  }

  .shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* 可以设置不同的进入和离开动画   */
  /* 设置持续时间和动画函数        */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-fade-enter-from {
    transform: translateX(-20px);
    opacity: 0;
  }
  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }

  .bounce-enter-active {
    animation: bounce-in 0.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0.5s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }

  .component-fade-enter-active,
  .component-fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .component-fade-enter-from,
  .component-fade-leave-to {
    opacity: 0;
  }

  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active,
  .list-leave-active {
    transition: all 1s ease;
  }
  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }

  .admin-aside {
    display: flex;
    flex-direction: column;

    .admin-aside-header {
      display: flex;
      flex-direction: column;
      padding: 20px 10px 0px 20px;
      // background-color: #D81B60;
      background-image: url("/header.png");
      background-repeat: round;
      min-height: 200px;
      color: white;
    }
  }
</style>