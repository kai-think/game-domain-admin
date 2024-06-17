<template>
<el-container>
  <com-table-view 
    ref="table"
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideFilter="outsideFilter">

  </com-table-view>

  <el-dialog v-model="editContentDialog.show">
    <el-container style="width: 100%">
      <el-header style="font-size: 24px;">
        <strong style="line-height: 3.2;">
          {{ editContentDialog.article.title }}
        </strong>
      </el-header>
      <el-main style="padding-top: 36px">
        <wang-editor
          v-model="editContentDialog.articleContent.content" 
          :editorId="'editor-' + editContentDialog.article.id"
          :disable="editContentDialog.disable"
        ></wang-editor>
      </el-main>
      <el-footer style="text-align: right;">
        <el-button type="primary" v-if="!editContentDialog.disable" @click="onEditContentConfirm">确定</el-button>
        <el-button type="danger" @click="editContentDialog.show = false">关闭</el-button>
      </el-footer>
    </el-container>
  </el-dialog>

  <el-dialog width="90%" v-model="replyDialog.show" custom-class="el-dialog-no-padding">
    <reply :article="replyDialog.choose"></reply>
   </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';
import EditContent from './modules/editContent.vue';
import Reply from './modules/reply';
import articleApi from "@/api/sys/other/articleApi"
import WangEditor from '@/components/WangEditor.vue';
import { ElMessage, ElMessageBox } from 'element-plus'
export default {
  components: {ComTableView, EditContent, Reply, WangEditor},
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
          name: "查看内容",
          value: "viewContent",
        },
        // {
        //   icon: "el-icon-crop",
        //   name: "编辑内容",
        //   value: "editContent",
        // },
        {
          icon: "el-icon-crop",
          name: "查看回复",
          value: "viewReply",
          permit: true,
        },
        {
          icon: "el-icon-crop",
          name: "删除",
          value: "adminDelete",
          permit: true,
          show: (item) => {
            return item.status == 1
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
        },
      ],
      outsideFilter: {
        filterList: [],
        orderByList: [],
      },
      editContentDialog: {
        show: false,
        disable: true,
        article: {},  //当前编辑的article
        articleContent: {content: ""},  //要编辑的article内容
      },
      replyDialog: {
        show: false,
        choose: null,
      },
    }
  },
  methods: {
    editContent(item) {
      this.editContentDialog.disable = false;
      if (this.editContentDialog.article == item)
      {
        this.editContentDialog.show = true;
        return;
      }
      
      this.editContentDialog.article = item;
      articleApi.getContentByBbsId(item.id)
      .then(res => {
        this.editContentDialog.articleContent = res;
        this.editContentDialog.show = true;
      })
      .catch(err => {
        this.$message.error(err)
      });
    },
    onEditContentConfirm() {
      this.editContentDialog.articleContent.id
      articleApi.saveContent({
        id: this.editContentDialog.articleContent.id,
        articleId: this.editContentDialog.article.id, 
        content: this.editContentDialog.articleContent.content,
      })
      .then(res => {
        this.$message.success("保存成功");
        this.editContentDialog.show = false;

        this.editContentDialog = {
          show: false,
          disable: true,
          article: {},  //当前编辑的article
          articleContent: {content: ""},  //要编辑的article内容
        }
      })
      .catch(err => {
        this.$message.error(err)
      });
    },
    viewContent(item) {
      this.editContentDialog.disable = true;
      if (this.editContentDialog.article == item)
      {
        this.editContentDialog.show = true;
        return;
      }

      this.editContentDialog.article = item;
      articleApi.getContentByArticleId(item.id)
      .then(res => {
        this.editContentDialog.articleContent = res;
        this.editContentDialog.show = true;
      })
      .catch(err => {
        this.$message.error(err)
      });
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
    adminDelete(item) {
      this.$prompt(null, '请输入删除原因', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        inputPattern:
          /.+/,
        inputErrorMessage: '必填',
      })
      .then(({ value }) => {
        articleApi.logicDelete(item.id, true, value)
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
          articleApi.logicDelete(item.id, false)
          .then(res => {
            this.$message.success("恢复成功")
            this.flushTable()
          })
          .catch(err => {
            this.$message.error(err)
          })
        })
    },
    flushTable() {
      this.$refs.table.flushTable()
    },
    viewReply(item) {
      this.replyDialog.choose = item
      this.replyDialog.show = true;
    },
  },
  created() {
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