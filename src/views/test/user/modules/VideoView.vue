<template>
<el-container>
  <com-table 
    :loading="loading.table"
    :columns="table.cols" :tableData="tableData" :moreOperate="moreOpe" :total="total" ref="table"
    :outsideFilter="outsideFilter"
    @filterReset="handleFilterReset"
    @edit="edit" 
    @delete="del" 
    @add="add"
    @multi-delete="multiDel"
    @more-operate-command="handleMoreOpeCommand"
    @get-table-data="getTableData"
  >
    <template #title>
      {{ user.nickname }}
    </template>
    <template #header-more-operation="{selection, loading}">

    </template>
  </com-table>
  <el-dialog v-model="editDialog.show">
    <com-edit 
      :loading="loading.edit"
      v-model="editDialog.form"
      :columns="table.cols"
      @cancel="editDialog.show=false"
      @confirm="onEditConfirm"
    >
    </com-edit>
  </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import comTable from '@/components/ComTable'
import ComEdit from '@/components/ComEdit.vue';

export default {
  components: {comTable, ComEdit},
  props: { 
    user: {
      required: true,
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      path: "/test/video",
      total: 5, //数据总数
      table: {name:"", cols:[]},
      tableData: [],
      selection: [],  //多选里选中的项
      editDialog: {
        show: false,
        form: {},
      },
      moreOpe: [
        {
          icon: "el-icon-crop",
          name: "切换可用性",
          value: "test1",
          permit: true,
          show: (item) => {
            return item.id > 3 && item.id < 6
          }
        },
        {
          icon: "el-icon-crop",
          name: "嘿嘿",
          value: "test2",
        },
      ],
      assignDialog: {
        show: false,
        form: {},
      },
      choose: {},
      loading: {
        table: false,
        edit: false
      },
      outsideFilter: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  computed: {

  },
  watch: {
    user(newVal, oldVal) {
      let outsideFilter = {
        filterList: [{column: "user_id", compare: "eq", values: [this.user.id]}],
        orderByList: [],
      }
      this.outsideFilter = outsideFilter;
    }
  },
  methods: {
    //通用方法
    handleFilterReset() {
      this.outsideFilter.filterList = []
      this.outsideFilter.orderByList = []
    },
    handleMoreOpeCommand({item, command}) {
      let ope = this[command];
      if (ope == null)
      {
        this.$message('无效操作');
        return;
      }
      
      ope(item);
    },
    flushTable() {
      this.$refs.table.getTableData();
    },
    getTableData(filters) {
      this.loading.table = true;
      
      api.pageSuper(filters, this.path)
      .then(async res => {
        this.total = res.total;
        this.tableData = res.records;
        this.loading.table = false;
      })
      .catch(err => {
        this.$message.error(err)
        this.loading.table = false
      })
    },
    add() {
      this.editDialog.show = true;
      this.editDialog.form = {};
    },
    edit(item) {
      this.editDialog.show = true;
      this.editDialog.form = JSON.parse(JSON.stringify(item));
    },
    onEditConfirm(form) {
      this.loading.edit = true;
      api.save(form, this.path)
      .then(res => {
        this.$message.success("成功");
        this.loading.edit = false;
        this.editDialog.show = false;
        this.flushTable();
      })
      .catch(err => {
        this.$message.error(err)
        this.loading.edit = false;
      });
    },
    del(item) {
      this.multiDel([item])
    },
    multiDel(selection) {
      this.$confirm('确认删除记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading.table = true;
        let idList = [];
        selection.forEach(s => idList.push(s.id))
        api.del(idList, this.path)
        .then(res => {
          this.$message.success('删除成功!');
          this.loading.table = false;
          this.flushTable();
        })
        .catch(err => {
          this.$message.error(err)
          this.loading.table = false;
        });
      })
    },
  },
  created() {
    this.getTableStructure(15).then(res => this.table = res);
    let outsideFilter = {
      filterList: [{column: "user_id", compare: "eq", values: [this.user.id]}],
      orderByList: [],
    }
    this.outsideFilter = outsideFilter;
  },
}
</script>
<style lang="scss" scoped>

</style>