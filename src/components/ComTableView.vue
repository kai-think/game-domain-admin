<template>
<el-container>
  <com-simple-table-view :outsideTable="table" :outsideFilter="outsideFilter" ref="table" @row-click="$emit('row-click', $event)">
    <template #title>
      <slot name="title">
        
      </slot>
    </template>
    <template #header-operation="{selection, loading}">
      <slot name="header-add" :loading="loading">
        <el-button class="btn-text-primary" style="color: white" @click="add" :loading="loading" v-permit="{menu, permission: 'add'}"  v-if="!hideAddBtn">
          新增
        </el-button>
      </slot>
      <slot name="header-delete" :selection="selection" :loading="loading">
        <el-button class="btn-text-danger" style="color: white" @click="multiDel(selection)" :loading="loading" v-permit="{menu, permission: 'delete'}"  v-if="!hideDeleteBtn">
          删除
        </el-button>
      </slot>
      <slot name="header-more-operation" :selection="selection" :loading="loading">
        
      </slot>
    </template>
    <template  v-for="(col, idx) in cols" :key="idx" 
        #[col.slotName]="{item}">
      <slot :name="col.slotName" :item="item" :idx="idx" :column="col"></slot>
    </template>

    <template #row-operation="{item, idx}">
      
        <slot name="row-edit-btn" :item="item" :idx="idx">
          <el-button class="btn-text-primary" @click="edit(item)" v-permit="{menu, permission: 'edit'}" v-if="!hideEditBtn">编辑</el-button>
        </slot>
        <slot name="row-delete-btn" :item="item" :idx="idx">
          <el-button class="btn-text-danger" @click="del(item)" v-permit="{menu, permission: 'delete'}" v-if="!hideDeleteBtn">删除</el-button>
        </slot>
        <slot name="row-more-operation" :item="item" :idx="idx">

          <el-button class="btn-text-info" 
            v-for="(command, idx) in getShowOperations(item)" :key="idx" 
            v-permit="item.permit"
            @click="$emit('handle-row-more-operation', {item, command: command.value})">
            {{ command.name }}
          </el-button>
          <!-- <el-dropdown v-if="getShowOperations(item).length > 0" trigger="click" @command="handleRowMoreOperation({item, command: $event})">
            <el-button class="btn-text-info">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <div v-for="(item, idx) in getShowOperations(item)" :key="idx">
                    <el-dropdown-item :icon="item.icon" :command="item.value" v-permit="item.permit">{{ item.name }}</el-dropdown-item>
                </div>
              </el-dropdown-menu>
            </template>
          </el-dropdown> -->
        </slot>
    </template>
  </com-simple-table-view>
  <el-dialog v-model="editDialog.show" custom-class="el-dialog-no-padding">
    <com-edit 
      :loading="loading.edit"
      v-model="editDialog.form"
      :columns="table.cols"
      @cancel="editDialog.show=false"
      @confirm="onEditConfirm"
    >
      <template #header>
        <slot name="edit-header">
          {{ editDialog.title }}
        </slot>
      </template>
      <template  v-for="(col, idx) in cols" :key="idx" 
          #[col.slotName]="{form, column}">
        <slot :name="col.editSlotName" :item="form" :idx="idx" :column="col"></slot>
      </template>
      <template #footer>
        <slot name="edit-footer"></slot>
      </template>
    </com-edit>
  </el-dialog>
</el-container>
</template>
<script>
import {api} from '@/api/common-api/api'
import ComEdit from '@/components/ComEdit.vue';
import ComSimpleTableView from './ComSimpleTableView.vue';

export default {
  emits: ["handle-row-more-operation", "row-click", "before-edit-confirm"],
  components: {ComEdit, ComSimpleTableView},
  props: {
    //外部过滤器
    outsideFilter: {
      required: false,
      type: Object,
      default: {
        filterList: [],
        orderByList: [],
      }
    },
    //外部表，没有则默认为当前菜单的表
    outsideTable: {
      requried: false,
      type: Object,
      default: null
    },
    outsideMenu: {
      requried: false,
      type: Object,
      default: null
    },
    //更多操作
    rowMoreOperations: {
      required: false,
      type: Array,
      default: [],
    },
    hideAddBtn: {
      required: false,
      type: Boolean,
      default: false
    },
    hideEditBtn: {
      required: false,
      type: Boolean,
      default: false
    },
    hideDeleteBtn: {
      required: false,
      type: Boolean,
      default: false
    },
  },
  computed: {
    table() {
      let table = this.outsideTable == null ? this.defaultTable : this.outsideTable;
      if (table && table.id) {
        let menus = this.$store.state.menus;
        let menu = menus.find(m => m.tableId == table.id);
        if (menu)
          this.defaultMenu = menu
      }
      return table
    },
    menu() {
      return this.outsideMenu == null ? this.defaultMenu : this.outsideMenu
    },
    cols() {
      let cols = this.deepClone(this.table.cols);
      cols.forEach(col => {
        col.slotName = 'column-' + col.value
        col.editSlotName = 'edit-column-' + col.value
      })
      return cols
    },
  },
  data() {
    return {
      defaultMenu: null,
      defaultTable: {name:"", cols:[]},
      total: 5, //数据总数
      tableData: [],
      selection: [],  //多选里选中的项
      editDialog: {
        show: false,
        form: {},
        title: "新增",
      },
      loading: {
        table: false,
        edit: false
      },
    }
  },
  methods: {
    //通用方法
    getShowOperations(item) {
      let showOperations = this.rowMoreOperations.filter(ope => {
        if (ope.show == null)
          return true;

        return typeof ope.show === 'function' && ope.show(item)
      })

      return showOperations;
    },
    handleRowMoreOperation({item, command}) {
      this.$emit("handle-row-more-operation", {item, command})
    },
    flushTable() {
      this.$refs.table.flushTable();
    },
    add() {
      this.editDialog.show = true;
      this.editDialog.title = "新增"
      this.editDialog.form = {etc: {}};
    },
    edit(item) {
      this.editDialog.show = true;
      this.editDialog.title = "编辑"
      this.editDialog.form = JSON.parse(JSON.stringify(item));
    },
    //允许外部重新编辑表单
    beforeEditConfirm(form) {
      this.$emit("before-edit-confirm", form);
    },
    onEditConfirm(form) {
      //允许外部重新编辑表单
      this.beforeEditConfirm(form);

      this.loading.edit = true;
      api.save(form, this.table.path)
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
        api.del(idList, this.table.path)
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
  mounted() {
    this.defaultMenu = this.currentMenu

    if (this.outsideTable == null)
    {
      this.getTableStructure(this.defaultMenu.tableId).then(res => {
        this.defaultTable = res;
      })
    }
  },
}
</script>
<style lang="scss">
@import "@/scss/scss.scss";

</style>