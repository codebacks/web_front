import defaultRequest from '../../../utils/request'
import {stringify} from 'qs'

const METHOD_GET = 'get'

export default function request(url, fetchOptions = {}) {
    const defaultFetchOptions = {
        method: METHOD_GET,
        isErrorPropagation: false,
        body: null
    }

    const { is404EqualEmpty, isErrorPropagation, ...otherOptions } = fetchOptions

    console.log(is404EqualEmpty, isErrorPropagation, otherOptions)

    const config = {}

    if(is404EqualEmpty === true) {
        config.isSuccessResponse = function(response) {
            return response.status === 404
        }
    }

    const newOptions = {...defaultFetchOptions, ...otherOptions}

    // const { isErrorPropagation } = newOptions

    if(newOptions.method && newOptions.method.toLowerCase() === METHOD_GET){
        var params = newOptions.body
        newOptions.body = null
        if(params){
            return warpRequest(`${url}?${stringify(params)}`, newOptions, isErrorPropagation, config)
        }else{
            return warpRequest(`${url}`, newOptions, isErrorPropagation, config)
        }
       
    } else {
        return warpRequest(url, newOptions,isErrorPropagation, config)
    }
}

function warpRequest(url, fetchOptions, isErrorPropagation, options){
    var promise = defaultRequest(url, fetchOptions, options)


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