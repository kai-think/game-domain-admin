import store from '@/store'
import {getTableStructure} from '@/api/common-api/api'

let dicMap = store.state.dicMap;

export default {
  data() {
    return {
      Constant: {
        StorageKey: {
          USER: "user",
          TOKEN: "token",
          MENUS: "menus",
          DICTIONARY: "dictionary",
        }
      },
      getDicBy: {
        id,
        name,
        valueAndParentId,
        valueAndParentName
      },
    }
  },
  methods: {
    deepClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    getTableStructure,
    formatSrc,
  },
  computed: {
    currentMenu() {
      return store.getters.currentMenu;
    },
  }
}

let nullDic = {
  id: 0,
  name: "未知字典",
  value: null,
  stringValue: null,
  sort: 0,
  descr: "不存在这个字典"
}

function id(id) {
  return store.state.dicMap[id];
}

function name(name) {
  for (let k in dicMap) {
    let dic = dicMap[k];
    if (dic.name == name)
      return dic;

    return nullDic;
  }
}

function valueAndParentId(value, parentId) {
  let parentDic = id(parentId);
  if (!parentDic || !parentDic.children)
    return;
  
    for (let dic of parentDic.children) {
      if (dic.value == value)
        return dic;
    }

    return nullDic;
}

function valueAndParentName(value, parentName) {
  let parentDic = name(parentName);
  if (!parentDic || !parentDic.children)
    return;
  
    for (let dic of parentDic.children) {
      if (dic.value == value)
        return dic;
    }

    return nullDic;
}

import vueConfig from '@/../vue.config'
let proxy = vueConfig.devServer.proxy;
let servletPath = Object.keys(proxy)[0];
function formatSrc(src) {
  if (typeof src === 'string')
    return servletPath + '/static' + src;

  return null;
}