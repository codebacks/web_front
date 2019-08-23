import defaultRequest from '../../../utils/request'
import {stringify} from 'qs'

const METHOD_GET = 'get'

export default function request(url, fetchOptions = {}) {
    const defaultFetchOptions = {
        method: METHOD_GET,
        isErrorPropagation: false,
        body: null
    }

    const newOptions = {...defaultFetchOptions, ...fetchOptions}

    const { isErrorPropagation } = newOptions

    if(newOptions.method && newOptions.method.toLowerCase() === METHOD_GET){
        var params = newOptions.body
        newOptions.body = null
        return warpRequest(`${url}?${stringify(params)}`, newOptions, isErrorPropagation)
    } else {
        return warpRequest(url, newOptions,isErrorPropagation)
    }
}

function warpRequest(url, options, isErrorPropagation){
    var promise = defaultRequest(url, options)


    return new Promise((resolve, reject) => {
        promise.then(function(result) {
            if(result && !result.error){
                resolve(result)
            } else {
                if(isErrorPropagation){
                    reject(result)
                }
            }

        }, function(error){
            if(isErrorPropagation){
                reject(error)
            }
        })
    })
}


export function callApi(apiConfig, params){
    return request(apiConfig.url, {
        method: apiConfig.type,
        ...params
    })
}