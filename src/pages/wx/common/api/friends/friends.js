import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/customers/search`,
    type: 'POST'
}

API.detail = {
    url: `${apiHost}/wechats/{uin}/friends/{username}`,
    type: 'GET'
}

API.customerDetail = {
    url: `${config.apiHost}/customers/{id}/detail`,
    type: 'GET'
}

API.exportTask = {
    url: `${apiHost}/customers/export`,
    type: 'POST'
}

API.exportStatus = {
    url: `${apiHost}/customers/export/task/{task_id}`,
    type: 'GET'
}

API.exportExcel = {
    url: `${apiHost}/customers/export/download/{task_id}`,
    type: 'GET'
}


API.getDivideOptions = {
    url: `${apiHost}/wechats/friends/grouping`,
    type: 'GET'
}

API.setDivide = {
    url: `${apiHost}/wechats/friends/grouping/{group_id}`,
    type: 'POST'
}

// 检查是否有群发次数
API.checkMass = {
    url: `${apiHost}/mass_sending/customers/check`,
    type: 'GET'
}

export default API
