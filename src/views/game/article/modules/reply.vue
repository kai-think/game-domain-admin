<template>
<el-container>
  <com-table-view 
    ref="table"
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideTable="table"
    :outsideFilter="outsideFilter">
    <template #title v-if="article">
      {{ article.title }}
    </template>

    <!-- <template #column-userId="{item}">
      {{ item.etc.user.nickname }}
    </template> -->
  </com-table-view>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';
import articleApi from "@/api/sys/other/articleApi"
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  components: {ComTableView},
  props: {
    article: {
      required: false,
      type: Object,
      default: null
    }
  },
  computed: {

  },
  data() {
    return {
      table: {name:"", cols:[]},
      moreOperation: [
        {
          icon: "el-icon-crop",
          name: "删除",
          value: "adminDelete",
          permit: true,
          show: (item) => {
            return item.status == 0
          }
        },
        {
          icon: "el-icon-crop",
          name: "还原",
          value: "cacelAdminDelete",
          permit: true,
          show: (item) => {
            return item.status == -2
          }
        }
      ],
      outsideFilter: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  watch: {
    article(newVal, oldVal) {
      this.flushTable()
    },
  },
  methods: {
    adminDelete(item) {
      this.$prompt(null, '请输入删除原因', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern:
          /.+/,
        inputErrorMessage: '必填',
      })
      .then(({ value }) => {
        articleApi.logicDeleteReply(item.id, true, value)
        .then(res => {
          this.$message.success("删除成功")
          this.flushTable()
        })
        .catch(err => {
          this.$message.error(err)
        })
      })
    },
    cacelAdminDelete(item) {
      ElMessageBox.confirm(
        '确认恢复帖子?',
        'Warning',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(() => {
          articleApi.logicDeleteReply(item.id, false)
          .then(res => {
            this.$message.success("恢复成功")
            this.flushTable()
          })
          .catch(err => {
            this.$message.error(err)
          })
        })
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
    flushTable() {
      if (this.article) {
        this.outsideFilter.filterList = [{column: "article_id", compare: "eq", values: [this.article.id]}]
      }
      
      this.$refs.table.flushTable()
    },
  },
  created() {
    this.getTableStructure("game_article_reply").then(res => this.table = res);
    if (this.article) {
      this.outsideFilter.filterList = [{column: "article_id", compare: "eq", values: [this.article.id]}]
    }
  },
}
</script>
<style lang="scss" scoped>

</style>