import config from 'wx/config'

const {apiHost} = config

let API = {}

// 素材增删改查
API.list = {
    url: `${apiHost}/media`,
    type: 'GET'
}

API.create = {
    url: `${apiHost}/media/batch_add`,
    type: 'POST'
}

API.update = {
    url: `${apiHost}/media/{id}`,
    type: 'PUT'
}

API.remove = {
    url: `${apiHost}/media/{id}`,
    type: 'DELETE'
}

// 创建文本素材
API.createText = {
    url: `${apiHost}/media`,
    type: 'POST'
}

// 批量删除素材
API.batchRemove = {
    url: `${apiHost}/media/batch_delete`,
    type: 'DELETE'
}

// 标签列表
API.tags = {
    url:  `${apiHost}/media/tags`,
    type: 'GET'
}

// 批量添加素材标签
API.batchTag = {
    url: `${apiHost}/media/tags/batch_add`,
    type: 'POST'
}

// 修改素材标签（管理标签）
API.updateTags = {
    url: `${apiHost}/media/{id}/tags`,
    type: 'PUT'
}

// 语音转换
API.voiceConvert = {
    url: `${apiHost}/im/files/convert`,
    type: 'POST'
}

// 分组增删改查
API.groups = {
    url: `${apiHost}/media/categories/tree`,
    type: 'GET'
}

API.createGroup = {
    url: `${apiHost}/media/categories`,
    type: 'POST'
}

API.updateGroup = {
    url: `${apiHost}/media/categories/{id}`,
    type: 'PUT'
}

API.removeGroup = {
    url: `${apiHost}/media/categories/{id}`,
    type: 'DELETE'
}
// 批量分组
API.batchGroup = {
    url: `${apiHost}/media/batch_classify`,
    type: 'POST'
}


export default API
