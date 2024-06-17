<template>
<el-container v-permit="permit" style="background-color: white; box-shadow: 0 2px 10px 0 rgb(94 86 105 / 10%);">
  <header class="com-header">
    <slot name="header">
      编辑
    </slot>
  </header>
  <!-- <el-skeleton :rows="8" animated :loading="loading" /> -->
  <el-form :model="modelValue" :rules="rules" ref="ruleForm" v-loading="loading" class="com-main">
    <el-form-item v-for="(col, idx) in showColumns" :key="idx" :label="col.name" :label-width="100" style="text-align: left" :prop="col.value">
      <slot :name="'column-' + col.value" :form="modelValue" :column="col" v-if="col.show">
        <div v-if="col.formatDicId > 0">
          <el-select v-model="modelValue[col.value]" :placeholder="modelValue[col.name]" :disabled="col.disable">
            <el-option v-for="(option, idx) in getChildren(col.formatDicId)" 
              :key="idx" 
              :label="option.name" 
              :value="option.value">
            </el-option>
          </el-select>
        </div>
        <div v-else-if="col.type === ColTypeVal.FK">
          <el-button :disabled="col.disable" @click="beforeSelect(col)">
            {{ getFkColValue(col) }}
          </el-button>
        </div>
        <div v-else-if="col.type === ColTypeVal.String">
          <el-input :placeholder="col.descr" type="text" v-model="modelValue[col.value]" :disabled="col.disable" :name="col.value" show-message ></el-input>
        </div>
        <div v-else-if="col.type === ColTypeVal.Number">
          <el-input :placeholder="col.descr" type="number" v-model="modelValue[col.value]" :disabled="col.disable" :name="col.value" show-message ></el-input>
        </div>
        <div v-else-if="col.type === ColTypeVal.Password">
          <el-input :placeholder="col.descr" type="password" v-model="modelValue[col.value]" :disabled="col.disable" :name="col.value" show-message ></el-input>
        </div>
        <div v-else-if="col.type === ColTypeVal.Boolean">
          <el-switch v-model="modelValue[col.value]" :disabled="col.disable"></el-switch>
        </div>
        <div v-else-if="col.type === ColTypeVal.DateTime">
          <el-date-picker
            :disabled="col.disable"
            v-model="modelValue[col.value]"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
          >
          </el-date-picker>
        </div>
        <div v-else-if="col.type === ColTypeVal.Image">
            <el-upload
              :disabled="col.disable"
              class="avatar-uploader"
              :action="servletPath + '/upload/image'"
              :show-file-list="false"
              :on-success="handleImageUploadSuccess(col)"
              :before-upload="beforeImageUpload"
              accept="image/*"
            >
              <img v-if="modelValue[col.value]" :src="formatSrc(modelValue[col.value])" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
        </div>
        <div v-else-if="col.type === ColTypeVal.Video">
          <el-upload
            :disabled="col.disable"
            class="avatar-uploader"
            :action="servletPath + '/upload/video'"
            :show-file-list="false"
            :on-success="handleVideoUploadSuccess(col)"
            accept="video/*"
          >
            <video v-if="modelValue[col.value]" width="320" :src="formatSrc(modelValue[col.value])" controls >
              您的浏览器不支持Video标签。
            </video>
            <i v-else class="el-icon-plus video-uploader-icon" style="width: 320px; height: 180px;"></i>
          </el-upload>
          
        </div>
        <div v-else-if="col.type === ColTypeVal.WangEditor">
          <wang-editor v-model="modelValue[col.value]"></wang-editor>
        </div>
        <div v-else-if="col.type === ColTypeVal.TextArea">
          <textarea v-model="modelValue[col.value]" style="width: 100%; height: 150px;"></textarea>
        </div>
        <div v-else>
          <el-input :placeholder="col.descr" type="text" v-model="modelValue[col.value]" :disabled="col.disable" :name="col.value" show-message ></el-input>
        </div>
      </slot>
    </el-form-item>
  </el-form>
  <el-footer>
  <slot name="footer">
    <slot name="cancelBtn">
      <el-button @click="$emit('cancel')" :loading="loading">取 消</el-button>
    </slot>
    <slot name="confirmBtn">
      <el-button type="primary" @click="submitForm" :disabled="submitting" :loading="loading">确 定</el-button>
    </slot>
  </slot>
</el-footer>

<el-dialog v-model="selectorDialog.show" ref="selector" width="90%">
  <com-selector @select="onSelect" :outsideTable="selectorDialog.table">
    <template #title>
      选择{{ selectorDialog.col.name }}
    </template>
  </com-selector>
</el-dialog>
</el-container>
</template>
<script>
import { ref } from 'vue';
import {DicMap} from '@/config/Constant'
import WangEditor from './WangEditor.vue';
import vueConfig from '@/../vue.config'
import {api} from '@/api/common-api/api'
import ComSelector from './ComSelector.vue';
export default {
  components: { WangEditor, ComSelector },
  emits: ['cancel', 'confirm'],
  props: {
    columns: {
      required: true,
      type: Array,
    },
    modelValue: {
      required: true,
      type: Object,
    },
    loading: {
      required: false,
      type: Boolean,
      default: false
    },
    submitting: {
      required: false,
      type: Boolean,
      default: false
    },
    permit: {
      required: false,
      default: 'edit',
    },
    hideColumnIds: {
      required: false,
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      servletPath: "",
      ColTypeVal: DicMap.ColTypeVal,
      rules: {},
      selectorDialog: {
        show: false,
        table: null,
        col: null,
      },
      fkValues: {},
    }
  },
  watch: {
    columns(newVal, oldVal) {
      this.initRules();
    },
    modelValue(newVal) {
      this.getAllFk()
    }
  },
  computed: {
    showColumns() {
      let columns = this.columns.filter(col => {
        let hide = this.hideColumnIds.findIndex(id => id === col.id) >= 0;
        return col.show && !hide
      });
      
      return columns;
    }
  },
  methods: {
    beforeSelect(col) {
      this.selectorDialog.col = col;
      this.getTableStructure(col.fkTable).then(res => {
        // console.log("res", res)
        this.selectorDialog.show = true;
        this.selectorDialog.table = res;
        // if (this.$refs.selector) {
        //   this.$refs.selector.flushTable()
        // }
      });
    },
    onSelect(item) {
      // console.log("onSelect", item)
      this.modelValue[this.selectorDialog.col.value] = item.id
      this.fkValues[this.selectorDialog.col.value] = item
      this.selectorDialog.show = false;
    },
    initRules() {
      // console.log("initRules")
      let rules = {};
      for (let col of this.columns) {
        let ruleDicIds = JSON.parse(col.ruleDicIds)
        let ruleDics = [];
        for (let dicId of ruleDicIds) {
          let dic = this.getDicBy.valueAndParentId(dicId, DicMap.RegexRuleId);
          if (dic != null)
            ruleDics.push(dic)
        }

        let colRules = [];
        for (let rule of ruleDics) {
          let pattern = rule.stringValue;
          let errMessage = rule.name;
          let validator = (rule, value, callback) => {
            // console.log("validator rule", rule)
            let regex = RegExp(pattern)
            if (!regex.test(value))
              callback(new Error(errMessage))
            else
              callback()
          }
          
          // console.log("validator", validator)
          colRules.push({validator: validator, trigger: 'change'});
        }

        rules[col.value] = colRules;
      }

      this.rules = rules;
    },
    getChildren(dicId) {
      let dic = this.getDicBy.id(dicId);
    
      if (dic == null)
        return [];

      return dic.children != null ? dic.children : [];
    },
    validateGenerator(pattern, errMessage) {
      let regex = RegExp(pattern)

      return (rule, value, callback) => {

        if (!regex.test(value))
          callback(new Error(errMessage))
        else
          callback()
      }
    },
    submitForm() {
      for (let key in this.rules) {
        if (this.modelValue[key] === undefined)
          this.modelValue[key] = ""
      }

      this.$refs.ruleForm.validate((valid) => {
        // console.log("valid", valid)
        if (valid) 
          this.$emit('confirm', this.modelValue)
        else 
        {
          this.$message.error("验证失败");
          return false;
        }
      });
    },
    handleImageUploadSuccess(col) {
      let handler = (res, file) => {
        if (!res.success)
        {
          this.$message.error(res.message);
          return;
        }
        this.modelValue[col.value] = res.data;
      }
      return handler;
    },
    handleVideoUploadSuccess(col) {
      let handler = (res, file) => {
        if (!res.success)
        {
          this.$message.error(res.message);
          return;
        }
        this.modelValue[col.value] = res.data;
      }
      return handler;
    },
    beforeImageUpload(file) {
      const allowTypes = ['image/jpeg', 'image/png', 'image/gif']
      const isAllow = allowTypes.indexOf(file.type) >= 0;
      const isLt4M = file.size / 1024 / 1024 < 4;

      if (!isAllow) {
        this.$message.error('上传头像图片只能是 jpg、png、gif 格式!');
      }
      if (!isLt4M) {
        this.$message.error('上传头像图片大小不能超过 4MB!');
      }
      return isAllow && isLt4M;
    },
    //通过列拿到对应外键值
    getFkColValue(col) {
      let value = this.fkValues[col.value];
      if (value != null) 
        return value[col.fkShowCol]
    
      return this.modelValue[col.value]
    },
    //处理所有外键
    getAllFk() {
      // console.log("getAllFk")
      let fkCols = []
      for (let col of this.columns) {
        this.getOneFk(col)
      }
    },
    //处理一个外键
    getOneFk(col) {
      if (col && col.type === this.ColTypeVal.FK && col.fkTable && col.fkCol && col.fkShowCol) {
         //得到外键列的值
        let value = this.modelValue[col.value];

        //通过外键列的值列表，得到所有外键对应表的某一列
        this.getOutsideValue(col, value, col.fkTable, col.fkShowCol);
      }
    },
    //处理当个外键
    getOutsideValue(col, value, fkTable, fkShowCol) {
      api.getByIdBatch({
        ids: [value],
        table: fkTable,
        showCols: [fkShowCol]
      })
      .then(res => {
        // console.log("res", res)
        //设置缓存
        this.fkValues[col.value] = res[0];
      })
    }
  },
  mounted() {
    let proxy = vueConfig.devServer.proxy;
    this.servletPath = Object.keys(proxy)[0];
    this.initRules();
    if (this.modelValue) {
      this.getAllFk()
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
    border: 1px #ECEFF1 solid;
    border-radius: 2%;
    background-color: rgba(#E1F5FE, 0.1);
    transition: all 0.2s linear;
    &:hover {
      background-color: rgba(#E1F5FE, 0.8);
    }
  }
  .avatar {
    width: 178px;
    display: block;
  }

  .video-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 320px;
    height: 180px;
    text-align: center;
    line-height: 180px;
    border: 1px #ECEFF1 solid;
    border-radius: 2%;
    background-color: rgba(#E1F5FE, 0.1);
    transition: all 0.2s linear;
    &:hover {
      background-color: rgba(#E1F5FE, 0.8);
    }
  }

  .com-header {
    padding: 20px;
    background-color: #01579B;
    color: white;
    text-align: left;
  }

  .com-main {
    min-height: 200px;
    padding: 20px;
  }
</style>