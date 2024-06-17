<template>
<el-container>
  <com-table-view 
    ref="table"
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation" 
    :outsideTable="table"
    :outsideFilter="outsideFilter">
    <template #title>
      {{ `论坛：${forum.name}的帖子` }}
    </template>

    <template #column-sectionId="{item}">
      {{ sectionIdFormatter(item) }}
    </template>

    <template #edit-column-sectionId="{item}">
      <el-select v-model="item.sectionId" :placeholder="'板块'">
        <el-option v-for="(option, idx) in sectionList" 
          :key="idx"
          :label="option.name" 
          :value="option.id">
        </el-option>
      </el-select>
    </template>
  </com-table-view>

  <el-dialog v-model="editContentDialog.show">
    <el-container style="width: 100%">
      <el-header style="font-size: 24px;">
        <strong style="line-height: 3.2;">
          {{ editContentDialog.bbs.title }}
        </strong>
      </el-header>
      <el-main style="padding-top: 36px">
        <wang-editor
          v-model="editContentDialog.bbsContent.content" 
          :editorId="'editor-' + editContentDialog.bbs.id"
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
    <reply :post="replyDialog.chooseBbs"></reply>
   </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import bbsApi from "@/api/sys/other/bbsApi"
import ComTableView from '@/components/ComTableView.vue';
import WangEditor from '@/components/WangEditor.vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import Reply from './reply.vue';

export default {
  components: {ComTableView, WangEditor, Reply},
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
      sectionList: [],
      editContentDialog: {
        show: false,
        disable: true,
        bbs: {},  //当前编辑的bbs
        bbsContent: {content: ""},  //要编辑的bbs内容
      },
      replyDialog: {
        show: false,
        chooseBbs: null,
      },
      moreOperation: [
        {
          icon: "el-icon-crop",
          name: "查看内容",
          value: "viewContent",
          permit: true,
        },
        // {
        //   icon: "el-icon-crop",
        //   name: "编辑内容",
        //   value: "editContent",
        //   permit: false,
        // },
        {
          icon: "el-icon-crop",
          name: "查看回复",
          value: "viewReply",
          permit: true,
        },
        {
          icon: "el-icon-crop",
          name: "置顶",
          value: "topPost",
          permit: true,
          show: (item) => {
            return item.topping == 0
          }
        },
        {
          icon: "el-icon-crop",
          name: "取消置顶",
          value: "cancelTopPost",
          permit: true,
          show: (item) => {
            return item.topping == 1
          }
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
      }
    }
  },
  methods: {
    topPost(item) {
      this.handleTopPost(item, true)
    },
    cancelTopPost(item) {
      this.handleTopPost(item, false)
    },
    handleTopPost(item, topping) {
      let form = {
        id: item.id,
        topping
      };

      api.update([form], this.table.path)
      .then(res => {
        this.$message.success("顶置成功！")
        this.flushTable()
      })
      .catch(err => {
        this.$message.error(err)
      })
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
        bbsApi.logicDelete(item.id, value)
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
          bbsApi.logicRestore(item.id)
          .then(res => {
            this.$message.success("恢复成功")
            this.flushTable()
          })
          .catch(err => {
            this.$message.error(err)
          })
        })
    },
    viewReply(item) {
      this.replyDialog.chooseBbs = item
      this.replyDialog.show = true;
    },
    viewContent(item) {
      this.editContentDialog.disable = true;
      if (this.editContentDialog.bbs == item)
      {
        this.editContentDialog.show = true;
        return;
      }

      this.editContentDialog.bbs = item;
      bbsApi.getContentByBbsId(item.id)
      .then(res => {
        this.editContentDialog.bbsContent = res;
        this.editContentDialog.show = true;
      })
      .catch(err => {
        this.$message.error(err)
      });
    },
    editContent(item) {
      this.editContentDialog.disable = false;
      if (this.editContentDialog.bbs == item)
      {
        this.editContentDialog.show = true;
        return;
      }
      
      this.editContentDialog.bbs = item;
      bbsApi.getContentByBbsId(item.id)
      .then(res => {
        this.editContentDialog.bbsContent = res;
        this.editContentDialog.show = true;
      })
      .catch(err => {
        this.$message.error(err)
      });
    },
    onEditContentConfirm() {
      this.editContentDialog.bbsContent.id
      bbsApi.saveContent({
        id: this.editContentDialog.bbsContent.id,
        bbsId: this.editContentDialog.bbs.id, 
        content: this.editContentDialog.bbsContent.content,
      })
      .then(res => {
        this.$message.success("保存成功");
        this.editContentDialog.show = false;

        this.editContentDialog = {
          show: false,
          disable: true,
          bbs: {},  //当前编辑的bbs
          bbsContent: {content: ""},  //要编辑的bbs内容
        }
      })
      .catch(err => {
        this.$message.error(err)
      });
    },
    sectionIdFormatter(item) {
      let section = this.sectionList.find(s => s.id === item.sectionId)
      return section ? section.name : "未知"
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
    this.getTableStructure("tb_bbs").then(res => this.table = res);

    //得到论坛板块列表
    bbsApi.listForumSection(this.forum.id)
    .then(res => {
      this.sectionList = res;
    })

    this.outsideFilter.filterList = [{column: "forum_id", compare: "eq", values: [this.forum.id]}]
  },
}
</script>
<style lang="scss" scoped>

</style>