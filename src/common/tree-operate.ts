type TreeProps = {children: string, id: string, parentId: string};
type Predict = (tree: any) => boolean;
var defaultProps: TreeProps = {children: 'children', id: 'id', parentId: 'parentId'};
var defaultPredict: Predict = (tree) => true

//返回值表示是否继续搜索
function traversal(treeArr: any[], predict: Predict = defaultPredict, props: TreeProps = defaultProps):boolean {
  // console.warn("树遍历", treeArr, props, predict)
  let childrenProp = props.children;
  
  for (let tree of treeArr) {
    if (!predict(tree)) 
      return false;
    
    let children = tree[childrenProp];
    if (!Array.isArray(children))
      continue;

    if (!traversal(children, predict, props))
      return false;
  }

  return true;
}

function findArr(treeArr: any[], ids: [] = [], props: TreeProps = defaultProps):any[] {
  let retTree:any[] = [];
  traversal(treeArr, (tree) => {
    for (let i in ids) {
      if (tree[props.id] === ids[i])
        retTree[i] = tree;
    }
    return true;
  }, props)

  return retTree;
}

function find(treeArr: any[], id: any, props: TreeProps = defaultProps):any {
  let ret:any = null;
  traversal(treeArr, (tree) => {
    if (tree[props.id] === id)
    {
      ret = tree;
      return false;
    }
    
    return true;
  }, props)

  return ret;
}

export {
  TreeProps, Predict,
  traversal, find, findArr
}