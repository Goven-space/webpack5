const baseURL = "http://47.92.110.139:8081/restcloud";
const service = axios.create({
    baseURL,
    timeout: 20 * 1000,
    responseType: "json",
})
service.interceptors.request.use(
    function (config) {
        if(!location.pathname.includes('login.html')){
            const identitytoken = localStorage.getItem('identitytoken')
            if(identitytoken){
                config.headers.identitytoken = identitytoken;
            }else{
                location.href = 'user/login.html';
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

const get = (url, params) => {
    return new Promise((resolve, reject) => {
        service.get(url, {params}).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

const post = (url, params) => {
    return new Promise((resolve, reject) => {
        service.post(url, {...params}).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}
