import axios from 'axios';

const httpClient = axios.create({
    baseURL: "http://localhost"
})

httpClient.interceptors.request.use(function (config){
    const token = localStorage.getItem('token');
    config.headers["Authorization"] = token ? `Bearer ${token}` : '';
    return config;
})

export default httpClient;