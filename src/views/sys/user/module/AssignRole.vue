<template>
<el-container>
  <el-main style="padding: 10px">
    <el-tree
      v-loading="loading" 
      show-checkbox
      default-expand-all
      highlight-current
      :expand-on-click-node="false"
      :data="treeData" 
      :props="defaultProps" 
      :node-key="defaultProps.id"
      check-strictly
      ref="tree"
      @check-change="checkChange"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <div>{{ node.label }}</div>
          <div>
            <el-input :placeholder="'附加限制json'" v-model="data.limitation" size="small"></el-input>
          </div>
        </div>
      </template>
    </el-tree>
  </el-main>
  <el-footer style="text-align: right">
    <el-button type="primary" @click="save" :loading="saving">保存</el-button>
  </el-footer>
</el-container>
</template>
<script>
import ComTable from "@/components/ComTable"
import ComTree from "@/components/ComTree"
import ComEdit from '@/components/ComEdit.vue';
import {api} from '@/api/common-api/api'
import { onMounted, reactive, ref } from 'vue';
import axios from 'axios';
import menuApi from '@/api/sys/menu';
import roleApi from '@/api/sys/role';
import userApi from '@/api/sys/user';
import {traversal} from '@/common/tree-operate'
export default {
  emits: ['assignSuccess'],
  components: {ComTree, ComEdit, ComTable},
  props: {
    user: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      url: '/role',
      mode: 0,  //0为添加，1为编辑
      treeData: [],   
      table: {name:"", cols:[]},
      defaultProps: {
        children: 'children', 
        label: 'name',
        id: 'id',
        parentId: 'parentId'
      },
      loading: false,
      saving: false,
    }
  },
  watch: {
    user(newVal, oldVal) {
      this.flush()
    }
  },
  computed: {
    roleIdAndLimitationList() {
      let list = [];
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      checkedKeys.forEach(roleId => {
        let limitation = null;
        traversal(this.treeData, (data) => {
          if (data.id == roleId)
          {
            limitation = data.limitation;
            return false;
          }
          
          return true;
        }, this.defaultProps)

        list.push({roleId: roleId, limitation: limitation});
      })
      
      return list;
    }
  },
  methods: {
    //通用方法
    checkChange(ids) {
      
    },
    flush() {
      this.loading = true;
      let req1 = roleApi.listByUser()   //当前用户可以分配的角色 
      let req2 = roleApi.listByUser(this.user.id) //该用户原来拥有的角色
      axios.all([req1, req2])
      .then(axios.spread((res1, res2) => {
        console.log(res1, res2);
        this.treeData = res1;

        let checkedKeys = [];
        traversal(res2, (role) => {

          let findedData = this.treeData.find(data => data.id == role.id)
          if (findedData != null && role.etc != null && role.etc.limitation != null)
            findedData.limitation = role.etc.limitation

          checkedKeys.push(role.id);
          return true;
        }, this.defaultProps)
        
        this.$refs.tree.setCheckedKeys(checkedKeys, true);
        this.loading = false;
      }))
    },
    save() {
      this.saving = true;
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      userApi.assignRole(this.user.id, this.roleIdAndLimitationList)
      .then(res => {
        this.$message.success("分配成功")
        this.flush();
        this.$emit("assignSuccess");
        this.saving = false;
      })
      .catch(err => {
        this.$message.error(err);
        this.saving = false;
      });
    }
  },
  created() {
    this.treeData = this.$store.state.menus;
    this.flush();
  },
}
</script>
<style lang="scss" scoped>
  .custom-tree-node {
    width: 100%;
    margin-right: 20px;
    display: flex;
    justify-content: space-between;
  }

  .custom-node {
    height: 40px;
  }
</style>