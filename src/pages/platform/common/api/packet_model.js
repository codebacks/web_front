import config from 'platform/config'

export default {
    // 创建模板
    createModel: {
        url: `${config.apiHost}/api/packets/templates`,
        type: 'POST',
    },
    // 模板列表
    modelList: {
        url: `${config.apiHost}/api/packets/templates`,
        type: 'GET',
    },
    // 删除模板
    deleteModel: {
        url: `${config.apiHost}/api/packets/templates/{id}`,
        type: 'DELETE',
    },
    editModel:{
        url: `${config.apiHost}/api/packets/templates/{id}`,
        type: 'PUT'
    }
}