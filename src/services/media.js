import api from 'common/api/media'
import request from 'utils/request'

export async function media() {
    return request(api.media.url)
}

export async function batchAdd(params) {
    return request(api.batchAdd.url, {
        method: api.batchAdd.type,
        body: params,
    })
}
