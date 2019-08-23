import qs from 'qs'
import request from 'community/utils/request'
import Helper from 'community/utils/helper'
import API from 'community/common/api/groupMessage'

// edit by XuMengPeng
export async function groupMessages(payload) {
    const payloadTemp = {...payload}
    delete payloadTemp.uin
    delete payloadTemp.username
    return request(`${Helper.format(API.groupMessages.url, {
        uin: payload.uin,
        chatroom_name: payload.username,
    })}?${qs.stringify(payloadTemp)}`)
}