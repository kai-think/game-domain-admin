<template>
<el-container class="container">
  <header class="header">
    <div>
      <el-button class="btn-text-primary" style="color: white; font-size: 14px" icon="el-icon-back" @click="$router.push('/')">返回</el-button>
    </div>
    <span style="margin-left: 20px; font-size: 20px;">{{ msg }}</span>
  </header>
</el-container>
</template>
<script>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router';
export default {
  setup(props, context) {
    const $route = useRoute();
    const msg = ref($route.params.msg);

    return {
      msg,
    }
  }
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss.scss";
  .container {
    height: 100%; 
    width: 100%;
    padding: 20px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    background-image: url("/bg-error.png");
    background-repeat: repeat-x;
    background-position: center;
    object-fit: cover;
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
  } 
</style>