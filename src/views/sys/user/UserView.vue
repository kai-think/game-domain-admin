<template>
<el-container>
  <com-table-view 
    :row-more-operations="moreOperation" 
    @handle-row-more-operation="handleRowMoreOperation">

  </com-table-view>
  <el-dialog v-model="assignDialog.show">
    <assign-role :user="choose" @assign-success="assignDialog.show = false">

    </assign-role>
  </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComTableView from '@/components/ComTableView.vue';
import ComEdit from '@/components/ComEdit.vue';
import AssignRole from './module/AssignRole'
export default {
  components: {ComTableView, ComEdit, AssignRole},
  props: {

  },
  computed: {
    dicUseful() {
      return this.getDicBy.id(this.table.col['useful'])
    },
  },
  data() {
    return {
      table: {name:"", cols:[]},
      moreOperation: [
        {
          icon: "el-icon-plus",
          name: "分配角色",
          value: "assignRole",
        },
        // {
        //   icon: "el-icon-crop",
        //   name: "切换可用性",
        //   value: "toggleUseful",
        // },
      ],
      assignDialog: {
        show: false,
        form: {},
      },
      choose: {},
      loading: {
        table: false,
        edit: false
      },
    }
  },
  methods: {
    assignRole(item) {
      this.choose = item;
      this.assignDialog.show = true;
    },
    //通用方法
    handleRowMoreOperation({item, command}) {
      let ope = this[command];
      console.log("ope")
      if (ope == null)
      {
        this.$message('无效操作');
        return;
      }
      
      ope(item);
    },
  },
  created() {
    
  },
}
</script>
<style lang="scss" scoped>

</style>