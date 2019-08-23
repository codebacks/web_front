import config from 'crm/config'

let API = {}

API.getShopListOauth = {
    url: `${config.apiHost_wu}/api/shops/auth/shops`,
    type: 'GET',
}

export default API