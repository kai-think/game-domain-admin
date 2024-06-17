<template>
<el-container style="height: 100%; background-color: white; box-shadow: 0 2px 10px 0 rgb(94 86 105 / 10%);">
  <el-header class="com-header" v-if="!hideHeader">
    <slot name="header">
      <slot name="header-add">
        <el-button class="btn-text-primary" style="color: white"  @click="$emit('headerAdd', $refs.tree.getCheckedKeys())" :loading="loading" v-permit="'add'">新增</el-button>
      </slot>
      <slot name="header-delete">
        <el-button class="btn-text-danger" style="color: white"  @click="$emit('headerDelete', $refs.tree.getCheckedKeys())" :loading="loading" v-permit="'delete'">删除</el-button>
      </slot>
      <slot name="header-more">

      </slot>
    </slot>
  </el-header>
  <el-main style="padding: 0; height: 100%; margin-top: 20px;">
    <el-tree 
      v-loading="loading"
      highlight-current
      :show-checkbox="checkbox"
      :data="tree" 
      :props="defaultProps" 
      :draggable="draggable"
      :expand-on-click-node="false"
      :node-key="defaultProps.id"
      :default-expanded-keys="defaultExpandedKeys"
      :default-checked-keys="defaultCheckedKeys"
      :allow-drop="allowDrop"
      ref="tree"
      @node-click="$emit('click', $event)"
      @node-drop="handleDrop"
      @check-change="$emit('checkChange', $refs.tree.getCheckedKeys())"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
    >

      <template #default="{ node, data }">
        <div class="parent">
          <span class="custom-tree-node">
            <slot name="node" :item="data">
              <span>{{ data.name }}</span>
            </slot>
            <slot name="node-operation" :item="data">
              <span class="child">
                <slot name="node-operation-add" :item="data">
                  <i class="el-icon-plus btn-icon-text-style" @click.stop="$emit('add', data)" v-permit="'add'"></i>
                </slot>
                <slot name="node-operation-more" :item="data">

                </slot>
              </span>
            </slot>  
          </span>
        </div>
      </template>
      
    </el-tree>
  </el-main>
</el-container>
</template>
<script>
import dicApi from '@/api/sys/dic';
import { ref } from 'vue';
export default {
  emits: ['add', 'click', 'drop', 'headerAdd', 'headerDelete', 'checkChange', 'headerPaste'],
  props: {
    tree: {
      required: true,
      type: Array,
      default: [],
    },
    allowDrop: {
      required: false,
      type: Function,
      default: (draggingNode, dropNode, type) => true,
    },
    draggable: {
      required: false,
      type: Boolean,
      default: false
    },
    checkbox: {
      required: false,
      type: Boolean,
      default: false
    },
    defaultExpandedKeys: {
      required: false,
      type: Array,
      default: [],
    },
    defaultCheckedKeys: {
      required: false,
      type: Array,
      default: [],
    },
    defaultProps: {
      required: false,
      type: Object,
      default: {
        id: 'id',
        parentId: 'parentId',
        children: 'children',
        label: 'name'
      },
    },
    checkedKeys: {
      required: false,
      type: Array,
      default: [],
    },
    hideHeader: {
      required: false,
      type: Boolean,
      default: false
    },
    loading: {
      required: false,
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      expandedKeys: [],
      copy: {
        keys: [],
      }
    }
  },
  computed: {
    copyBtnText() {
      return this.copy.keys.length === 0 ? "复制" : "粘贴"
    }
  },
  watch: {
    checkedKeys() {
      this.$refs.tree.setCheckedKeys(this.checkedKeys);
    }
  },
  methods: {
    handleDrop(draggingNode, dropNode, dropType, ev) {
      this.$emit("drop", draggingNode, dropNode, dropType, ev)
    },
    handleNodeExpand(data, node, nodeComponent) {
      let id = this.defaultProps.id;
      this.expandedKeys.push(data[id]);
    },
    handleNodeCollapse(data, node, nodeComponent) {
      let id = this.defaultProps.id;
      this.expandedKeys = this.expandedKeys.filter(e => e !== data[id]);
    },
    handleCopy() {
      if (this.copy.keys.length === 0)
      {
        let keys = $refs.tree.getCheckedKeys()
        this.copy.keys = keys;
        return
      }
      
      $emit('headerPaste', this.copy.keys)
      this.copy.keys = [];
    },
    getExpandedKeys() {
      return this.expandedKeys;
    },
    append(item, toId) {
      this.$refs.tree.append(item, toId)
    },
    remove(item, FromId) {
      this.$refs.tree.remove(item, FromId)
    },
    insertBefore(item, BeforeId) {
      this.$refs.tree.insertBefore(item, BeforeId)
    },
    insertAfter(item, AfterId) {
      this.$refs.tree.insertAfte(item, AfterId)
    },
    getCheckedKeys() {
      return this.$refs.tree.getCheckedKeys()
    },
    setCheckedKeys(keys) {
      this.$refs.tree.setCheckedKeys(keys)
    },
    updateKeyChildren(key, data) {
      this.$refs.tree.updateKeyChildren(key, data);
    },
  },
  created() {

  }
}
</script>
<style lang="scss" scoped>
  @import "@/scss/scss";
  .custom-tree-node {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
    flex: 1;
  }

  .hover-show {
    visibility: hidden;
    &:hover {
      visibility: inherit;
    }
  }

  .parent {
    display: flex;
    flex: 1;
    justify-content: space-between;
    align-content: center;
    &:hover .child {
      visibility: inherit;
    }
  }
  .child {
    visibility: hidden;
  }

  .com-header {
    background-color: #01579B;
    padding: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }
</style>