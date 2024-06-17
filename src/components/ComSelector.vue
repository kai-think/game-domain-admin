<template>
<el-container>
  <com-simple-table-view :outsideTable="table" :outsideFilter="outsideFilter" ref="table">
    <template #title>
      <slot name="title">
        
      </slot>
    </template>
    <template  v-for="(col, idx) in cols" :key="idx" 
        #[col.slotName]="{item}">
      <slot :name="col.slotName" :item="item" :idx="idx" :column="col"></slot>
    </template>

    <template #row-operation="{item, idx}">
        <el-button class="btn-text-primary" @click="onSelect(item)">选择</el-button>
    </template>
  </com-simple-table-view>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComSimpleTableView from './ComSimpleTableView.vue';

export default {
  emits: ["select"],
  components: {ComSimpleTableView},
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
      return this.outsideTable == null ? this.defaultTable : this.outsideTable
    },
    cols() {
      let cols = this.deepClone(this.table.cols);
      cols.forEach(col => col.slotName = 'column-' + col.value)
      return cols
    },
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
    onSelect(item) {
      this.$emit("select", item)
    },
    //通用方法
    flushTable() {
      this.$refs.table.flushTable();
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