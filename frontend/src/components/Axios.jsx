import axios from "axios";

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
  const csrftoken = getCookie('csrftoken');
  const baseUrl = "http://localhost:8000/api/"

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout:5000,
    withCredentials:true,
    headers:({"X-CSRFToken" : csrftoken})
})
  AxiosInstance.interceptors.request.use((config) =>{
    const csrftoken = getCookie("csrftoken");
    if(csrftoken){
        config.headers["X-CSRFToken"] = csrftoken
    }
    return config
  });

  export default AxiosInstance;