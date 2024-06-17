import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var url = u => "/game/circle-activation-detail" + u;

var activationApi = {
  listRecentGlobalActivation(recentDays) {
    return encryptedPost(url("/listRecentGlobalActivation"), {recentDays});
  },
  listTodayActivationDescByActivation({current, size}) {
    return encryptedPost(url("/listTodayActivationDescByActivation"), {current, size});
  },
}

export default activationApi