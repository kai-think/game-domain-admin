import { createStore } from 'vuex'
import router from '@/router';
import {TreeProps, Predict, traversal} from "@/common/tree-operate"
import { DicMap } from '@/config/Constant';

export default createStore({
  state: {
    user: {
      id: null,
      nickname: "",
      avatar: "",
    },          //登陆用户

    userRoleList: [{limitation: ""}],

    token: '',
    dictionary: {}, //字典
    dicMap: {}, //字典映射

    menus: {},       //登陆用户的菜单
    menuMap: {},  //菜单映射

    table: [],
    tableMap: {},  //用户拥有的表

    routes: {},
  },
  getters: {
    isLogin(state) {
      return state.user != null && state.user.id != null;
    },
    currentMenu(state) {
      let path = location.pathname.substring(6);
      // console.log("path", path)
      let menuMap = state.menuMap;
      for (let k in menuMap) {
        let menu = menuMap[k];
        // console.log("menu", menu)
        if (path === menu.component)
          return menu;
      }

      return {};
    },
    getLimitationList(state) {
      let limitList = state.userRoleList.map(ur => {
        try {
          let json = JSON.parse(ur.limitation);
          return json;
        } catch(e) {
          return {}
        }
      });

      let ret = {}
      limitList.forEach(l => Object.assign(ret, l));
      return ret;
    }
  },
  mutations: { //同步操作
    userRoleList(state, userRoleList) {
      state.userRoleList = userRoleList;
    },
    token(state, token) {
      state.token = token;
    },
    dictionary(state, dic) {
      state.dictionary = dic;

      let dicMap = {};
      traversal(dic, (tree) => {
        dicMap[tree.id] = tree;
        return true;
      })

      state.dicMap = dicMap;
    },
    user(state, user) {
      state.user = user;
    },
    menus(state, menus) {
      state.menus = menus;

      addMenusToRouter(menus);

      let menuMap = {};
      traversal(menus, (tree) => {
        menuMap[tree.id] = tree;
        return true;
      })
      
      state.menuMap = menuMap;
    },
    table(state, table) {
      state.table = table;

      let tableMap = {};
      table.forEach(t => {
        tableMap[t.id] = t;
        tableMap[t.name] = t;
      });

      state.tableMap = tableMap;
    },
    tableMap(state, tableMap) {
      state.tableMap = tableMap;
    },
    routes(state, routes) {
      state.routes = routes;
      localStorage.setItem("routes", routes);
    },
    putTable(state, table) {
      state.tableMap[table.id] = table;
      state.tableMap[table.name] = table;
    },
    removeTable(state, tableId) {
      state.tableMap[tableId] = null;
    },
    loadStore(state, callback = ()=>false) {
      //从 localStorage 读取数据
      let jsonString = localStorage.getItem("store");
      if (jsonString == null)
      {
        callback();
        return;
      }
      
      let obj = JSON.parse(jsonString);
      for (let key in obj) {
        state[key] = obj[key];
      }
      callback();
    },
    saveStore(state, callback = ()=>false) {
      localStorage.setItem("store", JSON.stringify(state));
      callback();
    },
    clearStore(state, callback = ()=>false) {
      state.user = {id: null, nickname: "", avatar: "",}
      state.token = ''
      state.dictionary = []
      state.dicMap = {}
      state.menus = []
      state.menuMap = {}
      state.table = []
      state.tableMap = {}
      state.routes = {}
      
      localStorage.removeItem("store");
      callback();
    }
  },
  actions: {  //异步操作

  },
  modules: {
    
  }
})

function addMenusToRouter(menus) {
  if (!Array.isArray(menus))
    return;

  let sort = 0;
  menus.forEach(menu => {
    if (menu.type === DicMap.MenuTypeVal.Menu && Array.isArray(menu.children))
      addMenusToRouter(menu.children);
    else if (menu.type === DicMap.MenuTypeVal.MenuLeaf)
    {
      let component = menu.component;
      if (typeof component !== "string" || component.length == 0)
        return;

      if (component.charAt(0) == '/' || component.charAt(0) == '\\')
        component = component.substr(1);

      let route = {
        path: component,
        component: () => import("@/views/" + component),
        name: menu.name,
        sort,
      }
      sort++;
      
      router.addRoute("Admin", route);
    }
  })
}