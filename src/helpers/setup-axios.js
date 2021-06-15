import axios from 'axios';
import { ERROR_CODES } from '../store/ErrorStore';

// set default options of http requests
axios.defaults.headers.common['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
axios.defaults.withCredentials = true;

// set interceptors to catch errors (e.g. session timeout, cusis down)
axios.interceptors.response.use(response => {
  if (response.request?.responseURL === 'http://www.cuhk.edu.hk/cusis/cusis_down.html') {
    return Promise.reject(ERROR_CODES.CUSIS.DOWN);
  }
  return response;
}, error => Promise.reject(error));
