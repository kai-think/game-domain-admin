import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'
import axios from "axios"
import vueconfig from "@/../vue.config"
import mixin from './common/mixin'
import animate from 'animate.css'

let path = Object.keys(vueconfig.devServer.proxy)[0];
let target = vueconfig.devServer.proxy[path].target;
let timeout = 10000
// console.log(path, target)
//axios初始化
axios.defaults.baseURL = target + path;
//带验证token的请求头
axios.defaults.headers.common['Authorization'];
// 现在，在超时前，所有请求都会等待 5 秒
axios.defaults.timeout = timeout;
// 添加请求拦截器
let resquestIntercepter = axios.interceptors.request.use(
  function (config) {
      // 在发送请求之前做些什么
      // console.log("axios 请求前", config)
      return config;
  },
  function (error) {
      // 对请求错误做些什么
      // console.log("axios 请求错误", error)
      return Promise.reject(error);
  }
);

// 添加响应拦截器
let responseInterceptor = axios.interceptors.response.use(
  function (response) {
      // 对响应数据做点什么
      // console.log("axios 响应", response)
      let result = response.data;
      if (result.success)
        return result.data;
      
      if (result.status === 401)
        router.push("/error/" + result.message);

      return Promise.reject(result.message);
  },
  function (error) {
      // 对响应错误做点什么
      return Promise.reject(error);
  }
);

const app = createApp(App)
app.mixin(mixin)
installElementPlus(app)
app.use(store).use(router).mount('#app')
app.use(animate)
/*
  权限指令格式为
  {
    menu: "菜单", //要含 children属性（即权限列表）
    permission: "权限名"
  }
  或者为 string类型的权限名，默认在当前菜单中查询
*/
app.directive('permit', {
  // 当被绑定的元素挂载到 DOM 中时……
  mounted(el, binding) {
    let val = binding.value;
    if (val === null || val === undefined)
      return;

    if (typeof val === 'boolean')
    {
      if (!val) //如果是 false，就隐藏
        el.style['display'] = 'none'
      return;   //true就返回
    }

    let menu:any = null;
    let permission:string = "";
    if (typeof val === 'object')
    {
      menu = val.menu

      if (menu == null)
        menu = store.getters.currentMenu;
        
      permission = val.permission;
    }

    if (typeof val === "string")
    {
      menu = store.getters.currentMenu;
      permission = val;
    }

    // console.log("")
    
    if (permission == "")
      return;
    
    if (menu == null)
      return ;

    let children = menu.children;
    if (!Array.isArray(children))
    {
      el.style['visibility'] = 'hidden'
      return
    }

    for (let menu of children) {
      if (menu.component === permission)
      {
        el.style['visibility'] = 'visible'
        return;
      }
    }
    
    el.style['visibility'] = 'hidden'
    return ;
  }
})

export {
  resquestIntercepter,
  responseInterceptor,
}