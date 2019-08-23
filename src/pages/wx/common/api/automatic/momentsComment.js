import config from 'wx/config'

const {apiHost} = config

let API = {}

API.addComment = {
    url: `${apiHost}/cloud_control/tasks/{id}/additional_comments`,
    type: 'POST'
}

API.tasks = {
    url: `${apiHost}/cloud_control/tasks/{id}/additional_comments`,
    type: 'GET',
}

API.details = {
    url: `${apiHost}/cloud_control/tasks/additional_comments/{id}/histories`,
    type: 'GET',
}

API.commentContent = {
    url: `${apiHost}/cloud_control/tasks/additional_comments/{id}/detail`,
    type: 'GET',
}

API.taskResult = {
    url: `${apiHost}/cloud_control/tasks/additional_comments/{id}/result`,
    type: 'GET',
}

export default API
