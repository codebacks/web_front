import config from 'mall/config'

export default {
    getApprovalList: {
        url: `${config.yqxHost}/management/feed/comment`,
        // url: `${config.yqxHost}/management/feed`,
        type: 'GET',
    },
    changeCommentStatus: {
        url: `${config.yqxHost}/management/comment`,
        type: 'PUT',
    },
}