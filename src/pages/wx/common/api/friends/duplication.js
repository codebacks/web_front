import config from 'wx/config'

const {apiHost} = config

let API = {}

API.list = {
    url: `${apiHost}/wechats/friends/duplicate`,
    type: 'GET'
}

API.friendsDetail = {
    url: `${apiHost}/wechats/friends/duplicate/detail/{username}`,
    type: 'GET'
}

API.addWhitelist = {
    url: `${apiHost}/wechats/white_list`,
    type: 'POST'
}

API.tag = {
    url: `${apiHost}/wechats/friends/remark/{uin}/{username}`,
    type: 'PUT'
}

API.remove = {
    url: `${apiHost}/wechats/friends/{uin}/{username}/{reason}`,
    type: 'DELETE'
}

export default API