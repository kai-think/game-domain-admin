<template>
<el-container style="height: 100%; border: 1px solid #eee">
  <el-aside class="admin-aside" >
    <!-- 用户部分 -->

    <div class="admin-aside-header">
      
    </div>

    <!-- 菜单 -->
    <el-menu
      :uniqueOpened="false"
      :default-active="currentAcitve"
      class="el-menu-vertical-full"
      background-color="#FFF"
      text-color="#000"
      active-text-color="#0288D1"
    >
      <div v-for="(menu, idx1) in $store.state.menus" :key="idx1">
       <!-- 第一级 没有子项 -->
        <el-menu-item v-if="menu.type === MenuTypeVal.MenuLeaf" :index="'' + menu.id" class="menu-item"  @click="onMenuClick(menu)">
          <template #title>
            <i :class="{['el-icon-' + menu.icon]: menu.icon}"></i>
            <span>{{ menu.name }}</span>
          </template>
        </el-menu-item>
        <!-- 第一级 有子项 -->
        <el-submenu v-else-if="menu.type === MenuTypeVal.Menu && Array.isArray(menu.children)" :index="'' + menu.id" class="menu-item">
          <template #title>
            <i :class="{['el-icon-' + menu.icon]: menu.icon}"></i>
            <span>{{ menu.name }}</span>
          </template>
        
          <div v-for="(child, idx2) in menu.children" :key="idx2">
            <!-- 第二级 没有子项 -->
            <el-menu-item v-if="child.type === MenuTypeVal.MenuLeaf" class="menu-item"  @click="onMenuClick(child)"
              :index="menu.id + '-' + child.id" 
            >
                <i :class="{['el-icon-' + child.icon]: child.icon}"></i>
                <span>{{ child.name }}</span>
            </el-menu-item>

            <!-- 第二级 有子项 -->
            <el-submenu v-else-if="child.type === MenuTypeVal.Menu && Array.isArray(child.children)" :index="menu.id + '-' + child.id" class="menu-item">
              <template #title>
                <i :class="{['el-icon-' + child.icon]: menu.icon}"></i>
                <span>{{ child.name }}</span>
              </template>
              <!-- 第三级 不考虑子项 -->
              <div v-for="(child2, idx3) in child.children" :key="idx3">
                <el-menu-item v-if="child2.type === MenuTypeVal.MenuLeaf" :index="menu.id + '-' + child.id + '-' + child2.id" class="menu-item"  @click="onMenuClick(child2)">
                  <template #title>
                    <i :class="{['el-icon-' + child2.icon]: child2.icon}"></i>
                    <span>{{ child2.name }}</span>
                  </template>
                </el-menu-item>
              </div>
            </el-submenu>
          </div>

        </el-submenu>
      </div>
    </el-menu>
  </el-aside>
  
  <el-container>
    <!-- 头部分 -->
    <el-header class="admin-header">
      <!-- 左边 -->
      <div style="display: flex; justify-content: center; align-items: center;">
        <span class="header-toggle-menu"><i :class="'el-icon-menu'"></i></span>
        <span style="margin-left: 10px">{{ $store.getters.currentMenu.name }}</span>
      </div>
      <!-- 右边 -->
      <div style="display: flex; justify-content: center; align-items: center; ">
        <img :src="userAvatarSrc" class="header-avatar" />
        <el-dropdown>
          <span style="margin: 0 10px; color: white; cursor: pointer;">
            {{ $store.state.user.nickname }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="el-icon-info" @click="userDialog.show = true;">修改资料</el-dropdown-item>
              <el-dropdown-item icon="el-icon-circle-close" @click="logout">退出登陆</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>  
    </el-header>
    <!-- 体部分，也就是列表部分 -->
    <el-main class="admin-main">
      <router-view v-slot="{ Component}">
        <transition :name="transitionName" appear mode="out-in">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </el-main>
  </el-container>
  <!-- 修改个人资料 -->
  <el-dialog v-model="userDialog.show" :before-close="() => userDialog.show=false">
    <com-edit 
      v-model="userDialog.user"
      :permit="true"
      :columns="userDialog.table.cols"
      @cancel="userDialog.show=false"
      @confirm="onEditUserConfirm"
    >
      <template #column-password="{form, column}">
        <el-input v-model="userDialog.user.password" type="password"></el-input>
      </template>
    </com-edit>
  </el-dialog>
</el-container>
</template>
<script>
import Login from "./Login.vue";
import {DicMap} from '@/config/Constant'
import roleApi from '@/api/sys/role';
import ComEdit from '@/components/ComEdit.vue';
import {SysTableId} from '@/config/Constant'
import userApi from '@/api/sys/user';

export default {
  components: {
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
    ComEdit,
  },
  data: function() {
    return {
      currentAcitve: "0",
      MenuTypeVal: DicMap.MenuTypeVal,
      transitionName: "slide-right",
      firstRole: {},
      userDialog: {
        show: false,
        table: {},
        user: {},
      }
    }
  },
  computed: {
    userAvatarSrc() {
      if (!this.$store.getters.isLogin)
        return ""

      return this.formatSrc(this.$store.state.user.avatar)
    },
  },
  watch: {
    '$route' (to, from) {
      let routes = this.$router.getRoutes();
      let toIdx = routes.findIndex(r => r.name === to.name)
      let fromIdx = routes.findIndex(r => r.name === from.name)

      this.transitionName = fromIdx < toIdx ? 'slide-right' : 'slide-left'
    }
  },
  methods: {
    onMenuClick(menu) {
      this.$router.push("/admin" + menu.component);
    },
    onEditUserConfirm() {
      let form = this.userDialog.user;
      userApi.save(form)
      .then(res => {
        this.$message.success("成功");
        this.userDialog.show = false;
      });
    },
    logout() {
      this.$store.commit("clearStore");
      location.pathname = "/"
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
  mounted() {
    //没登陆就返回
    if (!this.$store.getters.isLogin)
    {
      this.$router.push("/");
      return
    }

    this.userDialog.user = this.$store.state.user;
    this.getTableStructure(SysTableId.User).then(res => this.userDialog.table = res);

    //设置默认菜单
    setTimeout(() => {
      this.setDefaultActive()
    }, 500);

    roleApi.getFirstByCurrentUser()
    .then(res => this.firstRole = res);
  },
}
</script>
<style lang="scss" scoped>
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }

  .el-aside {
    color: #333;
    height: 100%;
  }
  .el-menu-vertical-full {
    flex: 1;
    background-color: inherit;
  }

  .el-menu-item li{
    &:active {
      background-color: #CFD8DC;
    }
  }

  .menu-top {
    min-height: 100px;
    background-color: inherit;
  }

  .menu-item {
    text-align: left;
    background-color: inherit;
  }

  .admin-header {
    font-size: 15px;
    background-color: #081b2ae3;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
    }

    .header-toggle-menu {
      font-size: 32px; 
    }
  }

  .admin-aside {
    width: 240px;
    display: flex;
    flex-direction: column;

    .admin-aside-header {
      display: flex;
      flex-direction: column;
      background-image: url("/header.jpg");
      background-repeat: round;
      height: 135px;
      color: white;
    }
  }


  .admin-main {
    background-color: #FAFAFA;
  }

  .login-out-btn {
    color: #FFF;
    font-size: 13px;
    padding: 3px 8px;
    transition: color 0.5s 0s;
    &:hover {
      background-color: #C2185B;
    }
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
  }

  .slide-left-enter-active, .slide-right-enter-active {
    transition: all 0.3s ease-out;
  } 
  .slide-left-leave-active, .slide-right-leave-active {
    transition: all 0.3s ease-in;
  }

  .slide-left-enter-from {
    transform: translateX(-20px);
    opacity: 0;
  }

  .slide-left-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }

  .slide-right-enter-from {
    transform: translateX(20px);
    opacity: 0;
  }

  .slide-right-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }
</style>