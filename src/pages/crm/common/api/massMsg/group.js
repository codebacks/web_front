import config from 'crm/config'
import base from "crm/common/api/base"

const {apiHost} = config

let API = base('mass_sending/friends/groups')

// 好友筛选
API.filterFriends = {
    url: `${apiHost}/mass_sending/friends/search`,
    type: 'POST',
}

// 好友分组详情
API.groupDetail = {
    url: `${apiHost}/mass_sending/friends/groups/{id}`,
    type: 'GET',
}

export default API
