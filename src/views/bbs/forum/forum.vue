<template>
<el-container>
  <com-table-view 
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideFilter="outsideFilter">

  </com-table-view>

  <el-dialog width="90%" v-model="bbsDialog.show" custom-class="el-dialog-no-padding">
    <bbs :forum="choose"></bbs>
   </el-dialog>

   <el-dialog width="90%" v-model="sectionDialog.show">
    <tb-section :forum="choose"></tb-section>
   </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';
import Bbs from './modules/bbs.vue';
import TbSection from './modules/tb-section.vue';

export default {
  components: {ComTableView, Bbs, TbSection},
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
          name: "查看帖子",
          value: "showPost",
          permit: true,
        },
        {
          icon: "el-icon-crop",
          name: "查看板块",
          value: "showSection",
          permit: true,
        }
      ],
      outsideFilter: {
        filterList: [],
        orderByList: [],
      },
      choose: {},
      bbsDialog: {
        show: false
      },
      sectionDialog: {
        show: false
      }
    }
  },
  methods: {
    showPost(item) {
      this.choose = item;
      this.bbsDialog.show = true;
    },
    showSection(item) {
      console.log("查看板块", item)
      this.choose = item;
      this.sectionDialog.show = true;
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
    this.getTableStructure(18).then(res => this.table = res);

    let circleLimitation = this.$store.getters.getLimitationList.circle;
    if (circleLimitation != null)
    {
      let ids = circleLimitation.ids;
      if (Array.isArray(ids)) {
        this.outsideFilter.filterList.push({column: "circleId", compare: "in", values: ids})
      }
    }

    if (circleLimitation == null)
    {
      let forumLimitation = this.$store.getters.getLimitationList.forum;
      if (forumLimitation != null)
      {
        let ids = forumLimitation.ids;
        if (Array.isArray(ids)) {
          this.outsideFilter.filterList.push({column: "id", compare: "in", values: ids})
        }
      }
    }
  },
}
</script>
<style lang="scss" scoped>
@import "@/scss/scss.scss";

</style>