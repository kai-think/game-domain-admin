import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var url = u => "/sys/public" + u;

var publicApi = {
  login({username, password}) {
    return encryptedPost(url("/login"), {username, password});
  },
  loginWithToken() {
    return axios.post(url("/loginWithToken"));
  }
}

export default publicApi