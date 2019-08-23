/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */


export const HZMentionTagName = `hz-mention`
export const HZMentionIdKey= `id`
const HZMentionRe = new RegExp(`<${HZMentionTagName}[^>]*data-${HZMentionIdKey}="(.*?)"[^>]*>(.|\n)*?</${HZMentionTagName}>`, 'g')

export function replaceMentionHtml(html = '', cb) {
    if(html){
        html = html.replace(HZMentionRe, (mentionHtml, id, d, index)=>{
            return cb(mentionHtml, id, index)
        })
    }
    return html
}
