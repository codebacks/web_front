import config from 'wx/config'

export default {
    getConfig: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet`,
        type: 'GET',
    },
    setConfig: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet`,
        type: 'POST',
    },
    createContent: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet/greet_content`,
        type: 'POST',
    },
    deleteContent: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet/greet_content/{id}`,
        type: 'DELETE',
    },
    updateContent: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet/greet_content/{id}`,
        type: 'POST',
    },
    move: {
        url: `${config.apiHost}/setting_group_new_friend_auto_greet/greet_content/{id}/move`,
        type: 'POST',
    },
    getOneConfig: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}`,
        type: 'GET',
    },
    setOneConfig: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}`,
        type: 'POST',
    },
    createOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}/greet_content`,
        type: 'POST',
    },
    deleteOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}/greet_content/{id}`,
        type: 'DELETE',
    },
    updateOneContent: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}/greet_content/{id}`,
        type: 'POST',
    },
    oneMove: {
        url: `${config.apiHost}/target_group_new_friend_auto_greet/{uin}/username/{group_username}/greet_content/{id}/move`,
        type: 'POST',
    },
}