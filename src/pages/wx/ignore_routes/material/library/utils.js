import config from 'wx/common/config'

const {materialType} = config

const utils =  {
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
    isVideo: (type) => {
        return type === materialType.video.type
    },
    getTypeText: (type) => {
        switch (type) {
            case materialType.image.type:
                return '图片'
            case materialType.video.type:
                return '视频'
            case materialType.file.type:
                return '文件'
            default:
        }
    },
}

export default utils