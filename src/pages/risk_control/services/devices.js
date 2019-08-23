import api from 'risk_control/common/api/devices'
import request from 'utils/request'
import {format} from 'utils'
import {stringify} from 'qs'

export async function groups(params) {
    return request(`${api.groups.url}?${stringify(params)}`)
}

export async function groupsAll(params) {
    return request(`${api.groupsAll.url}?${stringify(params)}`)
}

export async function createGroups(params = {}) {
    return request(format(api.createGroups.url), {
        method: api.createGroups.type,
        body: params.body,
    })
}

export async function changeGroups(params = {}) {
    return request(format(api.changeGroups.url, {id: params.id}), {
        method: api.changeGroups.type,
        body: params.body,
    })
}

export async function deleteGroups(params = {}) {
    return request(format(api.deleteGroups.url, {id: params.id}), {
        method: api.deleteGroups.type,
        body: params.body,
    })
}

export async function callRecords(params) {
    return request(`${api.callRecords.url}?${stringify(params)}`)
}

export async function textMessages(params) {
    return request(`${api.textMessages.url}?${stringify(params)}`)
}

export async function sensitiveTextMessages(params) {
    return request(`${api.sensitiveTextMessages.url}?${stringify(params)}`)
}

export async function sensitiveTextMessagesInfo(params) {
    return request(`${format(api.sensitiveTextMessagesInfo.url, {id: params.id})}?${stringify(params)}`)
}

export async function sensitiveTextMessagesBatchOperate(params = {}) {
    return request(api.sensitiveTextMessagesBatchOperate.url, {
        method: api.sensitiveTextMessagesBatchOperate.type,
        body: params.body,
    })
}

export async function msgSensitiveWords(params) {
    return request(`${api.msgSensitiveWords.url}?${stringify(params)}`)
}

export async function createMsgSensitiveWords(params = {}) {
    return request(format(api.createMsgSensitiveWords.url), {
        method: api.createMsgSensitiveWords.type,
        body: params.body,
    })
}

export async function createMsgSensitiveWordsBatch(params = {}) {
    return request(format(api.createMsgSensitiveWordsBatch.url), {
        method: api.createMsgSensitiveWordsBatch.type,
        body: params.body,
    })
}

export async function changeMsgSensitiveWords(params = {}) {
    return request(format(api.changeMsgSensitiveWords.url, {id: params.id}), {
        method: api.changeMsgSensitiveWords.type,
        body: params.body,
    })
}

export async function deleteMsgSensitiveWords(params = {}) {
    return request(format(api.deleteMsgSensitiveWords.url, {id: params.id}), {
        method: api.deleteMsgSensitiveWords.type,
        body: params.body,
    })
}

export async function wxSensitiveWord(params) {
    return request(`${api.wxSensitiveWord.url}?${stringify(params)}`)
}

export async function createWxSensitiveWord(params = {}) {
    return request(format(api.createWxSensitiveWord.url), {
        method: api.createWxSensitiveWord.type,
        body: params.body,
    })
}

export async function changeWxSensitiveWord(params = {}) {
    return request(format(api.changeWxSensitiveWord.url, {id: params.id}), {
        method: api.changeWxSensitiveWord.type,
        body: params.body,
    })
}

export async function deleteWxSensitiveWord(params = {}) {
    return request(format(api.deleteWxSensitiveWord.url, {id: params.id}), {
        method: api.deleteWxSensitiveWord.type,
        body: params.body,
    })
}

export async function changeWxSensitiveOperationStatus(params = {}) {
    return request(format(api.changeWxSensitiveOperationStatus.url, {id: params.id}), {
        method: api.changeWxSensitiveOperationStatus.type,
        body: params.body,
    })
}

export async function wxSensitiveOperationStatus(params) {
    return request(`${api.wxSensitiveOperationStatus.url}?${stringify(params)}`)
}

export async function wxSensitiveOperationRecords(params) {
    return request(`${api.wxSensitiveOperationRecords.url}?${stringify(params)}`)
}

export async function changeWxSensitiveOperationRecords(params = {}) {
    return request(format(api.changeWxSensitiveOperationRecords.url), {
        method: api.changeWxSensitiveOperationRecords.type,
        body: params.body,
    })
}

export async function wxSensitiveOperationAllRecords(params) {
    return request(`${api.wxSensitiveOperationAllRecords.url}?${stringify(params)}`)
}

export async function wxDivideOptions(params) {
    return request(`${api.wxDivideOptions.url}?${stringify(params)}`)
}

export async function devices(params) {
    return request(`${api.devices.url}?${stringify(params)}`)
}

export async function updateDevices(params = {}) {
    return request(format(api.updateDevices.url, {id: params.id}), {
        method: api.updateDevices.type,
        body: params.body,
    })
}

export async function removeDevices(params = {}) {
    return request(format(api.removeDevices.url, {id: params.id}), {
        method: api.removeDevices.type,
        body: params.body,
    })
}

export async function devicesAttributes(params) {
    return request(`${api.devicesAttributes.url}?${stringify(params)}`)
}

export async function switchUser(params = {}) {
    return request(format(api.switchUser.url), {
        method: api.switchUser.type,
        body: params.body,
    })
}

export async function batchGroup(params = {}) {
    return request(format(api.batchGroup.url), {
        method: api.batchGroup.type,
        body: params.body,
    })
}

export async function devicesLogin(params) {
    return request(`${api.devicesLogin.url}?${stringify(params)}`)
}

export async function devicesQrcode(params) {
    return request(`${api.devicesQrcode.url}?${stringify(params)}`)
}

export async function devicesResult(params) {
    return request(`${api.devicesResult.url}?${stringify(params)}`, null, {
        returnResponse: true,
    })
}

export async function notifications(params = {}) {
    return request(format(api.notifications.url), {
        method: api.notifications.type,
        body: params.body,
    })
}

export async function notificationsBatch(params = {}) {
    return request(format(api.notificationsBatch.url), {
        method: api.notificationsBatch.type,
        body: params.body,
    })
}

export async function getPermissionConfig() {
    return request(`${api.getPermissionConfig.url}`)
}

export async function setPermissionConfig(payload = {}) {
    return request(format(api.setPermissionConfig.url), {
        method: api.setPermissionConfig.type,
        body: payload.body,
    })
}

export async function getSinglePermission(payload) {
    return request(format(api.getSinglePermission.url, {device_id: payload.device_id}))
}

export async function setSinglePermission(payload = {}) {
    return request(format(api.setSinglePermission.url, {device_id: payload.device_id}), {
        method: api.setSinglePermission.type,
        body: payload.body,
    })
}


