<template>
<div :id="editorId">

</div>
</template>
<script>
import { onBeforeUnmount, onMounted, reactive, ref, toRefs, watch } from 'vue'
import E from 'wangeditor'
import axios from 'axios';
import uploadApi from '@/api/upload';
import vueConfig from '@/../vue.config'

export default {
  props: {
    editorId: {
      required: false,
      type: String,
      default: 'wang-editor',
    },
    modelValue: {
      required: true,
      default: "",
    },
    disable: {
      required: false,
      type: Boolean,
      default: false,
    }
  },
  setup(props, context) {
    const {editorId, modelValue, disable} = toRefs(props);
    
    let editor;
    onMounted(() => {
      editor = new E('#' + editorId.value);
      //设置高度为 500px
      editor.config.height = 500

      // 配置 onchange 回调函数
      editor.config.onchange = function (newHtml) {
        context.emit("update:modelValue", newHtml)
      };
      // 配置触发 onchange 的时间频率，默认为 200ms
      editor.config.onchangeTimeout = 500; // 修改为 500ms

      //自定义上传图片
      editor.config.customUploadImg = function (resultFiles, insertImgFn) {
        // resultFiles 是 input 中选中的文件列表
        // insertImgFn 是获取图片 url 后，插入到编辑器的方法
        let reqList = [];
        for (let file of resultFiles) {
          let form = new FormData();
          form.append('file', file)
          reqList.push(uploadApi.image(form));
        }

        axios.all(reqList)
        .then(axios.spread((...responses) => {
          let proxy = vueConfig.devServer.proxy;
          let servletPath = Object.keys(proxy)[0];
          let imgUrls = [];
          responses.forEach(res => {
            imgUrls.push(servletPath + "/static" + res);
          })
          // 上传图片，返回结果，将图片插入到编辑器中
          insertImgFn(imgUrls)
        }))
      }

      editor.config.customUploadVideo = function (resultFiles, insertVideoFn) {
        // resultFiles 是 input 中选中的文件列表
        // insertVideoFn 是获取视频 url 后，插入到编辑器的方法
        let reqList = [];
        for (let file of resultFiles) {
          let form = new FormData();
          form.append('file', file)
          reqList.push(uploadApi.video(form));
        }

        axios.all(reqList)
        .then(axios.spread((...responses) => {
          let proxy = vueConfig.devServer.proxy;
          let servletPath = Object.keys(proxy)[0];
          let videoUrls = [];
          responses.forEach(res => {
            videoUrls.push(servletPath + "/static" + res);
          })
          // 上传图片，返回结果，将图片插入到编辑器中
          insertVideoFn(videoUrls)
        }))
      }



      editor.create()
      editor.txt.html(modelValue.value) //重新设置编辑器内容

      if (disable.value)
      {
        editor.disable();
        editor.config.menus = [];
      }
    })

    watch(modelValue, (newVal, oldVal) => {
      editor.txt.html(newVal) //重新设置编辑器内容
    })

    watch(disable, (newVal, oldVal) => {
      if (newVal)
        editor.disable();
      else
        editor.enable();
    })

    onBeforeUnmount(() => {
      editor.destroy()
      editor = null
    })
  }
} 
</script>
<style lang="lass" scoped>

</style>