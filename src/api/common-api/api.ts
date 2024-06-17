
import store from '@/store';
import tableApi from '@/api/sys/table';
import axios from 'axios';
import encryptedPost from "@/common/encryptedPost"

function currentMenu() {
  return store.getters.currentMenu
}

async function getTableStructure (tableIdOrName) {
  let table = store.state.tableMap[tableIdOrName];
  if (table != null && Array.isArray(table.cols))
    return table;

  if (typeof tableIdOrName == "number")
  {
    let tableId = tableIdOrName;
    table = await tableApi.getById(tableId)
  }

  if (typeof tableIdOrName == "string")
  {
    let tableName = tableIdOrName;
    table = await tableApi.getByName(tableName)
  }
  if (table == null) 
    return {cols: []}
    
  if (!Array.isArray(table.cols))
    table.cols = [];
  else 
    table.cols.forEach(col => {
      col.show = col.show == 1;
      col.disable = col.disable == 1;
    })
  
  store.commit("putTable", table);

  return table
}

function getByIdBatch({ids, table, showCols}) {
  return encryptedPost("/sys/public/getByIdBatch", {ids, table, showCols});
}

var api = {
  page,
  pagePlus,
  pageSuper,
  save,
  del,
  update,
  updatePlus,
  getById,
  getByIdBatch
}
function clearArray(entity) {
  let entity2 = {...entity}
  if (typeof entity2 === 'object')
  {
    for (let k in entity2) {
      let val = entity2[k]
      if (Array.isArray(val))
      entity2[k] = null;
      if (typeof val === 'string' && val.length === 0)
      entity2[k] = null;
    }
  }
  // console.log("净化后的实体", entity2)
  return entity2
}

function clearObj(entity) {
  let entity2 = {...entity}
  if (typeof entity2 === 'object')
  {
    for (let k in entity2) {
      let val = entity2[k]
      if (typeof val === "string" && val.length == 0)
        entity2[k] = null;
    }
  }
  // console.log("净化后的实体", entity2)
  return entity2
}

async function page(params: object, url:string = currentMenu().path) {
  return await encryptedPost(url + "/page", params);
}

async function pagePlus(filters: object, url:string = currentMenu().path) {
  return await encryptedPost(url + "/pagePlus", {...filters});
}

interface SuperFilter {
  current?: number,
  size?: number,
  filterList?: SuperFilterItem[],
  orderByList?: String,
}

interface SuperFilterItem {
  logic?: String,
  column?: String,
  compare?: String,
  values?: String[],
}

async function pageSuper(superFilter: SuperFilter, url:string = currentMenu().path) {
  return await encryptedPost(url + "/pageSuper", {...superFilter});
}

async function save(entity: object, url:string = currentMenu().path) {
  return await encryptedPost(url + "/save", clearArray(entity));
}

async function del(ids: number[], url:string = currentMenu().path) {
  return await encryptedPost(url + "/delete", {ids});
}

async function update(list: object[], url:string = currentMenu().path) {
  return await encryptedPost(url + "/updatePlus", list);
}

async function updatePlus(list: object[], url:string = currentMenu().path) {
  return await encryptedPost(url + "/updatePlus", list);
}

async function getById(id: Number, url:string = currentMenu().path) {
  return await encryptedPost(url + "/getById", {id});
}


export type Filter = SuperFilter
export type FilterItem = SuperFilterItem

export {
  getTableStructure,
  currentMenu,
  api
}
