/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */
import _ from 'lodash'
import faceMap from './faceMap'
import styles from './index.less'

const emojiValues = Object.values(faceMap.EmojiCodeMap)
const emojiKeys = Object.keys(faceMap.EmojiCodeMap)
const emojiAllValues = Object.values(faceMap.QQFaceMap)
const emojiAllKeys = Object.keys(faceMap.QQFaceMap)
export const HZFaceKey = 'data-hz-face'
export const HZQQFaceKey = 'HZQQFaceKey'
export const HZEmojiKey = 'HZEmojiKey'
const htmlFaceRe = new RegExp(`<img[^>]*${HZFaceKey}="(.*?)"[^>]*>`, 'g')

function requireQQFace(idx) {
    return require(`./images/face/${idx}.png`)
}

function requireEmojiFace(idx) {
    return require(`./images/emoji/${idx}.png`)
}

const msgUtils = {
    wxToHtml: (text, wapTag = 'div') => {
        if(!text) {
            return ''
        }

        text = _.escape(text)

        let html = msgUtils.qqFaceToImg(text)
        if(html === 'null') {
            html = text.replace('[', '<').replace(']', '>')
        }
        html = msgUtils.emojiToImg(html)
        html = msgUtils.msgToHtml(html)
        if(wapTag){
            html = `<${wapTag}>${html}</${wapTag}>`
        }

        return html
    },
    getImgAttr: ({idx, type}) => {
        if(type === 'emoji') {
            return {
                alt: 'emoji',
                src: requireEmojiFace(idx),
                [HZFaceKey]: `${HZEmojiKey}${idx}`,
            }
        }else if(type === 'qq') {
            return {
                alt: 'qq',
                src: requireQQFace(idx),
                [HZFaceKey]: `${HZQQFaceKey}${idx}`,
            }
        }
    },
    format: (str, obj) => {
        if(!obj) {
            return str
        }
        return str.replace(/\{([^}]+)\}/g, (match, key) => obj[key])
    },
    removeTag(t) {
        let r = t
        if(t) {
            r = r.replace(/<\/div><div>/g, '<br>')
            r = r.replace(/<\/div>/g, '')
            r = r.replace(/<(?:br|BR)\/?>/g, '\n')
            r = r.replace(/<\/div>/g, '')
            r = r.replace(/<div>/g, '')
            r = r.replace(/&nbsp;/g, ' ')
            if(r.endsWith('\n')) {
                r = r.substring(0, r.length - 2)
            }
        }
        return r
    },
    htmlToMsg(res) {
        res = res.trim()
        if(res) {
            res = res.replace(htmlFaceRe, (a, b) => {
                if(b) {
                    if(b.indexOf(HZQQFaceKey) > -1) {
                        const qqVal = b.replace(HZQQFaceKey, '')
                        return `[${faceMap.QQFaceList[qqVal]}]`
                    }
                    if(b.indexOf(HZEmojiKey) > -1) {
                        const emojiVal = b.replace(HZEmojiKey, '')
                        let key = `<${faceMap.EmojiList[emojiVal]}>`

                        if(!(key in faceMap.QQFaceMap)) {
                            key = faceMap.EmojiList[emojiVal]
                        }

                        const t = faceMap.EmojiCodeMap[faceMap.QQFaceMap[key]]

                        if(t) {
                            return t
                        }else {
                            return `[${key}]`
                        }
                    }
                }
                return a
            })

            res = res.replace(/<\/div><div>/g, '\n')
            res = res.replace(/<\/?[^>]+(>|$)/g, '')
            // res = msgUtils.htmlDecode(res)
            res = res.replace(/&nbsp;/g, ' ')
            res = _.unescape(res)

            return res
        }
        return res
    },
    htmlDecode(str) {
        let s = ''
        if(str.length === 0) return ''
        s = str.replace(/&amp;/g, '&')
        s = s.replace(/&lt;/g, '<')
        s = s.replace(/&gt;/g, '>')
        s = s.replace(/&nbsp;/g, ' ')
        s = s.replace(/&#39;/g, "\'")
        s = s.replace(/&quot;/g, '\"')
        return s
    },
    // genEmoticonHTML(cls, text, src) {
    //     return `<img class="${cls}" text="${text}" src="${src}" />`
    // },
    genFaceHTML(idx) {
        const attrs = msgUtils.getImgAttr({
            idx,
            type: 'qq',
        })
        return `<img alt="${attrs.alt}" src="${attrs.src}" class="${styles.faceImg}" ${HZFaceKey}="${attrs[HZFaceKey]}"/>`
    },
    genEmojiHtml(name) {
        for(let i = 0, j = faceMap.EmojiList.length; i < j;) {
            if(faceMap.EmojiList[i] === name) {
                const attrs = msgUtils.getImgAttr({
                    idx: i,
                    type: 'emoji',
                })
                return `<img alt="${attrs.alt}" src="${attrs.src}" class="${styles.faceImg}" ${HZFaceKey}="${attrs[HZFaceKey]}"/>`
            }
            i += 1
        }
    },
    msgToHtml(t) {
        if(typeof t === 'string') {
            return t.replace(/\n/g, '<br />')
        }else {
            return ''
        }
    },
    getEmoticonByText(e) {
        let t
        // if(e.indexOf('<') > -1) {
        //     if (t = this.QQFaceMap[e]) return msgUtils.genEmoticonHTML("emoji emoji" + t, this.EmojiCodeMap[t])
        // }
        if((t = faceMap.QQFaceMap[e.replace(/\[|\]/g, '')])) {
            return msgUtils.genFaceHTML(t)
        }
        return e
    },
    qqFaceToImg(t) {
        let r = t
        if(t) {
            r = msgUtils.msgToHtml(r)
            r = r.replace(/\[([^\]]+)\]/g, (i, o) => {
                if(o === msgUtils.getEmoticonByText(o)) {
                    return `[${o}]`
                }else {
                    return msgUtils.getEmoticonByText(o)
                }
            })
        }
        return r
    },
    emojiToImg(content) {
        let res = content
        if(res) {
            for(let i = 0; i < res.length;) {
                if(emojiValues.indexOf(res[i]) !== -1) {
                    let key = emojiKeys[emojiValues.indexOf(res[i])]
                    let eKey = emojiAllKeys[emojiAllValues.indexOf(key)]
                    if(eKey.indexOf('<') !== -1) {
                        let c = eKey.substr(1, eKey.length - 2)
                        res = res.replace(res[i], msgUtils.genEmojiHtml(c))
                    }
                }
                i += 1
            }
        }
        return res
    },
}

export default msgUtils