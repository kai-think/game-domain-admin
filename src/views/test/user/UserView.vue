<template>
<el-container>
  <com-table 
    :loading="loading.table"
    :columns="table.cols" :tableData="tableData" :moreOperate="moreOpe" :total="total" ref="table"
    :outsideFilter="outsideFilter"
    @filterReset="handleFilterReset"
    @edit="edit" 
    @delete="del" 
    @add="add"
    @multi-delete="multiDel"
    @more-operate-command="handleMoreOpeCommand"
    @get-table-data="getTableData"
  >
    <template #header-more-operation="{selection, loading}">

    </template>
  </com-table>
  <el-dialog v-model="editDialog.show">
    <com-edit 
      :loading="loading.edit"
      v-model="editDialog.form"
      :columns="table.cols"
      @cancel="editDialog.show=false"
      @confirm="onEditConfirm"
    >
    </com-edit>
  </el-dialog>
  <el-dialog width="90%" v-model="articleViewDialog.show">
    <article-view :user="articleViewDialog.user"></article-view>
  </el-dialog>
   <el-dialog width="90%" v-model="videoViewDialog.show">
    <video-view :user="videoViewDialog.user"></video-view>
   </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import comTable from '@/components/ComTable'
import ComEdit from '@/components/ComEdit.vue';
import ArticleView from './modules/ArticleView';
import VideoView from './modules/VideoView.vue';

export default {
  components: {comTable, ComEdit, ArticleView, VideoView},
  props: {
    outsideFilter: {
      required: false,
      type: Object,
      default: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  computed: {

  },
  data() {
    return {
      total: 5, //数据总数
      table: {name:"", cols:[]},
      tableData: [],
      selection: [],  //多选里选中的项
      editDialog: {
        show: false,
        form: {},
      },
      articleViewDialog: {
        show: false,
        user: {},
      },
      videoViewDialog: {
        show: false,
        user: {},
      },
      moreOpe: [
        {
          icon: "el-icon-crop",
          name: "查看文章",
          value: "showArticle",
        },
        {
          icon: "el-icon-crop",
          name: "查看视频",
          value: "showVideo",
        },
      ],
      choose: {},
      loading: {
        table: false,
        edit: false
      },
      innerFilter: {
        filterList: [],
        orderByList: [],
      }
    }
  },
  methods: {
    showVideo(item) {
      this.videoViewDialog.user = item;
      this.videoViewDialog.show = true;
    },
    showArticle(item) {
      this.articleViewDialog.user = item;
      this.articleViewDialog.show = true;
    },
    //通用方法
    handleFilterReset() {
      this.innerFilter.filterList = []
      this.innerFilter.orderByList = []
    },
    handleMoreOpeCommand({item, command}) {
      let ope = this[command];
      if (ope == null)
      {
        this.$message('无效操作');
        return;
      }
      
      ope(item);
    },
    flushTable() {
      this.$refs.table.getTableData();
    },
    getTableData(filters) {
      this.loading.table = true;
      
      api.pageSuper(filters)
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
    add() {
      this.editDialog.show = true;
      this.editDialog.form = {};
    },
    edit(item) {
      this.editDialog.show = true;
      this.editDialog.form = JSON.parse(JSON.stringify(item));
    },
    onEditConfirm(form) {
      this.loading.edit = true;
      api.save(form)
      .then(res => {
        this.$message.success("成功");
        this.loading.edit = false;
        this.editDialog.show = false;
        this.flushTable();
      })
      .catch(err => {
        this.$message.error(err)
        this.loading.edit = false;
      });
    },
    del(item) {
      this.multiDel([item])
    },
    multiDel(selection) {
      this.$confirm('确认删除记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading.table = true;
        let idList = [];
        selection.forEach(s => idList.push(s.id))
        api.del(idList)
        .then(res => {
          this.$message.success('删除成功!');
          this.loading.table = false;
          this.flushTable();
        })
        .catch(err => {
          this.$message.error(err)
          this.loading.table = false;
        });
      })
    },
  },
  created() {
    this.getTableStructure(this.currentMenu.tableId).then(res => this.table = res);
  },
}
</script>
<style lang="scss" scoped>

</style>