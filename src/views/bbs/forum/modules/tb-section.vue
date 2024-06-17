<template>
<el-container>
  <com-table-view 
    ref="table"
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideTable="table"
    :outsideFilter="outsideFilter"
    @before-edit-confirm="beforeEditConfirm"
  >
    <template #title>
      {{ `论坛：${forum.name}的板块` }}
    </template>

    <template #edit-column-forumId="{item, idx, column}">
      {{ forum.name }}
    </template>
  </com-table-view>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';

export default {
  components: {ComTableView},
  props: {
    forum: {
      required: true,
      type: Object,
      default: {}
    }
  },
  watch: {
    forum(newVal, oldVal) {
      this.flushTable()
    }
  },
  data() {
    return {
      table: {name:"", cols:[]},
      moreOperation: [],
      outsideFilter: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  methods: {
    beforeEditConfirm(form) {
      form.forumId = this.forum.id
      console.log("更改表单", form)
    },
    flushTable() {
      this.outsideFilter.filterList = [{column: "forum_id", compare: "eq", values: [this.forum.id]}]
      this.$refs.table.flushTable()
    },
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
    this.getTableStructure("tb_forum_section").then(res => {
      console.log("section表结构", res)
      this.table = res
    });

    this.outsideFilter.filterList = [{column: "forum_id", compare: "eq", values: [this.forum.id]}]
  },
}
</script>
<style lang="scss" scoped>

</style>