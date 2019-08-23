import Editor from 'components/Face/components/Editor'

const utils =  {
    getResponseFormat: (prefix, data) => {
        return data.map((item, index) => {
            let name = item.replace(/^.+?\/([^\/]+?)(.[^.]*?)?$/gi, '$1')
            let ext = item.replace(/.+\./, '.')
            let filename = `${name}${ext}`
            let uid = `${prefix}-${+(new Date())}-${index}`
            return {
                uid: uid,
                name: filename,
                status: 'done',
                response: {
                    url: item
                }
            }
        })
    },
    isOverEditorLimit: (value, maxLength) => {
        return Editor.computeMsgLength(value) > maxLength
    },
    getComments: (moment, hasDefault) => {
        const content_comments = moment.content_comments
        const content_comment = moment.content_comment
        let comments = []
        if (Array.isArray(content_comments) && content_comments.length) {
            comments = content_comments
        } else {
            if (hasDefault) {
                comments = [content_comment || '']
            } else {
                if(content_comment) {
                    comments = [content_comment]
                }
            }
        }
        return comments
    },
    isSelected: (ids, id) => {
        return ids.some((v)=>{return v === id})
    },
    getFilenameExtension: (url) => {
        let ext = url.replace(/.+\./, '.')
        let idx = ext.indexOf('?')
        if (idx !== -1) {
            ext = ext.slice(0, idx)
        }
        return ext
    },
    getFilename: (url, name) => {
        if (url) {
            if (!name) {
                name = url.replace(/^.+?\/([^\/]+?)(.[^.]*?)?$/gi, '$1')
            }
            const ext = utils.getFilenameExtension(url)
            return `${name}${ext}`
        }
        return ''
    },
    getDownloadUrl: (url, name) => {
        const filename = utils.getFilename(url, name)
        const ext = utils.getFilenameExtension(url)
        const str = url.replace(/.+\./, '.')
        let suffix = ''
        if (str.indexOf(`${ext}?`) === -1) {
            suffix = `?attname=${filename}`
        } else {
            suffix = `&attname=${filename}`
        }
        return `${url}${suffix}`
    },
    isYQX: (url) => {
        return url.indexOf('image.yiqixuan.com') > -1
    }
}

export default utils