<template>
<el-container>
  <com-table-view 
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideFilter="outsideFilter">

  </com-table-view>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';

export default {
  components: {ComTableView},
  props: {

  },
  computed: {

  },
  data() {
    return {
      table: {name:"", cols:[]},
      moreOperation: [

      ],
      outsideFilter: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  methods: {
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
    this.getTableStructure(18).then(res => this.table = res);
  },
}
</script>
<style lang="scss" scoped>

</style>