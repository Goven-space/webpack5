import {
    message,
    notification
} from "antd";
import axios from 'axios';
import * as AjaxUtils from './AjaxUtils';
// import loading from "./loading";

export const baseURL = sessionStorage.getItem('serverHost') || `${window.location.origin}/restcloud`;

export const service = axios.create({
    baseURL,
    timeout: 180 * 1000,
    responseType: "json",
})

service.interceptors.request.use(
    function (config) {
        if (!window.location.pathname.includes('/login')) {
            const identitytoken = AjaxUtils.getCookie("identitytoken");
            if (identitytoken) {
                config.headers.identitytoken = identitytoken
            }
        }
        const serverHost = sessionStorage.getItem('serverHost');
        if (config.baseURL !== serverHost && serverHost) {
            config.baseURL = serverHost
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    function (res) {
        if (res.status === 200) {
            if ( !res.config && res.config.responseType !== 'blob'&&!res.data.state) {
                AjaxUtils.showError(res.data.msg)
            }
            return Promise.resolve(res);
        } else {
            return Promise.reject(res);
        }
    },
    function (err) {
        if (!err) return false;
        if (err && !err.response) { //自己将超时的判断条件补全
            err.response = {}
            err.response.status = 2021
            err.response.data = {}
            err.response.data.msg = '请求接口超时!'
            err.response.data.state = false
            notification.error({
                message: '操作提示',
                description: '服务请求超时！',
            })
            return Promise.reject(err.response && err.response.data);
        } else if (err.response.status === 500) {
            notification.error({
                message: '操作提示',
                description: (err.response.data && err.response.data.msg) || ('服务请求处理异常!'),
            })
            return Promise.reject(err.response && err.response.data);
        } else if (err.response.status === 404) {
            notification.error({
                message: '操作提示',
                description: (err.response.data && err.response.data.msg) || ('服务请求失败,请检查服务器填写及服务接口是否正确!')
            })
            return Promise.reject(err.response && err.response.data);
        } else {
            message.error((err.response && err.response.data && err.response.data.msg) || '接口异常')
            return Promise.reject(err.response && err.response.data);
        }
    }
);

export const get = (url, params, config) => {
    return new Promise((resolve, reject) => {
        service.get(url, {
            params,
            ...config
        }).then(res => {
            if (res.config && res.config.responseType === 'blob') {
                exportData(res)
            }
            // loading(false);
            resolve(res)
        }).catch(err => {
            // loading(false);
            reject(err)
        })
    })
}

export const post = (url, params, config) => {
    return new Promise((resolve, reject) => {
        const newParams = params instanceof FormData ? params : {...params}
        service.post(url, newParams, config).then(res => {
            //导出
            if (res.config && res.config.responseType === 'blob') {
                exportData(res)
            }
            resolve(res)
        }).catch(err => {
            // loading(false);
            reject(err)
        })
    })
}

//对于返回类型为blob类型就认为是导出为文件流
export const exportData = (res) => {
    let data = res.data || res;
    if (res && !res.headers['content-disposition']) {
        AjaxUtils.showError(data.msg)
        return 
    }
    let fileReader = new FileReader();
    fileReader.readAsText(data);
    fileReader.onload = function () {
        blobDownload(res)
    };
}

export const blobDownload = (res,name) => {
    let blobObject = new Blob([res.data]);
    var link = document.createElement("a");
    let url = window.URL.createObjectURL(blobObject);
    link.href = url;
    var filename = res.headers; //下载后文件名
    filename = filename["content-disposition"];
    filename = decodeURI(filename&&filename.split(";")[1]&&filename.split(";")[1].split("filename=")[1]) || name; 
    link.download = filename.replace(new RegExp('"', "gm"), "");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 0);
}