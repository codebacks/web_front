import config from 'wx/config/index'

const {apiHost} = config

let API = {}

// tree相关
API.getTree = {
    url: `${apiHost}/knowledge_base/categories`,
    type: 'GET'
}
API.createTree = {
    url: `${apiHost}/knowledge_base/category`,
    type: 'POST',
}
API.editTree = {
    url: `${apiHost}/knowledge_base/category/{id}`,
    type: 'PUT',
}
API.removeTree = {
    url: `${apiHost}/knowledge_base/category/{id}`,
    type: 'DELETE',
}

// question相关
API.getQuestions = {
    url: `${apiHost}/knowledge_base/category/{id}/items`,
    type: 'GET',
}
API.getReplyContents = {
    url: `${apiHost}/knowledge_base/category/item/{id}`,
    type: 'GET',
}
API.removeQuestion = {
    url: `${apiHost}/knowledge_base/category/item/{id}`,
    type: 'DELETE',
}
API.moveQuestion = {
    url: `${apiHost}/knowledge_base/category/item/{id}/move`,
    type: 'PUT',
}
API.addQuestion = {
    url: `${apiHost}/knowledge_base/category/{id}/item`,
    type: 'POST',
}
API.editQuestion = {
    url: `${apiHost}/knowledge_base/category/item/{id}`,
    type: 'PUT',
}

export default API
