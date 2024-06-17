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
    // this.getTableStructure(18).then(res => this.table = res);
    let circleLimitation = this.$store.getters.getLimitationList.circle;
    if (circleLimitation != null)
    {
      let ids = circleLimitation.ids;
      if (Array.isArray(ids)) {
        this.outsideFilter.filterList.push({column: "circleId", compare: "in", values: ids})
      }
    }
  },
}
</script>
<style lang="scss" scoped>

</style>