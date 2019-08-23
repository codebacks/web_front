import config from 'community/config'

export default {
    getConfig: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet`,
        type: 'GET',
    },
    setConfig: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet`,
        type: 'POST',
    },
    getOneConfig: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons`,
        type: 'GET',
    },
    setOneConfig: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons`,
        type: 'POST',
    },
    createOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons/greet_content`,
        type: 'POST',
    },
    deleteOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons/greet_content/{row_id}`,
        type: 'DELETE',
    },
    updateOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons/greet_content/{row_id}/edit`,
        type: 'POST',
    },
    oneMove: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet_v2/commons/greet_content/{row_id}/move`,
        type: 'POST',
    },
}
