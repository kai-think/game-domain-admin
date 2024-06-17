import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var url = u => "/sys/dic" + u;

var dicApi = {
  page() {
    return encryptedPost(url("/page"));
  },
  update(dicList: Object[]) {
    return encryptedPost(url("/updatePlus"), dicList);
  },
  save(role) {
    return encryptedPost("/sys/dic/save", role);
  },
  delete(ids: Number[]) {
    return encryptedPost("/sys/dic/delete", {ids});
  }
}

export default dicApi