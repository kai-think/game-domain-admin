<template>
<el-container>
  <com-table 
    :loading="loading.table"
    :columns="table.cols" :tableData="tableData" :total="total" ref="table"
    :outsideFilter="outsideFilter"
    @row-click="$emit('row-click', $event)"
    @filterReset="handleFilterReset"
    @get-table-data="getTableData"
  >
    <template #title>
      <slot name="title">
        
      </slot>
    </template>
    <template #header-operation="{selection, loading}">
      <slot name="header-operation" :selection="selection" :loading="loading">
        
      </slot>
    </template>
    <template  v-for="(col, idx) in cols" :key="idx" 
        #[col.slotName]="{item}">
      <slot :name="col.slotName" :item="item" :idx="idx" :column="col"></slot>
    </template>

    <template #row-operation="{item, idx}">
      <slot name="row-operation" :item="item" :idx="idx">

      </slot>
    </template>
  </com-table>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import { defineAsyncComponent } from 'vue';
import ComTable from "@/components/ComTable"
export default {
  emits: ["row-click"],
  components: {
    ComTable
  },
  props: {
    //外部过滤器
    outsideFilter: {
      required: false,
      type: Object,
      default: {
        filterList: [],
        orderByList: [],
      }
    },
    //外部表，没有则默认为当前菜单的表
    outsideTable: {
      requried: false,
      type: Object,
      default: null
    },
  },
  computed: {
    table() {
      let table = this.outsideTable == null ? this.defaultTable : this.outsideTable
      console.log("table change", table)

      return table;
    },
    cols() {
      let cols = this.deepClone(this.table.cols);
      cols.forEach(col => col.slotName = 'column-' + col.value)
      return cols
    },
  },
  watch: {
    table(newVal) {
      console.log("watch table change", newVal)
      if (newVal && newVal.name)
        this.flushTable();
    }
  },
  data() {
    return {
      defaultTable: {name:"", cols:[]},
      total: 5, //数据总数
      tableData: [],
      selection: [],  //多选里选中的项
      choose: {},
      loading: {
        table: false,
        edit: false
      },
    }
  },
  methods: {
    //通用方法
    handleFilterReset() {
      // console.log("ComSimpleTable: handleFilterReset")
      this.flushTable();
    },
    flushTable() {
      // console.log("ComSimpleTable: flushTable")
      this.$refs.table.getTableData();
    },
    getTableData(filters) {
      // console.log("ComSimpleTable: getTableData")

      if (this.table == null ||  this.table.path == null)
      {
        console.error("table is null")
        return;
      }
      this.loading.table = true;
      
      api.pageSuper(filters, this.table.path)
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
  },
  mounted() {
    if (this.outsideTable == null)
    {
      this.getTableStructure(this.currentMenu.tableId).then(res => {
        this.defaultTable = res;
      })
    }
  },
}
</script>
<style lang="scss">
@import "@/scss/scss.scss";

</style>