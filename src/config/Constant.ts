

const DicMap = {
  ColTypeVal: {
    Dic: -2,
    FK: -1,
    PK: 0,
    Number: 1,
    String: 2,
    TextArea: 20,
    Boolean: 3,
    DateTime: 4,
    WangEditor: 5,
    Image: 6,
    Video: 7,
    Password: 8
  },
  MenuTypeVal: {
    Menu: 0,
    MenuLeaf: 1,
    Button: 2,
    Middle: 3,
  },
  RegexRuleId: 44,
}

const SysTableId = {
  Table: 1,
  TableCol: 2,
  User: 3,
}

const SysMenuColId = {
  Icon: 13,
  Component: 15,
  Path: 16,
  TableId: 20, 
}

const Permission = {
  Add: 'add',
  Delete: 'delete',
  MultiDelete: 'multi-delete',
  Edit: 'edit',
  Search: 'search',
}

export {
  DicMap,
  SysTableId,
  Permission,
  SysMenuColId,
}