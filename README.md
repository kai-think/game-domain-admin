# element-plus-template

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## ComSelector 组件

### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|outsideFilter|查询过滤器|object|false|-|{}|
|outsideTable|对应表|object|false|-|当前菜单对应的表|

outsideFilter: {
  filterList: [{column: "列名", compare: "比较符号，如 eq、like、ge、between、le", values: ["第一个值", "between时有第二个值"]}],
  orderByList: ["列名1", "列名2"],
}


### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| select |  当某行被选中 | (item: 被选中的行数据) |


### 插槽

| name |	说明 | 属性|
| ---- | ----- | --- | 
| title |	标题 | {} |
| column-[对应列的value] |	自定义该列 | {item: 该列, idx: 索引, column: 该列结构} |


## ComSimpleTableView 组件

### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|outsideFilter|查询过滤器|object|false|-|{}|
|outsideTable|对应表|object|false|-|当前菜单对应的表|

outsideFilter: 

    {
      filterList: [{column: "列名", compare: "比较符号，如 eq、like、ge、between、le", values: ["第一个值", "between时有第二个值"]}],
      orderByList: ["列名1", "列名2"],
    }


### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| row-click |  当某行被点击 | (item: 被点击的行数据) |


### 插槽

| name |	说明 | 属性|
| ---- | ----- | --- | 
| title |	标题 | {} |
| column-[对应列的value] |	自定义该列 | {item: 该列, idx: 索引, column: 该列结构} |
| header-operation |	头部的操作插槽 | {loading: 控制加载状态, selection: 被选中的数据列表} |
| row-operation |	行的操作插槽 | {item: 该列, idx: 索引} |


## ComTableView 组件

### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|outsideFilter|查询过滤器|object|false|-|{}|
|outsideTable|对应表|object|false|-|当前菜单对应的表|
|outsideMenu|对应菜单，为了作权限控制的|object|false|-|当前菜单|
|rowMoreOperations|行的更多操作|array|false|-|[]|
|showAddBtn|是否显示增加按钮|boolean|false|true/false|true|
|showEditBtn|是否显示编辑按钮|boolean|false|true/false|true|
|showDeleteBtn|是否显示删除按钮|boolean|false|true/false|true|

outsideFilter: 

    {
      filterList: [{column: "列名", compare: "比较符号，如 eq、like、ge、between、le", values: ["第一个值", "between时有第二个值"]}],
      orderByList: ["列名1", "列名2"],
    }

更多操作的数组元素类似为

    {
      icon: "el-icon-crop",
      name: "切换可用性",
      value: "test1",
      permit: true, //可以是true或字符串，也可以省略，默认为true
      show: (item) => {   //决断当前行的该操作是否显示，接受当前行 item，返回true或false，也可以省略
        return item.id > 3 && item.id < 6
      }
    }


### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| row-click |  当某行被点击 | (item: 被点击的行数据) |
| handle-row-more-operation |  更多操作 | ({item: 当前行, command: 对应command的value}) |
| before-edit-confirm |  新增或编辑前允许外部编辑 | (form: 要更改的表单) |

### 插槽

| name |	说明 | 属性|
| ---- | ----- | --- | 
| title |	标题 | {} |
| header-add |	头部的新增按钮 | {loading} |
| header-delete |	头部的删除按钮 | {loading, selection} |
| header-more-operation |	头部的更多操作 | {loading, selection} |
| row-edit-btn |	行的编辑按钮 | {item: 该列, idx: 索引} |
| row-delete-btn |	行的删除按钮 | {item: 该列, idx: 索引} |
| row-more-operation |	行的更多接任 | {item: 该列, idx: 索引} |
| column-[对应列的value] |	自定义该列 | {item: 该列, idx: 索引, column: 该列结构} |
| edit-column-[对应列的value] |	编辑中的自定义该列 | {item: 该列, idx: 索引, column: 该列结构} |
| edit-header |	编辑中的头部 | {} |
| edit-footer |	编辑中的底部 | {} |

## ComTable 组件
### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|tableData|表数据|Array|true|-|[]|
|columns|列结构|Array|true|-|[]|
|total|总共多少行|Number|false|-|-|
|outsideFilter|外部过滤器|Object|false|-|{filterList:[], orderByList:[]}|
|loading|加载中|Boolean|false|-|false|

### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| getTableData |  刷新数据 | (filter: object)，使用pageSuepr接受 |
| rowClick |  行点击事件 | (row: object) 当前行 |
| multiDelete |  多选删除事件 | (selection: Array) 主键数组  |
| moreOperateCommand |  更多操作 | ({item: 当前行, command: 对应command的value}) |
| selectionChange |  选择改变 | (selection: Array) 主键数组 |
| filterReset |  查询条件重置 | - |

### 插槽

| name |	说明 | 属性|
| ---- | ----- | --- | 
| title |	标题 | {} |
| header-operation |	头部的操作插槽 | {loading, selection} |
| column-[对应列的value] |	自定义该列 | {item: 该列, idx: 索引, column: 该列结构} |
| row-operation |	行的操作插槽 | {item: 该列, idx: 索引} |

## ComEdit 组件
### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|modelValue|数据|Object|true|-|-|
|columns|列结构|Array|true|-|[]|
|submitting|是否可提交|Boolean|false|-|false|
|permit|权限|String \| Boolean|false|-|'edit'|
|hideColumnIds|隐藏列的id列表|Array|false|-|[]|
|loading|加载中|Boolean|false|-|false|

### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| cancel |  取消 | - |
| confirm |  提交 | (modelValue: 表单数据) |

### 插槽

| name |	说明 | 属性|
| ---- | ----- | --- | 
| header |	头部 | - |
| column-[对应列的value] |	自定义该列 | {form: 整个表单, column: 该列结构} |
| footer |	脚部 | - |
| cancelBtn |	取消按钮 | - |
| confirmBtn |	确认按钮 | - |

## ComTree 组件
### 属性

|参数|说明|类型|必须|可选值|默认值|
|--- |---|----|----|------|----|
|tree|树数据|Array|true|-|[]|
|defaultProps|树的默认属性|Object|false|-|`{id: 'id', parentId: 'parentId', children: 'children', label: 'name'}`|
|allowDrop|针对节点允许拖动|Function|false|-|(draggingNode, dropNode, type) => true|
|draggable|全局允许拖动|Boolean|false|-|false|
|checkbox|开启多选|Boolean|false|-|false|
|defaultExpandedKeys|默认展开节点key列表|Array|false|-|[]|
|defaultCheckedKeys|默认选中节点key列表|Array|false|-|[]|
|hideHeader|隐藏头部|Boolean|false|-|false|
|loading|加载中|Boolean|false|-|false|


### 事件

| 事件名称 | 说明 |	回调参数|
| ------- |  --- | ------ |
| add |  行新增事件 | (row: object) |
| click |  行点击事件 | (row: object) |
| drop |  拖动事件 | (draggingNode, dropNode, dropType, ev) 共四个参数，依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event |
| headerAdd |  头部新增事件 | (row: object) |
| headerDelete |  头部新增事件 | (row: object) |
| checkChange |  选中改变事件 | (row: object) |

### 插槽

| name |	说明 | 属性 |
| ---- | ----- | --- |
| header |	整个头部 | - |
| header-add |	头部的新增按钮 | - |
| header-delete |	头部的删除按钮 | - |
| header-more |	头部的更多按钮 | - |
| node |	节点 | {item: 数据} |
| node-operation |	节点操作的全部 | {item: 数据} |
| node-operation-add |	节点操作中的增加按钮 | {item: 数据} |
| node-operation-more |	节点操作中的更多按钮 | {item: 数据} |


## views/test/video

视图模板

## views/test/article

里面有处理外键的策略