import config from 'config'

export default {
    getTree: {
        url: `${config.apiHost}/api/modules/tree`,
        type: 'GET',
    },
    getTreeCurrent: {
        url: `${config.apiHost}/api/modules/tree/current`,
        type: 'GET',
    },
    getUser: {
        url: `${config.apiHost}/api/users/me`,
        type: 'GET',
    },
    getInitData: {
        url: `${config.apiHost}/api/auth/init`,
        type: 'GET',
    },
    querySmsCount: {
        url: `${config.apiHost}/api/const/sms_count`,
        type: 'GET',
    },
    OSSAuth: {
        url: `${config.apiHost}/api/oss/token`,
        type: 'GET',
    },
    COSAuth: {
        url: `${config.apiHost}/api/storages/auth`,
        type: 'GET',
    },
    authToken: {
        url: `${config.apiHost}/api/auth/token`,
        type: 'GET',
    },
    qiniuAuth: {
        url: `${config.apiHost}/api/storages/qiniu_auth`,
        type: 'GET',
    },
    qiniuAuthTest: {
        url: `${config.apiHost}/api/storages/qiniu_auth_test`,
        type: 'GET',
    },
    getNoticeList:{
        url: `${config.apiRetailHost}/api/notify/notifications`,
        type: 'GET',
    },
    getUnreadNum:{
        url: `${config.apiRetailHost}/api/notify/notifications`,
        type: 'GET',
    },
    setReadStatus:{
        url:`${config.apiRetailHost}/api/notify/notifications/{id}`,
        type:'PUT'
    }
}
