import config from 'community/config'

export default {
    drainageQuery: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities`,
        type: 'GET',
    },

    addActivity: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities`,
        type: 'POST',
    },

    setActivity: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{id}/setting`,
        type: 'POST',
    },

    qrSetting: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{id}/qr_setting`,
        type: 'POST',
    },

    getPageConfig: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{id}/page_setting`,
        type: 'GET',
    },

    setPageConfig: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/page_setting`,
        type: 'POST',
    },

    uploadBg:{
        url:`${config.apiHost}/upload`,
        type: 'GET',
    },

    queryGroupList: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatrooms`,
        type: 'GET',
    },

    queryMembersList: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatroom/{row_id}`,
        type: 'GET',
    },

    querySearchGroupList: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/search`,
        type: 'GET',
    },

    addSearchGroupList: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatrooms`,
        type: 'POST',
    },

    queryActivityStat: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/statistics`,
        type: 'GET',
    },

    queryActivityGroupStat: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chat_room/{group_activity_chatroom_id}/statistics`,
        type: 'GET',
    },

    queryActivityTop: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/summary`,
        type: 'GET',
    },

    switchActivityStatus: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activity/{group_activity_id}/status`,
        type: 'POST',
    },

    queryActivityGroupTop: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activity/{group_activity_id}/summary`,
        type: 'GET',
    },

    switchActivityGroupStatus: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatrooms/{group_activity_chatroom_id}/status`,
        type: 'POST',
    },

    uploadGroupQrcode: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatroom/{row_id}/upload_qrcode`,
        type: 'POST',
    },

    autoUploadGroupQrcode: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatroom/{row_id}/auto_upload_qrcode`,
        type: 'POST',
    },

    deleteGroup: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatrooms/{row_id}`,
        type: 'DELETE',
    },


    getGroupMemberExtra: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatroom/{row_id}/extra`,
        type: 'GET',
    },

    getAutoUploadQrcodeStatus: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/chatroom/{row_id}/auto_upload_qrcode_status`,
        type: 'GET',
    },

    setExcludeScanRepeat: {
        url: `${config.apiHost}/wechats/chat_rooms/group_activities/{group_activity_id}/forbidden_repeat_in_group`,
        type: 'POST',
    },

}