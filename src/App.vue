<template>
<div>
  <router-view path="/" v-slot="{Component}">
    <transition appear mode="out-in" enter-active-class="animate_animated animate__bounce">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
</div>
</template>

<script>
import axios from 'axios';
import publicApi from '@/api/sys/public';
import publicApi2 from "@/api/public"
import menuApi from '@/api/sys/menu';
import mixin from './common/mixin';
import { ElSelect } from 'element-plus';
import dicApi from './api/sys/dic';
import tableApi from './api/sys/table';
import propotypeExpand from '@/common/propotype_expand'
import {setPublicKey} from "@/common/encryptedPost"
import roleApi from './api/sys/role';
export default {
  name: 'App',
  components: {
    
  },
  methods: {
    getAllDic() {
      dicApi.page()
      .then(res => {
        this.$store.commit("dictionary", res.records);
      })
    },
  },
  created() {
    //原型扩展
    propotypeExpand.expand();
    //设置加密post请求的公钥
    publicApi2.getPublicKey()
    .then(res => {
      if (typeof res === "string")
        setPublicKey(res)
    })
  },
  mounted() {
    let callback = () => {
      if (!this.$store.getters.isLogin)
      {
        this.$router.push("/")
        return;
      }

      let token = this.$store.state.token;
      if (token == null)
      {
        this.$store.commit("clearStore");
        this.$router.push("/")
        return;
      }
      axios.defaults.headers.Authorization = token;


      //得到字典
      dicApi.page()
      .then(res => {
        this.$store.commit("dictionary", res.records);
      });

      //得到表
      tableApi.page()
      .then(res => {
        this.$store.commit("table", res.records);
      })
      
      //得到菜单
      menuApi.listByCurrentUser()
      .then(res => {
        this.$store.commit("menus", res);
        
        console.log("menus", res)

        let path = this.currentMenu.component;
        if (path != null)
          this.$router.push("/admin" + path)
      })

      roleApi.listUserRoleByCurrentUser()
      .then(res => {
        this.$store.commit("userRoleList", res);
      })
    } 

    this.$store.commit("loadStore", callback);
    window.onbeforeunload = this.beforeUnmount;
  },
  beforeUnmount() {
    if (this.$store.getters.isLogin)
      this.$store.commit("saveStore");    //当前已登陆
    else
      this.$store.commit("clearStore");   //当前未登陆
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html,body,#app, #app>div{
  height: 100%;
  margin: 0;
}
</style>
