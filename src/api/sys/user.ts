import axios from "axios"
import encryptedPost from "@/common/encryptedPost"

interface UserRole {
  id: Number,
  userId: Number,
  roleId: Number,
  limitation: String
}

var userApi = {
  page(params) {
    return encryptedPost("/sys/user/page", {params});
  },
  save(user) {
    return encryptedPost("/sys/user/save", user);
  },
  getById(id) {
    return encryptedPost("/sys/user/getById", {id});
  },
  delete(ids) {
    return encryptedPost("/sys/user/delete", {ids});
  },
  assignRole(userId, roleIdAndLimitationList: UserRole[]) {
    return encryptedPost("/sys/user/assignRole", {userId, roleIdAndLimitationList});
  },
}

export default userApi;