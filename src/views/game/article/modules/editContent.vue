<template>
<div>
  <com-table-view 
    :outsideTable="table"
    :outsideFilter="outsideFilter"
  >

  </com-table-view>
</div>
</template>
<script>
import ComTableView from '@/components/ComTableView.vue';
export default {
  components: { ComTableView },
  props: {
    articleId: {
      required: true,
      type: Number,
    },
    mode: {   //"edit" 或 "view" 或 "add"
      required: true,
      type: String, 
    }
  },
  data: () => ({
    table: {cols: []},
    outsideFilter: {
        filterList: [],
        orderByList: [],
      },
  }),
  methods: {

  },
  watch: {
    articleId(newVal) {
      let  outsideFilter = {
        filterList: [{column: "articleId", compare: "eq", values: [this.articleId]}],
        orderByList: [],
      }
      this.outsideFilter = outsideFilter;
    }
  },
  created() {
    this.outsideFilter.filterList.push({column: "articleId", compare: "eq", values: [this.articleId]})
    this.getTableStructure(29).then(res => {
      console.log("table", res)
      this.table = res
    });
  },
}
</script>