import fetch from 'dva/fetch'
import {notification} from 'antd'
import {getStore, getDispatch} from 'tools/dva'
import _ from 'lodash'
import router from "umi/router"

const codeMessage = {
    200: '操作成功',
    201: '新建或修改数据成功',
    202: '一个请求已经进入后台排队（异步任务）',
    204: '删除数据成功。',
    400: '参数错误',
    401: '需要用户验证',
    403: '用户无权限',
    404: '资源不存在',
    405: '不支持的操作方法',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的',
    422: '当创建一个对象时，发生一个验证错误',
    500: '服务器内部错误',
    502: '应用程序错误',
    503: '维护中',
    504: '网关超时',
}

let loginErrorShow = false

function errorShow(options, errorText) {
    if(options.errorShow && !loginErrorShow){
        loginErrorShow = true
        notification.error({
            message: `请求错误:`,
            description: errorText,
            onClose: ()=>{
                loginErrorShow = false
            }
        })
    }
}

function responseCatch(e) {
    return new Promise((resolve, reject) => {
        if(!e.errorText){
            e.errorText = _.get(codeMessage, e.response.status, _.get(e, 'response.statusText', ''))
        }
        reject(e)
    })
}


function defaultGetErrorHandler(response, responseBodyJson){
    const errorText = _.get(responseBodyJson, 'meta.message', _.get(codeMessage, response.status, _.get(response, 'statusText', '')))
    return {
        errorText,
        response,
        responseJson: responseBodyJson,
    }
}

function defaultIsSuccessResponse(response) {
    return response.status >= 200 && response.status < 300
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL cwe want to request
 * @param fetchOptions
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, fetchOptions = {}, options = {}) {
    const defaultFetchOptions = {
        credentials: 'include',
    }
    const defaultOptions = {
        errorShow: true,
        returnResponse: false,
        isShowErrorText: true,
        isSuccessResponse: defaultIsSuccessResponse,
        getErrorDelegate: defaultGetErrorHandler
    }
    const newOptions = {...defaultFetchOptions, ...fetchOptions}

    options = {...defaultOptions, ...options}
    if(newOptions.method === 'POST' || newOptions.method === 'PUT' || newOptions.method === 'DELETE') {
        if(!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            }
            newOptions.body = JSON.stringify(newOptions.body)
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                ...newOptions.headers,
            }
        }
    }

    const accessToken = _.get(getStore().getState(), 'base.accessToken')

    let tempUrl = url
    if(accessToken) {
        newOptions.headers = {
            ...newOptions.headers,
            Authorization: `Bearer ${accessToken}`,
        }
    }

    return fetch(tempUrl, newOptions).then(function checkStatus(response) {
        if((response.status >= 200 && response.status < 300) || options.isSuccessResponse(response)) {
            return response
        }

        return response.json().then((res) => {
            return new Promise((resolve, reject) => {
                const error = options.getErrorDelegate(response, res)
                reject(error)
            })
        }).catch((e)=>{
            return responseCatch(e)
        })
    }).then((response) => {
        if(options.returnResponse) {
            return response
        }
        if(response.status === 204) {
            return response.text()
        }
        return response.json()
    }).catch((e) => {
        const status = _.get(e, 'response.status')

        if(status === 401) {
            getDispatch()({
                type: 'login/logout',
            })
            errorShow(options, e.errorText)
        }else if(status === 403){
            router.push('/403')
        }else if(options.isShowErrorText){
            errorShow(options, e.errorText)
        }

        return Promise.resolve({
            error: e,
        })
        // if (status === 403) {
        //   dispatch(routerRedux.push('/admin/exception/403'));
        //   return;
        // }
        // if (status <= 504 && status >= 500) {
        //   dispatch(routerRedux.push('/admin/exception/500'));
        //   return;
        // }
        // if (status >= 404 && status < 422) {
        //   dispatch(routerRedux.push('/admin/exception/404'));
        // }
    })
}
