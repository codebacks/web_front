const emojiRe = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/

let helper = {
    /**
     * 格式化模版, 例如:
     * format('hello, {name}', {name:'tom'}) 返回: hello, tom
     * @param str 字符串模版
     * @param obj 模版变量对应的对象
     */
    format: (str, obj) => {
        if (!obj) {
            return str
        }
        return str.replace(/\{([^}]+)\}/g, (match, key) => obj[key])
    },
    formatUrl(url) {
        if(!url) {
            return ''
        }
        if(url.startsWith('http://')) {
            return url.replace('http://', 'https://')
        }else if(url.startsWith('//')) {
            return url.replace('//', 'https://')
        }else if(url.startsWith('https://')) {
            return url
        }else {
            return `https://${url}`
        }
    },
    formatBirthday(y, m, d) {
        let res = ''
        y && (res += y + '年')
        m && (res += m + '月')
        d && (res += d + '日')
        return res
    },
    getIn(obj, ...keys) {
        let data = obj
        if (typeof data === 'object') {
            let arr = []
            keys.forEach(key => {
                arr = arr.concat(key.split('.'))
            })
            let len = arr.length
            for (let i = 0; i < len; i++) {
                data = data[arr[i]]
                if (i < len - 1 && typeof data !== 'object') {
                    data = undefined
                    break
                }
            }
        } else {
            return ''
        }
        return data

    },
    removeTag(t) {
        if (t) {
            t = t.replace(/<\/div><div>/g, "<br>")
            t = t.replace(/<\/div>/g, "")
            t = t.replace(/<(?:br|BR)\/?>/g, "\n")
            t = t.replace(/<\/div>/g, "")
            t = t.replace(/<div>/g, "")
            t = t.replace(/&nbsp;/g, " ")
            if (t.endsWith('\n')) {
                t = t.substring(0, t.length - 2)
            }
        }
        return t
    },
    getTimestamp() {
        return Math.floor(Date.now())
    },
    timestampFormat(timestamp, showYear) {
        if (timestamp) {
            timestamp = ('' + timestamp).length === 10 ? timestamp * 1000 : timestamp
            let date = new Date(timestamp)
            let year = date.getFullYear()
            let month = "0" + (date.getMonth() + 1)
            let day = "0" + date.getDate()
            let hours = "0" + date.getHours()
            let minutes = "0" + date.getMinutes()
            let seconds = "0" + date.getSeconds()
            if (showYear) {
                return year + '年' + month.substr(-2) + '月' + day.substr(-2) + '日' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
            } else {
                return month.substr(-2) + '月' + day.substr(-2) + '日' + hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)
            }
        } else {
            return ''
        }
    },
    getSuffix(filename) {
        let pos = filename.lastIndexOf('.')
        let suffix = ''
        if (pos !== -1) {
            suffix = filename.substring(pos)
        }
        return suffix
    },
    getAccessTokenUrl(url, accessToken) {
        let sp = url.indexOf('?') !== -1 ? '&' : '?'
        return url + sp + 'access_token=' + accessToken
    },
    isEmojiCharacter(text) {
        return emojiRe.test(text)
    },
    filterEmojiCharacter(text) {
        const reg = new RegExp(emojiRe, 'g')
        return text.replace(reg, '')
    },
    getQiNiuDownloadUrl(url, name) {
        if (url) {
            if (!name) {
                name = url.split('?')[0]
                name = name.substr(name.lastIndexOf('/') + 1, name.length)
            }
            if (url.indexOf('?') !== -1) {
                return `${url}&attname=${name}`
            } else {
                return `${url}?attname=${name}`
            }
        } else {
            return url
        }
    },
    formatLength(limit) {
        let size = ''
        if (limit < 1024) { // 如果小于0.1KB转化成B
            size = limit.toFixed(0) + 'B'
        } else if (limit < 1024 * 1024) { // 如果小于0.1MB转化成KB
            size = (limit / 1024).toFixed(0) + 'KB'
        } else if (limit < 1024 * 1024 * 1024) { // 如果小于0.1GB转化成MB
            size = (limit / (1024 * 1024)).toFixed(1) + 'MB'
        } else { // 其他转化成GB
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
        }
        let sizeStr = size + ''
        let len = sizeStr.indexOf('\.')
        let dec = sizeStr.substr(len + 1, 2)
        if (dec === '00') { // 当小数点后为00时 去掉小数部分
            return sizeStr.substring(0, len) + sizeStr.substr(len + 3, 2)
        }
        return sizeStr
    },
    /**
     * 移除协议
     * @param url
     * @returns {*}
     */
    removeHttp(url) {
        if (url) {
            if (url.startsWith('http:')) {
                return url.substr(5)
            }
            if (url.startsWith('https:')) {
                return url.substr(6)
            }
        }
        return url
    },
    /**
     * 获取微信官方地址的缩略图 主要是头像
     * @param url
     * @returns {*}
     */
    getWxThumb(url) {
        if (url) {
            url = helper.removeHttp(url)
            if (url.endsWith('/0')) {
                return `${url.substring(0, url.length - 2)}/96`
            } else {
                return url
            }
        } else {
            return url
        }
    },
    /**
     * 是否群
     * @param username
     * @returns {int}
     */
    isChatRoom: (username) => {
        if (username) {
            return username.endsWith('@chatroom') ? 1 : 0
        } else {
            return 0
        }
    },
    textToLink(text) {
        // const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi
        const pattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
        return text.replace(pattern, (match, url) => {
            url = url.replace(/&amp;/g, '&')
            return `<a href="${url}" target="_blank">${url}</a>`
        })
    },
    getRealPhotoUrl(url) {
        if (url) {
            if (url.indexOf('personal-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
                return url.replace('personal-1256249764.cos.ap-shanghai.myqcloud.com', 'personal-1256249764.picsh.myqcloud.com')
            } else if (url.indexOf('crm-1256249764.cos.ap-shanghai.myqcloud.com') !== -1) {
                return url.replace('crm-1256249764.cos.ap-shanghai.myqcloud.com', 'crm-1256249764.picsh.myqcloud.com')
            }
        }
        return url
    },
    getUniqueMessageId(record) {
        if (record) {
            return `${record.uin}/${record.customer_wxid}/${record.create_time}`
        }
    }
}


export default helper
