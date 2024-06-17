<template>
<el-container>
  <el-main style="padding: 10px">
    <div style="text-align: right">
      <el-switch
        v-model="checkStrictly"
        active-text="严格检查"
      ></el-switch>
    </div>
    <el-tree 
      v-loading="loading"
      show-checkbox
      highlight-current
      :expand-on-click-node="false"
      :data="treeData" 
      :props="defaultProps" 
      :node-key="defaultProps.id"
      :check-strictly="checkStrictly"
      ref="tree"
      @check-change="checkChange"
    >
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
import {traversal} from '@/common/tree-operate'
export default {
  emits: ['assignSuccess'],
  components: {ComTree, ComEdit, ComTable},
  props: {
    role: {
      required: true,
      type: Object
    }
  },
  data() {
    return {
      url: '/menu',
      mode: 0,  //0为添加，1为编辑
      treeData: [],   
      table: {name:"", cols:[]},
      checkStrictly: true,
      editDialog: {
        show: false,
        form: {},
      },
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
    role(newVal) {
      // this.flush()
    }
  },
  methods: {
    //通用方法
    checkChange(ids) {
      
    },
    flush() {
      this.loading = true;
      this.treeData = this.$store.state.menus;
      menuApi.getByRoleId(this.role.id)
      .then(res => {
        let checkedKeys = [];
        traversal(res, (tree) => {
          checkedKeys.push(tree.id);
          return true;
        }, this.defaultProps)
        this.$refs.tree.setCheckedKeys(checkedKeys, true);
        this.loading = false;
      })
      .catch(err => {
        this.$message.error(err);
        this.loading = false;
      });
    },
    save() {
      this.saving = true;
      let checkedKeys = this.$refs.tree.getCheckedKeys();
      roleApi.assignMenu(this.role.id, checkedKeys)
      .then(res => {
        this.$message.success("分配成功")
        this.saving = false;
        this.flush();
        this.$emit("assignSuccess");
      })
      .catch(err => {
        this.$message.error(err);
        this.saving = false;
      });
      ;
    }
  },
  created() {
    this.treeData = this.$store.state.menus;
    this.flush();
  },
}
</script>
<style lang="scss" scoped>

</style>