import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var url = u => "/front/bbs" + u;

var bbsApi = {
  listForumSection(forumId) {
    return axios.get(url("/listForumSection"), {params: {forumId}});
  },
  getContentByBbsId(bbsId) {
    return axios.get(url("/getContentByBbsId"), {params: {id: bbsId}});
  },
  /**
   * 
   * @param bbsContent {bbsId, content}
   */
  saveContent(bbsContent) {
    return encryptedPost(url("/saveContent"), {bbsContent});
  },
  logicDelete(bbsId, deleteReason) {
    return encryptedPost("/tb/bbs/logicDelete", {bbsId, deleteReason});
  },
  logicRestore(bbsId) {
    return encryptedPost("/tb/bbs/logicRestore", {bbsId});
  },
  logicDeleteReply(replyId, isDel, deleteReason) {
    return encryptedPost("/tb/bbs/logicDeleteReply", {replyId, delete: isDel, deleteReason});
  },
}

export default bbsApi