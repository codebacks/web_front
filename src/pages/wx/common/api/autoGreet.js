import config from 'wx/config'

export default {
    getConfig: {
        url: `${config.apiHost}/setting_new_friend_auto_greet`,
        type: 'GET',
    },
    setConfig: {
        url: `${config.apiHost}/setting_new_friend_auto_greet`,
        type: 'POST',
    },
    createContent: {
        url: `${config.apiHost}/setting_new_friend_auto_greet/greet_content`,
        type: 'POST',
    },
    deleteContent: {
        url: `${config.apiHost}/setting_new_friend_auto_greet/greet_content/{id}`,
        type: 'DELETE',
    },
    updateContent: {
        url: `${config.apiHost}/setting_new_friend_auto_greet/greet_content/{id}`,
        type: 'POST',
    },
    move: {
        url: `${config.apiHost}/setting_new_friend_auto_greet/greet_content/{id}/move`,
        type: 'POST',
    },
    getOneConfig: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}`,
        type: 'GET',
    },
    setOneConfig: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}`,
        type: 'POST',
    },
    createOneContent: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}/greet_content`,
        type: 'POST',
    },
    deleteOneContent: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}/greet_content/{id}`,
        type: 'DELETE',
    },
    updateOneContent: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}/greet_content/{id}`,
        type: 'POST',
    },
    oneMove: {
        url: `${config.apiHost}/uin_setting_new_friend_auto_greet/{uin}/greet_content/{id}/move`,
        type: 'POST',
    },
}