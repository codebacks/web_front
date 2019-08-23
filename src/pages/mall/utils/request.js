/**
 **@Description:
 **@author: leo
 */

import defaultRequest from '../../../utils/request'
import _ from 'lodash'

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL cwe want to request
 * @param fetchOptions
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, fetchOptions = {}, options = {}) {

    const defaultOptions = {
        getErrorDelegate: mallGetErrorHandler
    }

    return defaultRequest(url, fetchOptions, {...defaultOptions,...options})
}

function mallGetErrorHandler(response, responseBodyJson){
    const errorText = _.get(responseBodyJson, 'message',  _.get(responseBodyJson, 'meta.message', '应用程序错误'))
    return {
        errorText,
        response,
        responseJson: responseBodyJson,
    }
}