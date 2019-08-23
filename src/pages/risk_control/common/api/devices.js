import config from 'risk_control/config'

export default {
    groups: {
        url: `${config.apiHost}/api/devices/groups`,
        type: 'GET',
    },
    groupsAll: {
        url: `${config.apiHost}/api/devices/groups/all`,
        type: 'GET',
    },
    createGroups: {
        url: `${config.apiHost}/api/devices/groups`,
        type: 'POST',
    },
    changeGroups: {
        url: `${config.apiHost}/api/devices/groups/{id}`,
        type: 'PUT',
    },
    deleteGroups: {
        url: `${config.apiHost}/api/devices/groups/{id}`,
        type: 'DELETE',
    },
    callRecords: {
        url: `${config.apiHost}/api/devices/call_records`,
        type: 'GET',
    },
    callRecordsExport: {
        url: `${config.apiHost}/api/devices/call_records/export`,
        type: 'GET',
    },
    textMessages: {
        url: `${config.apiHost}/api/devices/text_messages`,
        type: 'GET',
    },
    textMessagesExport: {
        url: `${config.apiHost}/api/devices/text_messages/export`,
        type: 'GET',
    },
    sensitiveTextMessages: {
        url: `${config.apiHost}/api/devices/sensitive_text_messages`,
        type: 'GET',
    },
    sensitiveTextMessagesExcel: {
        url: `${config.apiHost}/api/devices/sensitive_text_messages/export`,
        type: 'GET',
    },
    sensitiveTextMessagesInfo: {
        url: `${config.apiHost}/api/devices/sensitive_text_messages/{id}`,
        type: 'GET',
    },
    sensitiveTextMessagesBatchOperate: {
        url: `${config.apiHost}/api/devices/sensitive_text_messages/batch_operate`,
        type: 'PUT',
    },
    msgSensitiveWords: {
        url: `${config.apiHost}/api/devices/msg_sensitive_words`,
        type: 'GET',
    },
    createMsgSensitiveWords: {
        url: `${config.apiHost}/api/devices/msg_sensitive_words`,
        type: 'POST',
    },
    createMsgSensitiveWordsBatch: {
        url: `${config.apiHost}/api/devices/msg_sensitive_words/batch`,
        type: 'POST',
    },
    changeMsgSensitiveWords: {
        url: `${config.apiHost}/api/devices/msg_sensitive_words/{id}`,
        type: 'PUT',
    },
    deleteMsgSensitiveWords: {
        url: `${config.apiHost}/api/devices/msg_sensitive_words/{id}`,
        type: 'DELETE',
    },
    wxSensitiveWord: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_word`,
        type: 'GET',
    },
    createWxSensitiveWord: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_word`,
        type: 'POST',
    },
    changeWxSensitiveWord: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_word/{id}`,
        type: 'PUT',
    },
    deleteWxSensitiveWord: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_word/{id}`,
        type: 'DELETE',
    },
    changeWxSensitiveOperationStatus: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_status/{id}`,
        type: 'PUT',
    },
    wxSensitiveOperationStatus: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_status`,
        type: 'GET',
    },
    wxSensitiveOperationRecords: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_records`,
        type: 'GET',
    },
    changeWxSensitiveOperationRecords: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_records`,
        type: 'PUT',
    },
    wxSensitiveOperationAllRecords: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_records/all_operations`,
        type: 'GET',
    },
    wxDivideOptions: {
        url: `${config.apiHost}/api/wechats/grouping`,
        type: 'GET',
    },
    wxSensitiveOperationRecordsExport: {
        url: `${config.apiHost}/api/wechat_monitor/sensitive_operation_records/export`,
        type: 'GET',
    },
    devices: {
        url: `${config.apiHost}/api/devices`,
        type: 'GET',
    },
    updateDevices: {
        url: `${config.apiHost}/api/devices/{id}`,
        type: 'PUT',
    },
    removeDevices: {
        url: `${config.apiHost}/api/devices/{id}`,
        type: 'DELETE',
    },
    devicesAttributes: {
        url: `${config.apiHost}/api/devices/attributes`,
        type: 'GET',
    },
    switchUser: {
        url: `${config.apiHost}/api/devices/switch_user`,
        type: 'PUT',
    },
    batchGroup: {
        url: `${config.apiHost}/api/devices/batch_group`,
        type: 'PUT',
    },
    devicesLogin: {
        url: `${config.apiHost}/api/devices/login`,
        type: 'GET',
    },
    devicesQrcode: {
        url: `${config.apiHost}/api/devices/qrcode`,
        type: 'GET',
    },
    devicesResult: {
        url: `${config.apiHost}/api/devices/result`,
        type: 'GET',
    },
    notifications: {
        url: `${config.apiHost}/api/im/notifications`,
        type: 'POST',
    },
    notificationsBatch: {
        url: `${config.apiHost}/api/im/notifications/batch`,
        type: 'POST',
    },
    getPermissionConfig: {
        url: `${config.apiHost}/api/permission/device/configurations`,
        type: 'GET',
    },
    setPermissionConfig: {
        url: `${config.apiHost}/api/permission/device/configurations/batch_setting`,
        type: 'POST',
    },
    getSinglePermission: {
        url: `${config.apiHost}/api/permission/device/configurations/{device_id}`,
        type: 'GET',
    },
    setSinglePermission: {
        url: `${config.apiHost}/api/permission/device/configurations/{device_id}`,
        type: 'POST',
    },

}
