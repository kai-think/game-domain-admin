<template>
<el-container>
  <el-container>
    <el-aside>
      <com-tree
        :tree="treeData"
        :loading="loading.tree"
        :draggable="true"
        :checkbox="true"
        :default-expanded-keys="defaultExpandedKeys"
        ref="tree"
        @add="add"
        @click="click"
        @drop="handleDrop"
        @header-add="add({})"
        @header-delete="multiDel"
      >
        <template #node-operation>
          {{  }}
        </template>
      </com-tree>
    </el-aside>
    <el-main style="padding: 0 0 0 20px">
      <com-edit
        v-model="editDialog.form"
        :columns="table.cols"
        :loading="loading.edit"
        ref="edit"
        @cancel="editDialog.show=false"
        @confirm="onEditConfirm"
      >
        <template #header>
          <div class="edit-header">
            <div>
              <span>
                {{ mode == 0 ? "新增" : editDialog.form.name}}
              </span>
            </div>
            <div>
              <el-button class="btn-text-primary" style="color: white" @click="handleAssignMenuBtnClick" :disabled="!(editDialog.form.id > 0)">分配菜单</el-button>
            </div>
          </div>
        </template>
        <template #column-parentId="{form, name}">
          <span style="color: #0288D1; font-weight: bold; font-size: 16px">{{ formatParentId(form.parentId) }}</span>
        </template>
      </com-edit>
    </el-main>
    <el-dialog v-model="assignDialog.show"  :title="editDialog.form.name" width="380px" :custom-class="'dialog'">
      <assign-menu 
        ref="assignMenu"
        :role="editDialog.form" 
        @assign-success="assignDialog.show = false"></assign-menu>
    </el-dialog>
  </el-container>
</el-container>
</template>
<script>
import ComTree from "@/components/ComTree"
import ComEdit from '@/components/ComEdit.vue';
import AssignMenu from "./module/AssignMenu"
import { find } from "@/common/tree-operate"
import axios from 'axios';
import { api } from '@/api/common-api/api';
import roleApi from '@/api/sys/role';
export default {
  components: {ComTree, ComEdit, AssignMenu},
  props: {

  },
  data() {
    return {
      mode: 0,  //0为添加，1为编辑
      table: {name:"", cols:[]},
      treeData: [],
      editDialog: {
        show: false,
        form: {
          name: "",
        },
      },
      assignDialog: {
        show: false
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
    //以下是通用方法
    flush() {
      this.loading.tree = true;
      let expandedKeys = this.$refs.tree.getExpandedKeys();
      this.defaultExpandedKeys = expandedKeys;
      api.page()
      .then(res => {
        this.treeData = res.records
        this.loading.tree = false;
      })
      .catch(err => {
        this.$message.error(err);
        this.loading.tree = false;
      });
    },
    formatParentId(parentId) {
      if (parentId > 0)
      {
        let parentTree = find(this.treeData, parentId, this.defaultProps);
        if (parentTree != null)
          return parentTree.name;
        return "未知";
      }
      else
      {
        this.editDialog.form.parentId = -1;
        return "顶级角色";
      }
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
      this.editDialog.form = {parentId: item.id};
    },
    del(item) {
      this.multiDel([item.id]);
    },
    click(item) {
      this.mode = 1;
      this.editDialog.form = item;
    },
    onEditConfirm(form) {
      let props = this.defaultProps;
      this.loading.edit = true
      api.save(form)
      .then(res => {
        this.$message.success("成功");
        this.editDialog.form = {};
        this.loading.edit = false
        this.flush();
      })
      .catch(error => {
        this.$message.error(error);
        this.loading.edit = false
      })
    },
    handleAssignMenuBtnClick() {
      this.assignDialog.show = true; 
      let assignMenu = this.$refs.assignMenu;
      if (assignMenu)
        assignMenu.flush()
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      this.loading.tree = true;
      let dragDic = draggingNode.data;
      let dropDic = dropNode.data;
      let sameParent = dragDic.parentId === dropDic.parentId;

      let parentDic1 = null;
      let parentDic2 = null;
      
      parentDic1 = this.treeFind(this.treeData, 'children', (dic) => dragDic.parentId == dic.id);
      if (!sameParent)
        parentDic2 = this.treeFind(this.treeData, 'children', (dic) => dropDic.parentId == dic.id);

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
      if (parentDic1 == null || parentDic2 == null)
        this.treeData.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      if (parentDic1 != null && parentDic1.children != null)
        parentDic1.children.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      sort = 1;
      if (parentDic2 != null && parentDic2.children != null)
        parentDic2.children.forEach(dic => {
          dic.sort = sort;
          sort++;

          dicList.push({id: dic.id, sort: dic.sort});
        })

      let req2 = api.update(dicList);
      axios.all([req1, req2])
      .then(axios.spread((res1, res2) => {
        this.$message.success("修改成功")
        this.loading.tree = false;
        this.flush()
      }))
      .catch(error => {
        this.$message.error(error);
        this.loading.tree = false;
      })
    },
  },
  mounted() {
    this.loading.edit = true;
    this.getTableStructure(this.currentMenu.tableId).then(res => {
      this.table = res
      this.loading.edit = false;
    });
    api.page().then(res => {
      this.treeData = res.records
    });
  },
  beforeUnmount() {

  },
}
</script>
<style lang="scss" scoped>
 @import "@/scss/scss.scss";

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      margin-left: 100px;
      font-size: 20px;
      font-weight: bold; 
      color: #E53935;
    }
  }

  .dialog {
    padding: 0
  }
</style>