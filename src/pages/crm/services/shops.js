import {stringify} from 'qs'
import request from "crm/utils/request"
import API from "crm/common/api/shops"

export async function getShopListOauth(params) {
    return request(`${API.getShopListOauth.url}?${stringify(params)}`)
}
