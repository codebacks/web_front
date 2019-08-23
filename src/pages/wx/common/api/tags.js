import base from 'wx/common/api/base'
import config from "wx/config"

const {apiHost} = config

let API = base('tags')

API.list = {
    url: `${apiHost}/tags`,
    type: 'GET',
}

API.stat = {
    url: `${apiHost}/tags/stat`,
    type: 'GET',
}

API.statExport = {
    url: `${apiHost}/tags/stat/export`,
    type: 'GET',
}

API.search = {
    url: `${apiHost}/customers/search`,
    type: 'POST'
}

export default API
