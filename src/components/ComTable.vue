<template>
<el-container class="elevation-1">
  <el-header class="com-header">
    <div style="color: white; font-size: 20px;">
      <slot name="title">
        {{ currentMenu.name }}
      </slot>
    </div>
    <div style="margin-top:20px; display: flex; justify-content: space-between; width: 100%;">
      <!-- 搜索与高级筛选区 -->
      <div  :style="{flex: isSearch ? 1 : 2}">
        <!-- 搜索 -->
        <div v-if="isSearch">
          <el-input
            placeholder="请输入内容"
            v-model="search.text"
            class="input-with-select"
          >
            <template #prepend>
              <el-select v-model="search.column" placeholder="请选择" style="width: 120px;" default-first-option>
                <el-option 
                  v-for="(col, idx) in selectOptions"
                  :key="idx"
                  :label="col.name" 
                  :value="col.value"></el-option>
                <el-option
                  label="高级筛选" 
                  :value="false"
                  @click="handleFilterModeToggle"
                ></el-option>
                <el-option
                  label="重置" 
                  :value="'reset'"
                  @click="handleFilterReset"
                ></el-option>
              </el-select>
            </template>
            <template #append>
              <el-button :loading="loading" icon="el-icon-search" @click="handleSearch"></el-button>
            </template>
          </el-input>
        </div>
        <!-- 高级筛选 -->
        <div v-else>
          <el-card class="box-card" :body-style="{ padding: '10px 10px 0 10px' }">
            <template #header style="padding: 0; text-align: left;">
              <span style="float: left; cursor: pointer; margin-top: 4px;">
                <i class="el-icon-arrow-left" @click="handleFilterModeToggle"></i>
              </span>
              <span>高级筛选</span>
              <el-button :loading="loading" style="float: right; padding: 3px 0;" type="text" @click="handleSuperFilter">筛选</el-button>
              <el-button style="float: right; padding: 3px 0; margin-right: 10px;" type="text" @click="handleSuperFilterAdd">添加一行</el-button>
            </template>
            <div v-for="(filter, idx) in advancedFilter.filterList" :key="idx" 
              style="display: flex; align-items: center; padding-bottom: 10px;">
              <el-select :disabled="idx === 0" v-model="filter.logic" placeholder="与或" style="width: 80px;" default-first-option>
                <el-option 
                  v-for="(logic, idx) in ['and']"
                  :key="idx"
                  :label="logic" 
                  :value="logic"></el-option>
              </el-select>
              <el-select v-model="filter.column" placeholder="选择列" style="width: 120px; margin-left: 3px;" default-first-option>
                <el-option 
                  v-for="(col, idx) in selectOptions"
                  :key="idx"
                  :label="col.name" 
                  :value="col.value"></el-option>
              </el-select>
              <el-select v-model="filter.compare" placeholder="选择比较方式" style="width: 100px; margin-left: 3px;" default-first-option 
                @change="handleSuperFilerCompareChange(idx)">
                <el-option 
                  v-for="(method, idx) in compareMethods"
                  :key="idx"
                  :label="method.name" 
                  :value="method.value"></el-option>
              </el-select>
              <div v-if="getCompareMethodValueCnt(filter.compare) > 0" style="display: flex; flex: 1;">
                <el-input
                  v-for="idx in getCompareMethodValueCnt(filter.compare)"
                  :key="idx"
                  :placeholder="'内容' + idx"
                  v-model="filter.values[idx - 1]"
                  style="flex: 1; margin-left: 10px;"
                  class="input-with-select"
                ></el-input>
              </div>
              <i class="el-icon-delete font-icon-btn" @click="handleSuperFilterRemove(idx)"></i>
            </div>
          </el-card>
        </div>
      </div>
      <!-- 多选功能区 -->
      <div style="text-align: right; flex: 1">
        <slot name="header-operation" :selection="selection" :loading="loading">

        </slot>
      </div>
    </div>
  </el-header>
  <el-main style="padding: 0; padding-bottom: 0">
    <!-- 数据表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :row-class-name="tableRowClassName"
      @selection-change="handleSelectionChange"
      @row-click="$emit('rowClick', $event)"
      stripe
      style="width: 100%"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      class="com-table"
      :header-row-class-name="'com-table-header'"
      highlight-current-row
    >
      <el-table-column
        align="center"
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        align="center"
        v-for="(col, idx) in showColumns"
        :column-key="col.value"
        :key="idx"
        :prop="col.value"
        :label="col.name"
        :width="col.width"
        sortable="custom"
        :filters="col.formatDicId > 0 ? getFilter(col.formatDicId) : null"

        filter-placement="bottom-end"
      >
        <template #default="{ row, $index, column }">
          <slot :name="'column-' + col.value" :item="row" :idx="$index" :column="col">
            <div v-if="col.formatDicId > 0">
              <el-tag :type="getDic(row, col).color">
                {{ getDic(row, col).name }}
              </el-tag>
            </div>
            <div v-else-if="col.type === ColTypeVal.FK">
              {{ getFkColValue(row, col) }}
            </div>
            <div v-else-if="col.type === ColTypeVal.Image">
              <el-image
                :style="'width:' + col.width + 'px; height: 100px'"
                :src="formatSrc(row[col.value])"
                fit="scale-down"
                :preview-src-list="[formatSrc(row[col.value])]"
                ></el-image>
            </div>
            <div v-else-if="col.type === ColTypeVal.Video">
              <el-button type="text" @click="videoDialog.src = formatSrc(row[col.value]); videoDialog.show = true;">视频</el-button>
            </div>
            <div v-else-if="col.type === ColTypeVal.WangEditor">
              <el-button type="text" @click="editorDialog.text = row[col.value]; editorDialog.show = true">富文本</el-button>
            </div>
            <div v-else-if="col.type === ColTypeVal.TextArea">
              <textarea v-model="row[col.value]" disabled :style="'height: 100px; width: ' + col.width + 'px; background: none; border: none; resize: none;'"></textarea>
            </div>
            <div v-else-if="col.type === ColTypeVal.Password">
              ************
            </div>
            <div v-else style="max-height: 120px;">
              {{ row[col.value] }}
            </div>
          </slot>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" :min-width="190">
        <template #default="scope">
          <slot name="row-operation" :item="scope.row" :idx="scope.$index">
          </slot>
        </template>
      </el-table-column>
    </el-table>
  </el-main>
  <el-footer class="com-footer">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="superFilter.current"
      :page-sizes="[5, 10, 15, 20, 30]"
      :page-size="superFilter.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </el-footer>
  <el-dialog v-model="editorDialog.show" :before-close="()=>editorDialog.show = false">
    <wang-editor v-model="editorDialog.text" :disable="true" editor-id="editor2"></wang-editor>
  </el-dialog>
  <el-dialog v-model="videoDialog.show" :before-close="()=>videoDialog.show = false" width="720px">
    <video width="680" :src="videoDialog.src" controls>
      您的浏览器不支持Video标签。
    </video>
  </el-dialog>
</el-container>
</template>
<script>
import { DicMap } from '@/config/Constant';
import WangEditor from './WangEditor.vue';
import vueConfig from '@/../vue.config'
import {api} from '@/api/common-api/api'
export default {
  components: {WangEditor},
  emits: ['getTableData', 'selectionChange', 'rowClick', 'pageSuper', "filterReset"],
  props: {
    loading: {
      required: false,
      type: Boolean,
      default: false
    },
    columns: {
      required: true,
      type: Array
    },
    tableData: {
      required: true,
      type: Array
    },
    total: {
      required: false,
      type: Number
    },
    outsideFilter: {
      required: false,
      type: Object,
      default: {filterList:[], orderByList:[]},
    },
    disableColumn: {
      required: false,
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      servletPath: "",
      ColTypeVal: {},
      isSearch: true,  //true为搜索，false为高级筛选
      search: {
        text: "",
        column: null,
      },
      superFilter: {
        current: 1,
        size: 10,
        filterList: [],
        orderByList: [], 
      },
      advancedFilter: {
        filterList: [],
        orderByList: [], 
      },
      compareMethods: [
        {name: "相等", value: "eq", valueCnt: 1},
        {name: "相似", value: "like", valueCnt: 1},
        {name: "不等于", value: "ne", valueCnt: 1},
        {name: "大于", value: "gt", valueCnt: 1},
        {name: "小于", value: "lt", valueCnt: 1},
        {name: "在之间", value: "between", valueCnt: 2},
        // {name: "在之中", value: "in", valueCnt: -1},
        {name: "为空", value: "isnull", valueCnt: 0},
        {name: "不空", value: "isnotnull", valueCnt: 0},
        {name: "正则", value: "regexp", valueCnt: 1},
      ],
      choose: {}, //操作列里选择的项
      selection: [],  //多选里选中的项
      colFilters: {},
      editorDialog: {
        show: false,
        text: "",
      },
      videoDialog: {
        show: false,
        src: "",
      },
      fkValues: {},
    }
  },
  computed: {
    showColumns() {
      return this.columns.filter(col => col.show);
    },
    selectOptions() {
      let columns = this.showColumns.filter(col => {
        if (!col.show)
          return false;
        if (col.type == null)
          return true;

        let enableTypes = [DicMap.ColTypeVal.String, DicMap.ColTypeVal.TextArea, DicMap.ColTypeVal.Number, DicMap.ColTypeVal.PK];
        return enableTypes.indexOf(col.type) >= 0;
      });
      return columns;
    },
  },
  watch: {
    outsideFilter(newVal, oldVal) {
      this.getTableData();
    },
    tableData(newVal) {
      this.getAllFk()
    }
  },
  methods: {
    getDic(row, col) {
      return this.getDicBy.valueAndParentId(row[col.value], col.formatDicId)
    },
    handleColClick({col, item}) {
      console.log(col, item)
    },
    //重置筛选
    handleFilterReset() {
      this.search.text = "";
      this.search.column = null;
      this.superFilter = {
        current: 1,
        size: 10,
        filterList: [],
        orderByList: []
      }
      this.advancedFilter = {filterList: [], orderByList: []}
      this.$emit("filterReset");
    },
    //处理高级筛选
    handleSuperFilter() {
      for (let filter of this.advancedFilter.filterList) 
        if (Array.isArray(filter.values)) 
          for (let val of filter.values)
            if (typeof val === "string" && val.length === 0)
            {
              this.$message.error("内容不能为空");
              return;
            }
      
      this.getTableData();
    },
    handleSuperFilerCompareChange(idx) {
      let filter = this.advancedFilter.filterList[idx];
      filter.values = [];
    },
    handleSuperFilterAdd() {
      this.advancedFilter.filterList.push({
        logic: "and",
        column: this.selectOptions[0].value,
        compare: this.compareMethods[0].value,
        values: [],
      })
    },
    handleSuperFilterRemove(idx) {
      let filterList = this.advancedFilter.filterList
      filterList.splice(idx, 1)
      if (idx == 0 && filterList.length > 0)
        filterList[0].logic = null
    },
    handleFilterModeToggle() {
      this.isSearch = !this.isSearch;
      this.advancedFilter.filterList = []
      if (this.isSearch)
      {
        this.search.column = null
        this.search.text = ""
      }
    },
    //处理搜索
    handleSearch() {
      if (this.search.column === null)
      {
        this.$message.warning("没有选择列");
        return;
      }
      
      this.advancedFilter.filterList = [{column: this.humpToUnderline(this.search.column), compare: 'like', values: [this.search.text]}];
      this.getTableData();
    },
    //处理表筛选
    handleSortChange({ column, prop, order }) {
      if (prop === null)
        this.superFilter.orderByList = []
      else
      {
        let orderBy = this.humpToUnderline(prop) + " " + (order == 'descending' ? 'desc' : 'asc');
        this.superFilter.orderByList = [orderBy]
      }
      this.getTableData();
    },
    handleFilterChange(filters) {
      this.superFilter.filterList = [];
      let filter = {}
      for (let key in filters) {
        let first = filters[key];
        if (first.length == 0)
          continue;

        filter.column = key;
        filter.compare = 'in';
        filter.values = filters[key]
        this.superFilter.filterList.push(filter);
      }
      
      this.getTableData();
    },
    handleSizeChange(val) {
      this.superFilter.size = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.superFilter.current = val;
      this.getTableData();
    },
    getTableData() {
      let resultFilter = this.deepClone(this.superFilter);
      this.advancedFilter.filterList.forEach(item => resultFilter.filterList.push(item))
      this.advancedFilter.orderByList.forEach(item => resultFilter.orderByList.push(item))

      this.outsideFilter.filterList.forEach(item => resultFilter.filterList.push(item))
      this.outsideFilter.orderByList.forEach(item => resultFilter.orderByList.push(item))

      this.$emit("getTableData", resultFilter);
    },
    //处理行选择
    handleSelectionChange(val) {
      this.selection = val;
      this.$emit("selectionChange", this.selection);
    },
    //其它方法
    //通过value得到比较方法所需要的值数量
    getCompareMethodValueCnt(value) {
      let method = this.compareMethods.find(m => m.value === value)
      if (method === null)
        return null;

      return method.valueCnt;
    },
    //得到过滤器，应用到 element-ui 上 table 的 filters 属性上
    getFilter(dicId) {
      if (dicId == null || dicId == -1)
        return null;

      let filter = this.colFilters[dicId];
      if (filter != null)
        return filter;

      let dic = this.getDicBy.id(dicId);

      filter = [];
      if (Array.isArray(dic.children))
      {
        for (let child of dic.children) {
          filter.push({text: child.name, value: child.value});
        }
        this.colFilters[dicId] = filter;
      }
      return filter;
    },
    //行样式
    tableRowClassName({row, rowIndex}) {
      if (row.useful === 0) 
        return 'disable';
      
      return '';
    },
    //驼峰转下划线
    humpToUnderline(str){
      return str.replace(/([A-Z])/g,"_$1").toLowerCase()
    },
    //外键处理
    getFkColValue(row, col) {
      let values = this.fkValues[col.value];
      if (!Array.isArray(values)) {
        return row[col.value]
      }
      let val = values.find(v => v.id == row[col.value])

      return val ? val[col.fkShowCol] : "空"
    },
    //处理所有外键
    getAllFk() {
      console.log("getAllFk")
      let fkCols = []
      for (let col of this.columns) {
        if (col.type === this.ColTypeVal.FK && col.fkTable && col.fkCol && col.fkShowCol) {
          fkCols.push(col);
        }
      }
      
      for (let col of fkCols) {
        //得到外键列的值
        let values = [];
        for (let i in this.tableData) {
          let data = this.tableData[i]
          values.push(data[col.value])
        }

        //通过外键列的值列表，得到所有外键对应表的某一列
        this.getOutsideValue(col, values, col.fkTable, col.fkShowCol);
      }
    },
    //处理当个外键
    getOutsideValue(col, values, fkTable, fkShowCol) {
      api.getByIdBatch({
        ids: values,
        table: fkTable,
        showCols: [fkShowCol]
      })
      .then(res => {
        console.log("res", res)
        //设置缓存
        this.fkValues[col.value] = res;
      })
    }
  },
  mounted() {
    let proxy = vueConfig.devServer.proxy;
    this.servletPath = Object.keys(proxy)[0];
    this.ColTypeVal = DicMap.ColTypeVal;
    if (this.tableData) {
      this.getAllFk()
    }
  },
}
</script>
<style lang="scss" scoped>

  @import "@/scss/scss.scss";

  .el-table .disable {
    background-color: #ECEFF1;
  }
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }

  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }

  .com-table {
    
  }
  
  .com-table-header {
    vertical-align: bottom;
    padding-top: 80px;
  }

  .com-header {
    display: flex;
    flex-direction: column;
    background: #01579B;
    padding: 20px;
    border-radius: 1%;
    width: 100%;
    height: auto;
    align-items: flex-start;
  }

  .com-footer {
    background: #FFF;
    padding: 20px 0 10px 0;
  }

  div.el-input-group--append, div.el-input-group--prepend {
    background: none;
    color: white;
  }

  .font-icon-btn {
    padding: 7px;
    
    border-radius: 50%;
    color: black;
    cursor: pointer;
    font-size: 13px;
    margin-left: 10px;
    transition: all 0.2s linear;
    &:hover {
      color: white;
      background: #f56c6c;
    }
  }
</style>