import config from 'wx/config'

const {apiHost} = config

let API = {}

API.whitelistList = {
	url: `${apiHost}/wechats/white_list`,
	type: 'GET'
}

API.whitelistEditRemark = {
	url: `${apiHost}/wechats/white_list/{id}/remark`,
	type: 'POST'
}

API.whitelistRemove = {
	url: `${apiHost}/wechats/white_list/{id}`,
	type: 'DELETE'
}

API.whitelistSearchWx = {
	url: `${apiHost}/wechats/search`,
	type: 'GET'
}

API.whitelistAdd = {
	url: `${apiHost}/wechats/white_list`,
	type: 'POST'
}

API.blacklistList = {
    url: `${apiHost}/wechats/black_list`,
    type: 'GET'
}

API.blacklistRemove = {
    url: `${apiHost}/wechats/black_list/{id}`,
    type: 'DELETE'
}

API.addBlackList = {
    url: `${apiHost}/wechats/black_list/add`,
    type: 'PUT'
}

export default API
