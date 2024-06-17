<template>
<div>
  <div v-if="!editable">
    <div v-if="col.formatDicId > 0">
      {{ getDicBy.valueAndParentId(item[col.value], col.formatDicId).name }}
    </div>
    <div v-else-if="col.type === ColTypeVal.Image">
      <el-image
        :style="'width:' + col.width + 'px; height: 100px'"
        :src="formatSrc(item[col.value])"
        fit="scale-down"
        :preview-src-list="[formatSrc(item[col.value])]"
        ></el-image>
    </div>
    <div v-else-if="col.type === ColTypeVal.Video">
      <el-button type="text" @click="onClick(col, item)">视频</el-button>
    </div>
    <div v-else-if="col.type === ColTypeVal.WangEditor">
      <el-button type="text" @click="onClick(col, item)">富文本</el-button>
    </div>
    <div v-else-if="col.type === ColTypeVal.TextArea">
      <textarea v-model="item[col.value]" disabled :style="'height: 100px; width: ' + col.width + 'px; background: none; border: none; resize: none;'"></textarea>
    </div>
    <div v-else style="max-height: 120px;">
      {{ item[col.value] }}
    </div>
  </div>
</div>
</template>
<script>
import { DicMap } from '@/config/Constant';
export default {
  emits: ["click"],
  props: {
    disable: {
      required: false,
      type: Boolean,
      default: false
    },
    editable: {
      required: false,
      type: Boolean,
      default: false
    },
    col: {
      required: true,
      type: Object,
      default: {type: 2, name: "未知列", value: "undefined", width: "100", descr: "未知列", show: 1, disable: 0},
    },
    item: {
      required: true,
      type: Object,
      default: {type: 2, name: "未知列", value: "undefined", width: "100", descr: "未知列", show: 1, disable: 0},
    }
  },
  data: () => ({
    ColTypeVal: DicMap.ColTypeVal,
  }),
  computed: {
    
  },
  methods: {
    onClick(col, item) {
      this.$emit("click", {col, item})
    }
  }
}
</script>
<style lang="scss">
@import "@/scss/scss.scss";

</style>