<template>
<el-container style="height: 100%">
  <el-aside style="height: 100%;">
    <com-tree
      :loading="loading.tree"
      :tree="treeData"
      :draggable="true"
      :checkbox="true"
      ref="tree"
      @add="add"
      @click="click"
      @drop="handleDrop"
      @header-add="add({})"
      @header-delete="multiDel"
      :allow-drop="allowDrop"
    >
      <template #header-more>
        <el-button class="btn-text-info" style="color: white"  @click="initTableCols" v-permit="'initCols'" :loading="loading.tree">初始化</el-button>
      </template>
    </com-tree>
  </el-aside>
  <el-main style="padding: 0">
    <el-dialog v-model="editDialog.show">
      <com-edit
        :loading="loading.edit"
        v-model="editDialog.form"
        :columns="table.cols"
        @cancel="editDialog.show=false"
        @confirm="onEditConfirm"
        :hideColumnIds="hideColumnIds"
      >
        <template #header>
          <div>
            {{ mode == 0 ? "新增" : "编辑"}}
          </div>
        </template>
        <template #column-tableId>
          {{ parentTable.name }}
        </template>
        <template #column-ruleDicIds="{form, column}">
          <el-select
            v-model="form.ruleDicIds"
            multiple
            placeholder="请选择">
            <el-option
              v-for="item in getDicBy.id(column.formatDicId).children"
              :key="item.id"
              :label="item.name"
              :value="item.value">
            </el-option>
          </el-select>
        </template>
        <template #column-formatDicId="{form, column}">
          <el-select
            v-model="form.formatDicId"
            placeholder="请选择">
            <el-option
              v-for="(item, key, idx) in $store.state.dicMap"
              :key="idx"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </template>
        <template #column-fkTable="{form, column}">
          <el-select v-model="form.fkTable" :placeholder="column.name" @change="onFkTableChange">
            <el-option v-for="(value, key, idx) in tables" 
              :key="idx" 
              :label="value.name" 
              :value="value.name">
            </el-option>
          </el-select>
        </template>
        <template #column-fkCol="{form, column}">
          <el-select v-model="form.fkCol" :placeholder="column.name">
            <el-option v-for="(value, key, idx) in cols" 
              :key="idx" 
              :label="value.name" 
              :value="value.value">
            </el-option>
          </el-select>
        </template>
        <template #column-fkShowCol="{form, column}">
          <el-select v-model="form.fkShowCol" :placeholder="column.name">
            <el-option v-for="(value, key, idx) in cols" 
              :key="idx" 
              :label="value.name" 
              :value="value.value">
            </el-option>
          </el-select>
        </template>
      </com-edit>
    </el-dialog>
  </el-main>
</el-container>
</template>
<script>
import ComTree from "@/components/ComTree"
import ComEdit from '@/components/ComEdit.vue';
import axios from 'axios';
import { api } from '@/api/common-api/api';
import {SysTableId} from '@/config/Constant'
import {DicMap} from '@/config/Constant'
import tableApi from '@/api/sys/table'
export default {
  emits: ['flush', 'change'],
  components: {ComTree, ComEdit },
  props: {
    parentTable: {
      required: true,
      type: Object,
      default: {}
    },
    treeData: {
      required: true,
      type: Array,
      default: []
    }
  },
  data() {
    return {
      ColTypeVal: DicMap.ColTypeVal,
      mode: 0,  //0为添加，1为编辑
      table: {name:"", cols:[]},
      editDialog: {
        show: false,
        form: {},
      },
      defaultProps: {
        children: 'children', 
        label: 'name',
        id: 'id',
        parentId: 'tableId'
      },
      defaultExpandedKeys: [],
      url: '/sys/table-col',
      loading: {
        tree: false,
        edit: false,
      },

      tables: [],
      cols: []
    }
  },
  computed: {
    hideColumnIds() {
      let ids = []
      let columnForm = this.editDialog.form;
      if (columnForm.type !== this.ColTypeVal.Dic)
      {
        let id = this.table.cols.find(col => col.value === "formatDicId").id
        ids.push(id)
      }

      if (columnForm.type !== this.ColTypeVal.FK)
      {
        let hide = ["fkTable", "fkCol", "fkShowCol"]
        for (let str of hide) {
           let id = this.table.cols.find(col => col.value === str).id
          ids.push(id)
        }
      }

      return ids
    }
  },
  methods: {
    initTableCols() {
      this.$confirm('确认初始化？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading.tree = true;
        tableApi.initTableCols(this.parentTable.id)
        .then(res => {
          this.loading.tree = false;
          this.flush();
        })
        .catch(err => {
          this.$message.error(err)
          this.loading.tree = false;
        })
      })
    },
    //以下为通用方法
    flush() {
      this.$emit("flush");
      this.loading.edit = true;
      this.getTableStructure(SysTableId.TableCol).then(res => {
        this.table = res
        this.loading.edit = false;
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
        api.del(ids, this.url)
        .then(res => {
          this.$message.success("删除成功");
          this.$emit('change')
          this.loading.tree = false;
          this.flush();
        })
        .catch(err => {
          this.$message.error(err)
          this.loading.tree = false;
        })
      })
    },
    add(item) {
      this.mode = 0;
      this.editDialog.show = true;
      this.editDialog.form = {};
      this.editDialog.form[this.defaultProps.parentId] = this.parentTable.id
    },
    del(item) {
      this.multiDel([item.id]);
    },
    click(item) {
      if (!Array.isArray(item.ruleDicIds))
        item.ruleDicIds = JSON.parse(item.ruleDicIds);

      this.mode = 1;
      this.editDialog.show = true
      this.editDialog.form = item;
      
      if (item.type == this.ColTypeVal.FK) {
        this.getFkCol()
      }
    },
    onEditConfirm(form) {
      let props = this.defaultProps;
      this.editDialog.show = false;
      if (typeof form.ruleDicIds !== "string")
        form.ruleDicIds = JSON.stringify(form.ruleDicIds);
        
      this.loading.edit = true;
      api.save(form, this.url)
      .then(res => {
        this.$message.success("成功");
        this.editDialog.show = false;
        this.editDialog.form = {};
        this.$emit("change");
        this.loading.edit = false;
        this.flush();
      })
      .catch(err => {
        this.$message.error(err)
        this.loading.edit = false;
      });
    },
    allowDrop(draggingNode, dropNode, type) {
      return type !== 'inner';
    },
    handleDrop(draggingNode, dropNode, dropType, ev) {
      if (dropType === 'inner')
        return false;
      this.loading.tree = true;
      //要修改的节点
      let itemList = [];

      //修改子字典列表的排序
      let sort = 1;

      this.treeData.forEach(item => {
        item.sort = sort;
        sort++;
        itemList.push({id: item.id, sort: item.sort});
      })
      
      api.update(itemList, this.url)
      .then(res => {
        this.$message.success("修改成功")
        this.loading.tree = false;
        this.flush()
      })
    },
    getFkCol() {
      this.getTableStructure(this.editDialog.form.fkTable).then(res => {
        this.cols = res.cols
      });
    },
    onFkTableChange() {
      this.getFkCol();
      this.editDialog.form.fkCol = null;
      this.editDialog.form.fkShowCol = null;
    }
  },
  mounted() {
    this.loading.edit = true;
    this.getTableStructure(SysTableId.TableCol).then(res => {
      this.table = res
      this.loading.edit = false;
    });
    tableApi.page()
    .then(res => {
      this.tables = res.records;
    })
  },
  beforeUnmount() {

  },
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";
</style>