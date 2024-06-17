<template>
<el-container class="container">
  <el-aside class="aside">
    <el-card class="login-card" >
      <template #header>
        登陆
      </template>
      <template #default>
        <el-form label-position="top" label-width="80px" :model="loginForm">
          <el-form-item label="用户名">
            <el-input v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input type="password" v-model="loginForm.password"></el-input>
          </el-form-item>
        </el-form>
        <div class="login-footer">
          <el-switch
            v-model="loginForm.remember"
            active-text="记住我"
          >
          </el-switch>
          <el-button @click="login" type="primary" :loading="logining">
            登陆
          </el-button>
        </div>
        
      </template>
    </el-card>
  </el-aside>
</el-container>
</template>
<script>
import publicApi from '@/api/sys/public';
import menuApi from '@/api/sys/menu';
import axios from 'axios';
import dicApi from '@/api/sys/dic';
import roleApi from '@/api/sys/role';
export default {
  data: function() {
    return {
      loginForm: {
        username: "",
        password: "",
        remember: false,
      },
      logining: false,
    }
  },
  computed: {

  },
  methods: {
    login() {
      this.logining = true;
      publicApi.login(this.loginForm)
      .then(res => {
        this.$message.success("登陆成功")
        //保存token
        let token = res.etc.Authorization;
        this.$store.commit("token", token);

        //设置axios默认头
        axios.defaults.headers.Authorization = token;

        //保存user
        this.$store.commit("user", res);

        //得到菜单
        menuApi.listByCurrentUser()
        .then(res => {
          this.$store.commit("menus", res);
          this.logining = false;
          //跳转到管理页面
          this.toAdminView();
        })

        //得到角色与约束
        roleApi.listUserRoleByCurrentUser()
        .then(res => {
          this.$store.commit("userRoleList", res);
        })

        this.getAllDic();

        setTimeout(() => {
          this.$store.commit("saveStore")
        }, 2000);
      })
      .catch(error => {
        this.$message.error(error)
        this.logining = false;
      });
    },
    loginWithToken() {
      publicApi.loginWithToken()
      .then(res => {
        //保存user
        this.$store.commit("user", res);

        //得到菜单
        menuApi.listByCurrentUser()
        .then(res => {
          this.$store.commit("menus", res);
          
          //跳转到管理页面
          this.toAdminView();
        })

        this.getAllDic();
      })
      .catch(error => {
        //清除token
        this.$store.commit("clearStore");
        axios.defaults.headers.Authorization = null;
      });
    },
    //得到所有字典，并保存到store里面
    getAllDic() {
      dicApi.page()
      .then(res => {
        this.$store.commit("dictionary", res.records);
      })
    },
    addMenusToRouter(menus) {
      let routes = JSON.parse(JSON.stringify(menus));
      let idMap = {};
      let arr = [];
      routes.forEach(c => {
        idMap[c.id] = c;
        arr.push(c)
      });
      while (arr.length > 0) {
        let route = arr.shift();
      
        idMap[route.id] = route;

        if (route.children != null)
        {
          route.children.forEach(c => arr.push(c));
          continue;
        }
        if (route.component == null)
          continue;
        if (route.component.charAt(0) == '/' || route.component.charAt(0) == '\\')
          route.component = route.component.substr(1);

        route.path = route.component;
        route.component = () => import("@/views/" + route.path);

        this.$router.addRoute("Admin", route);
      }

      this.$store.commit("routes", routes);
    },
    toAdminView() {
      this.$router.push("admin");
    },
  },
  created() {
    if (this.$store.getters.isLogin)
      this.toAdminView();

    let token = this.$store.state.token;
    if (token == null)
      return;

    axios.defaults.headers.Authorization = token;
    this.loginWithToken();
  },
}
</script>
<style lang="scss" scoped>
  .login-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 40px;
  }
  .center {
    text-align: center;
  }
  .el-card.login-card {
    width: auto;
    height: auto;
    margin: auto;
    padding: 20px;
    background: none;
    border: none;
    box-shadow: none;
  }

  .container {
    height: 100%;
    background-image: url("/wallhaven-4xogz4.jpg");
    background-repeat: repeat;
    background-position: -200px;
    background-size: contain;
  }

  .aside {
    position: absolute;
    right: 0;
    height: 100%;
    background-color: rgba($color: #ECEFF1, $alpha: 0.8);
    width: auto;
    min-width: 25%;
    box-shadow: #546E7A 0px 0px 3px 1px;
  }
</style>