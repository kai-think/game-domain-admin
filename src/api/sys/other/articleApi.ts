import axios from 'axios'
import encryptedPost from "@/common/encryptedPost"

var articleApi = {
  logicDelete(articleId, isDel, deleteReason) {
    return encryptedPost("/game/article/logicDelete", {articleId, delete: isDel, deleteReason});
  },
  logicDeleteReply(replyId, isDel, deleteReason) {
    return encryptedPost("/game/article/logicDeleteReply", {replyId, delete: isDel, deleteReason});
  },
  getContentByArticleId(articleId) {
    return axios.get("/game/article/getContentByArticleId", {params: {id: articleId}});
  },
  /**
   * 
   * @param bbsContent {articleId, content}
   */
  saveContent(articleContent) {
    return encryptedPost("/game/article/saveContent", {articleContent});
  },
}

export default articleApi