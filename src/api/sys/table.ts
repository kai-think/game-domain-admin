import axios from "axios"
import encryptedPost from "@/common/encryptedPost"
var tableApi = {
  page(params) {
    return encryptedPost("/sys/table/page", {params});
  },
  getById(id) {
    return encryptedPost("/sys/table/getById", {id});
  },
  getByName(name: string) {
    return encryptedPost("/sys/table/getByName", {name});
  },
  initTableCols(tableId) {
    return encryptedPost("/sys/table/initTableCols", {tableId});
  },
  
}

export default tableApi;