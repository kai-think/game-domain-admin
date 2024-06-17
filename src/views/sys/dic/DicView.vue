<template>
<el-container>
  <el-container>
    <el-aside>
      <com-tree
        :tree="treeData"
        :draggable="true"
        :checkbox="true"
        :default-expanded-keys="defaultExpandedKeys"
        :loading="loading.tree"
        ref="tree"
        @add="add"
        @click="click"
        @drop="handleDrop"
        @header-add="add({})"
        @header-delete="multiDel"
      >
      </com-tree>
    </el-aside>
    <el-main style="padding: 0 0 0 20px">
      <com-edit
        ref="edit"
        v-model="editDialog.form"
        :columns="table.cols"
        :loading="loading.edit"
        @cancel="editDialog.show=false"
        @confirm="onEditConfirm"
      >
        <template #header>
          <div v-if="mode == 0">
            <span>新增</span>
          </div>
          <div v-else>
            <span>编辑：{{ editDialog.form.name }}</span>
          </div>
        </template>
        <template #column-parentId="{form, name}">
          <span>{{ formatParentId(form.parentId) }}</span>
        </template>
      </com-edit>
    </el-main>
  </el-container>
</el-container>
</template>
<script>
import ComTree from "@/components/ComTree"
import ComEdit from '@/components/ComEdit.vue';
import {find} from '@/common/tree-operate'
import axios from 'axios';
import { api } from '@/api/common-api/api';
export default {
  components: {ComTree, ComEdit},
  props: {

  },
  data() {
    return {
      mode: 0,  //0为添加，1为编辑
      table: {name:"", cols:[]},
      treeData: [],
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
      defaultExpandedKeys: [],
      loading: {
        tree: false,
        edit: false,
      },
    }
  },
  methods: {
    flush() {
      this.loading.tree = true;
      let expandedKeys = this.$refs.tree.getExpandedKeys();
      this.defaultExpandedKeys = expandedKeys;
      api.page()
      .then(res => {
        this.$store.commit("dictionary", res.records)
        this.treeData = this.$store.state.dictionary
        this.loading.tree = false;
      })
      .catch(err => {
        this.$message.error(err);
        this.loading.tree = false;
      });
    },
    formatParentId(parentId) {
      let dic = this.getDicBy.id(parentId);
      return dic != undefined ? dic.name : "根菜单"
    },
    multiDel(ids) {
      this.$confirm('确认删除？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading.tree = true;
        api.del(ids)
        .then(res => {
          this.$message.success("删除成功");
          this.loading.tree = false;
          this.flush();
        })
        .catch(err => {
          this.$message.error(err);
          this.loading.tree = false;
        });
      })
    },
    add(item) {
      this.mode = 0;
      this.editDialog.form = {};
      this.editDialog.form.parentId = item.id
    },
    del(item) {
      this.multiDel([item.id]);
    },
    click(item) {
      this.mode = 1;
      this.editDialog.form = item;
    },
    onEditConfirm(form) {
      this.loading.edit = true;
      let props = this.defaultProps;
      api.save(form)
      .then(res => {
        this.$message.success("成功");
        this.editDialog.show = false;
        this.loading.edit = false;
        this.editDialog.form = {};
        this.flush();
      })
      .catch(error => {
        this.$message.error(error);
        this.loading.edit = false;
      });
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      console.log("handle drop")
      this.loading.tree = true;
      let dragDic = draggingNode.data;
      let dropDic = dropNode.data;
      let sameParent = dragDic.parentId === dropDic.parentId;

      let parentDic1 = null;
      let parentDic2 = null;
      
      parentDic1 = find(this.treeData, dragDic.parentId, this.defaultProps);
      if (!sameParent)
        parentDic2 = find(this.treeData, dropDic.parentId, this.defaultProps);

      //更新拖动字典的父id
      switch(dropType)
      {
        case "before": {
          dragDic.parentId = dropDic.parentId;
          break;
        }
        case "after": {
          dragDic.parentId = dropDic.parentId;
          break;
        }
        case "inner": {
          dragDic.parentId = dropDic.id;
          break;
        }
      }
      
      let req1 = api.update([{id: dragDic.id, parentId: dragDic.parentId}]);

      //要修改的字典
      let dicList = [];
      //修改子字典列表的排序
      let sort = 1;
      if (parentDic1 == null && parentDic2 == null)
        this.treeData.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      sort = 1;
      if (parentDic1 != null && Array.isArray(parentDic1.children))
        parentDic1.children.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      sort = 1;
      if (parentDic2 != null && Array.isArray(parentDic2.children))
        parentDic2.children.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      let req2 = api.update(dicList);

      
      req2.then(res => {
        req1.then(res => {
          this.$message.success("修改成功")
          this.loading.tree = false;
          this.flush()
        })
        .catch(error => {
          this.$message.error(error);
          this.loading.tree = false;
        });
      })
      .catch(error => {
        this.$message.error(error);
        this.loading.tree = false;
      });
    },
  },
  mounted() {
    this.loading.edit = true;
    this.getTableStructure(this.currentMenu.tableId).then(res => {
      this.table = res
      this.loading.edit = false;
    });
    
    this.treeData = this.$store.state.dictionary;
  },
  beforeUnmount() {

  },
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";

</style>