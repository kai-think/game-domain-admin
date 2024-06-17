import axios from "axios"
import {api} from "@/api/common-api/api"
import encryptedPost from "@/common/encryptedPost"
let baseUrl = "/sys/role"
var roleApi = {
  page(params) {
    return api.page(params, baseUrl);
  },
  pagePlus(filters) {
    return api.pagePlus(filters, baseUrl);
  },
  save(role) {
    return api.save(role, baseUrl);
  },
  delete(ids) {
    return api.del(ids, baseUrl);
  },
  assignMenu(roleId, menuIds: Number[]) {
    return encryptedPost("/sys/role/assignMenu", {roleId, menuIds});
  },
  listByUser(userId) {
    return encryptedPost("/sys/role/listByUser", {userId});
  },
  listByCurrentUser() {
    return encryptedPost("/sys/role/listByCurrentUser");
  },
  getFirstByCurrentUser() {
    return encryptedPost("/sys/role/getFirstByCurrentUser");
  },
  listUserRoleByCurrentUser() {
    return encryptedPost("/sys/role/listUserRoleByCurrentUser");
  },
}

export default roleApi;