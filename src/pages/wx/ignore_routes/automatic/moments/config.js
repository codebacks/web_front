
export const contentType = {
    photo: '图文',
    text: '文本',
    article: '文章',
    video: '视频'
}

export const commentStatus = new Map([
    [0, '未执行'],
    [1, '成功'],
    [-1, '失败'],
    [2, '执行中'],
    [3, '执行成功']
])

export const imageType = ['image/jpeg', 'image/jpg', 'image/png'] // 图片格式
export const imageMaxSize = 20 // 图片上传限制 M
export const videoMaxSize = 25 // 视频上传限制 M
export const editorLimit = 1500 // 内容字数限制
export const commentEditorLimit = 200 // 延时评论字数限制

