import qs from 'querystring'
/**
 * 文件说明:
 * 用于统一控制系统，附件的显示或者下载地址
 * ----------------------------------------
 * 创建用户: 罗龙
 * 创建日期 2018/10/29
 */


//附件图片的根URL
const IMAGE_ROOT_URL = '//image.51zan.com/'
// 附件文档的根URL
const DOCUMENT_ROOT_URL = '//document.51zan.com/'

export {
    IMAGE_ROOT_URL,
    DOCUMENT_ROOT_URL
}

const IMAGE_DEFAULT_OPTION = {
    /**
     * 缩略图，不为null，是在显示缩略图 
     * {width:'100', height: '100'}
     */
    thumbnail: {
        width: 100,
        height: 100
    },
    /**
     * 是否自动修正图片的方向
     * 主要是h5，ios 手机拍照的图片，上传后，会被旋转90度，导致在 pc web上浏览图片和期望不正确
     */
    autoOrient: false
}

/**
 * 获取图片资源的绝对URL地址
 * @param {string} relativeUrl 相对资源Url
 * @param {json} option 配置
 * @param {json} option.thumbnail 缩略图配置
 * @param {boolean} options.autoOrient 是否自动修正图片
 */
export function getImageAbsoulteUrl(relativeUrl, option = {}) {
    const config = {
        ...IMAGE_DEFAULT_OPTION,
        ...option
    }

    let url = relativeUrl
    if(!isAbsouteUrl(relativeUrl)){
        url = `${IMAGE_ROOT_URL}${relativeUrl}`
    }


    if(option.thumbnail){
        //reference docs https://developer.qiniu.com/dora/manual/1279/basic-processing-images-imageview2
        return url += `?imageView2/2/w/${config.thumbnail.width}/h/${config.thumbnail.height}`
    }

    if(option.autoOrient === true) {
        return url += `?imageMogr2/auto-orient`
    }

    return url
}

/**
 * 获取文档资源的绝对URL地址
 * @param {string} relativeUrl 相对文档资源的URL地址
 */
export function getDocumentAbsoulteUrl(relativeUrl) {
    if(isAbsouteUrl(relativeUrl)){
        return relativeUrl
    }
    
    return `${DOCUMENT_ROOT_URL}${relativeUrl}`
}



function isAbsouteUrl(url){
    return url && (url.indexOf('http') === 0 || url.indexOf('//') === 0)
}

/**
 * 是否为新零售版
 */
export  function isNewRetail(){
    let origin = window.location.origin
    return origin && origin.endsWith('siyuguanjia.com')
}
