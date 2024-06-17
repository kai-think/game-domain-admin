import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var url = u => "/sys/menu" + u;

var menuApi = {
  listByCurrentUser() {
    return encryptedPost(url("/listByCurrentUser"));
  },
  getByRoleId(roleId) {
    return encryptedPost(url("/getByRoleId"), {roleId});
  },
  addDefaultPermission(menuId) {
    return encryptedPost(url("/addDefaultPermission"), {menuId});
  },
}

export default menuApi;