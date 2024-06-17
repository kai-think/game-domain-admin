<template>
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
      <template #node-operation-more="{item}">
        <i class="el-icon-refresh btn-icon-text-style" @click.stop="addDefaultPermission(item)" v-permit="'addDefaultPermission'"></i>
      </template>
    </com-tree>
  </el-aside>
  <el-main style="padding: 0 0 0 20px">
    <com-edit
      v-model="editDialog.form"
      :columns="table.cols"
      :loading="loading.edit"
      @cancel="editDialog.show=false"
      @confirm="onEditConfirm"
      :hideColumnIds="hideColumnIds"
    >
      <template #header>
        <div>
          {{ mode == 0 ? "新增" : "编辑"}}
        </div>
      </template>
      <template #column-icon="{form, column}">
        <div @click="selectIconDialog.show = true" style="cursor: pointer; margin-left: 5px;">
          <div v-if="typeof form.icon !== 'string' || form.icon.length < 2" style="color: #1E88E5;">
            选择图标
          </div>
          <div v-else class="icon" style="font-size: 32px;">
            <i :class="'el-icon-' + form.icon"></i>
          </div>
        </div>
      </template>
      <template #column-parentId="{form, column}">
        <span>{{ formatParentId(form.parentId) }}</span>
      </template>
      <template #column-tableId="{form, column}">
        <el-select v-model="form.tableId" :placeholder="column.name">
          <el-option v-for="(value, key, idx) in tables" 
            :key="idx" 
            :label="value.name" 
            :value="value.id">
          </el-option>
        </el-select>
      </template>
    </com-edit>
    <el-dialog v-model="selectIconDialog.show" width="828px">
      <icon-selector @click="handleIconClick"></icon-selector>
    </el-dialog>
  </el-main>
</el-container>
</template>
<script>
import ComTree from "@/components/ComTree"
import ComEdit from '@/components/ComEdit.vue';
import axios from 'axios';
import { api } from '@/api/common-api/api';
import tableApi from '@/api/sys/table';
import menuApi from "@/api/sys/menu"
import {find} from '@/common/tree-operate'
import IconSelector from '@/components/IconSelector.vue';
import {DicMap, SysMenuColId} from '@/config/Constant'
export default {
  components: {ComTree, ComEdit, IconSelector},
  props: {

  },
  data() {
    return {
      MenuTypeVal: DicMap.MenuTypeVal,
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
      tables: {},
      selectIconDialog: {
        show: false,
      }
    }
  },
  computed: {
    hideColumnIds() {
      let columnForm = this.editDialog.form;
      let ColId = SysMenuColId;
      if (columnForm.type === this.MenuTypeVal.Menu)
        return [ColId.Component, ColId.Path, ColId.TableId];
      else if (columnForm.type === this.MenuTypeVal.MenuLeaf || columnForm.type === this.MenuTypeVal.Middle)
        return []
      else if (columnForm.type === this.MenuTypeVal.Button)
        return [ColId.TableId, ColId.Icon]
    
      return [ColId.Component, ColId.Path, ColId.TableId]
    }
  },
  methods: {
    formatParentId(parentId) {
      let menu = this.$store.state.menuMap[parentId];
      return menu != undefined ? menu.name : "顶级菜单"
    },
    formatTableId(TableId) {
      let table = this.$store.state.tableMap[tableId];
      return table != undefined ? table.name : "无"
    },
    handleIconClick(icon) {
      this.editDialog.form.icon = icon;
      this.selectIconDialog.show = false;
    },
    addDefaultPermission(item) {
      this.$confirm('确认添加增删改查权限？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading.tree = true;
        menuApi.addDefaultPermission(item.id)
        .then(res => {
          this.loading.tree = false;
          this.$message.success("添加成功");
          this.flush();
        })
        .catch(error => {
          this.loading.tree = false;
          this.$message.error(error);
        })
      })
    },
    //通用方法
    flush() {
      this.loading.tree = true;
      let expandedKeys = this.$refs.tree.getExpandedKeys();
      this.defaultExpandedKeys = expandedKeys;
      api.page().then(res => {
        this.loading.tree = false;
        this.$store.commit("menus", res.records)
        this.treeData = this.$store.state.menus
      });
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
          this.loading.tree = false;
          this.$message.success("删除成功");
          this.flush();
        })
        .catch(error => {
          this.loading.tree = false;
          this.$message.error(error);
        })
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
        this.loading.edit = false;
        this.editDialog.show = false;
        this.editDialog.form = {};

        this.flush();
      })
      .catch(error => {
        this.loading.edit = false;
        this.$message.error(error);
      })
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      let drag = draggingNode.data;
      let drop = dropNode.data;
      let sameParent = drag.parentId === drop.parentId;

      let parent1 = null;
      let parent2 = null;
      
       parent1 = find(this.treeData, drag.parentId, this.defaultProps);
      if (!sameParent)
        parent2 = find(this.treeData, drop.parentId, this.defaultProps);

      //更新拖动字典的父id
      switch(dropType)
      {
        case "before": {
          drag.parentId = drop.parentId;
          break;
        }
        case "after": {
          drag.parentId = drop.parentId;
          break;
        }
        case "inner": {
          drag.parentId = drop.id;
          break;
        }
      }
      
      let req1 = api.update([{id: drag.id, parentId: drag.parentId}]);

      //要修改的字典
      let nodeList = [];
      //修改子字典列表的排序
      let sort = 1;
      if (parent1 == null || parent2 == null)
        this.treeData.forEach(node => {
          node.sort = sort;
          sort++;

          nodeList.push({id: node.id, sort: node.sort});
        })

      sort = 1;
      if (parent1 != null && Array.isArray(parent1.children))
        parent1.children.forEach(node => {
          node.sort = sort;
          sort++;

          nodeList.push({id: node.id, sort: node.sort});
        })

      sort = 1;
      if (parent2 != null && Array.isArray(parent2.children))
        parent2.children.forEach(node => {
          node.sort = sort;
          sort++;

          nodeList.push({id: node.id, sort: node.sort});
        })

      let req2 = api.update(nodeList);
      this.loading.tree = true;
      axios.all([req1, req2])
      .then(axios.spread((res1, res2) => {
        this.loading.tree = false;
        this.$message.success("修改成功")
        this.flush()
      }))
      .catch(error => {
        this.loading.tree = false;
        this.$message.error(error);
      })
    },
  },
  created() {
    this.loading.edit = true;
    this.getTableStructure(this.currentMenu.tableId).then(res => {
      this.table = res
      this.loading.edit = false;
    });
    this.treeData = this.$store.state.menus;

    tableApi.page()
    .then(res => {
      this.tables = res.records;
    })
  },
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";
  .icon {
    cursor: pointer;
    transition: color 0.2s ease-out;
    &:hover {
      color: #409eff;
    }
  }
</style>