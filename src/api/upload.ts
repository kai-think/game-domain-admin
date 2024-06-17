import axios from 'axios';

var uploadApi = {
  mediumImage(file, onUploadProgress) {
    return axios.post("/upload/imageWithMediumThumbnail", file, {
      timeout: 30 * 1000, //30秒超时
      onUploadProgress,
    });
  },
  bigImage(file, onUploadProgress) {
    return axios.post("/upload/imageWithLargeThumbnail", file, {
      timeout: 30 * 1000, //30秒超时
      onUploadProgress,
    });
  },
  image(file, onUploadProgress?: (progressEvent) => {}) {
    return axios.post("/upload/imageWithLargeThumbnail", file, {
      timeout: 30 * 1000, //30秒超时
      onUploadProgress,
    });
  },
  video(file, onUploadProgress?: (progressEvent) => {}) {
    return axios.post("/upload/video", file, {
      timeout: 24 * 60 * 60 * 1000, //一天超时
      onUploadProgress,
    });
  },
  file(file, onUploadProgress?: (progressEvent) => {}) {
    return axios.post("/upload/file", file, {
      timeout: 24 * 60 * 60 * 1000, //一天超时
      onUploadProgress,
    });
  },
}

export default uploadApi;