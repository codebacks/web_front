import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats`,
    type: 'GET'
}

API.wxDivideOptions = {
    url: `${apiHost}/wechats/grouping`,
    type: 'GET'
}

API.batchSet = {
    url: `${apiHost}/wechats/setting/img_upload`,
    type: 'POST'
}

export default API
