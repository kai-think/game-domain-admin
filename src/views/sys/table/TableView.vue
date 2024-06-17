<template>
<el-container>

  <el-aside style="width: auto; padding: 0" >
    <col-view 
      :treeData="colData"
      :parentTable="choose"
      @flush="colDataFlush"
      @change="colDataChange"
      ref="colView"
    >
    </col-view>
  </el-aside>
  <el-main style="padding: 0 0 0 20px">
    <com-table-view 
      :row-more-operations="moreOperation" 
      @handle-row-more-operation="handleRowMoreOperation"
      @row-click="click"
    >

    </com-table-view>
  </el-main>
</el-container>
</template>
<script>
import ColView from "./module/ColView.vue"
import ComTableView from '@/components/ComTableView.vue';
import {api} from '@/api/common-api/api'
import tableApi from '@/api/sys/table';
export default {
  components: {ColView, ComTableView},
  data() {
    return {
      choose: {
        cols: []
      },
      moreOperation: [

      ],
      defaultProps: {
        children: 'cols', 
        label: 'name',
        id: 'id',
        parentId: 'tableId'
      },
      colData: [],
      loading: {
        table: false,
        edit: false
      },
    }
  },
  methods: {
    colDataFlush() {
      this.$refs.colView.loading.tree = true;
      api.page({tableId: this.choose.id}, '/sys/table-col')
      .then(res => {
        this.colData = res.records
        this.$refs.colView.loading.tree = false;
      })
      .catch(error => {
        this.$message.error(error);
      })
    },
    colDataChange() {
      this.$store.commit("table", [])
      this.loading.edit = true;
      this.getTableStructure(this.currentMenu.tableId).then(res => {
        this.table = res
        this.loading.edit = false;
      });
    },
    click(item) {
      this.choose = item;
      this.colDataFlush();
    },
    //通用方法
    handleRowMoreOperation({item, command}) {
      let ope = this[command];
      if (ope == null)
      {
        this.$message('无效操作');
        return;
      }
      
      ope(item);
    },
  },
  created() {
    this.loading.edit = true;
    this.getTableStructure(this.currentMenu.tableId).then(res => {
      this.table = res
      this.loading.edit = false;
    })
    .catch(err => {
      this.$message.error(err);
      this.loading.edit = false;
    });
  },
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";
</style>