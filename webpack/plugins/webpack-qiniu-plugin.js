const fs = require('fs')
const path = require('path')
const qiniu = require('qiniu')

let options = {
    accessKey: null,
    secretKey: null,
    scope: null,
    rootDir: './dist',
    stuffex: '',
    exclude: [],
    includeExtensions: [],
    excludeExtensions: [],
}

// options = {
//     ...options,
//     ...{
//         // 七牛的accessKey
//         accessKey: 'hxLChuZ00lgpuuN_Q5ogIj6-8ZehSQq7UbXLjd_Y',
//         // 七牛的secretKey
//         secretKey: '5taPdgGuk1X1Eg88VDiXf5JwDmrqU22IXkg5r40i',
//         // 七牛的空间名称
//         scope: 'asset',
//         // 要上传的根目录
//         rootDir: './dist',
//         // 上传文件的目录
//         stuffex: `retail/production_develop/`,
//         // 排除文件目录，只针对根目录下的一级目录
//         exclude: [
//             'base',
//             // 'demo',
//             'images',
//         ],
//         // 排查上传的扩展名文件
//         excludeExtensions: [ '.html'],
//     }
// }

// start()

function start(callback) {

    if(options.exclude) {
        options = {
            ...options,
            ...{
                exclude: options.exclude.map(c => path.join(options.rootDir, c)),
            },
        }
    }

    const {rootDir, stuffex} = options

    const fileData = uploadDir(rootDir, stuffex, options)


    const promises = asyncPool(5, fileData, function({fileName , localFilePath}){
        // console.log(fileName, localFilePath)
        return upload(fileName, localFilePath)
    })

    promises.then(result => {
        console.log('webpack-qiniu-plugin 上传成功：\r\n')
        const logs = result.map(({responseInfo, responseBody, fileName, localFileName}) => `   ${localFileName} \r\n       --> ${fileName}`)
        console.log(logs.join("\r\n"))
        console.log('webpack-qiniu-plugin Done.')
        callback && callback()
    }).catch(error => {
        console.log('webpack-qiniu-plugin 上传失败：\r\n')
        console.log(JSON.stringify(error))
        throw new Error(error)
    })

    

    

    // Promise.all(promises).then(result => {
    //     console.log('webpack-qiniu-plugin 上传成功：\r\n')
    //     const logs = result.map(({responseInfo, responseBody, fileName, localFileName}) => `   ${localFileName} \r\n       --> ${fileName}`)
    //     console.log(logs.join("\r\n"))
    //     console.log('webpack-qiniu-plugin Done.')
    //     callback && callback()
    // }).catch(error => {
    //     console.log('webpack-qiniu-plugin 上传失败：\r\n')
    //     console.log(JSON.stringify(error))
    //     throw new Error(error)
    // })
}

function asyncPool(poolLimit, array, iteratorFn) {
    let i = 0
    const ret = []
    const executing = []
    const enqueue = function () {
        // 边界处理，array为空数组
        if (i === array.length) {
            return Promise.resolve()
        }
        // 每调一次enqueue，初始化一个promise
        const item = array[i++]
        const p = Promise.resolve().then(() => iteratorFn(item, array))
        // 放入promises数组
        ret.push(p)
        // promise执行完毕，从executing数组中删除
        const e = p.then(() => executing.splice(executing.indexOf(e), 1))
        // 插入executing数字，表示正在执行的promise
        executing.push(e)
        // 使用Promise.rece，每当executing数组中promise数量低于poolLimit，就实例化新的promise并执行
        let r = Promise.resolve()
        if (executing.length >= poolLimit) {
            r = Promise.race(executing)
        }
        // 递归，直到遍历完array
        return r.then(() => enqueue())
    }
    return enqueue().then(() => Promise.all(ret))
}

function uploadDir(dirPath, releativeRootPath, options) {
    if(!fs.existsSync(dirPath)) {
        throw Error(`${dirPath} 目录不存在`)
    }

    const {exclude, includeExtensions, excludeExtensions} = options
    const dir = fs.readdirSync(dirPath)

    let files = [], childDirs = []

    for(let name of dir) {
        let fileInfo = path.join(dirPath, name)
        let stat = fs.statSync(fileInfo)
        if(stat.isDirectory()) {
            if(!exclude.some(c => c === fileInfo)) {
                childDirs.push(name)
            }
        }
        else {
            let ext = path.extname(name)

            if(
                (includeExtensions.length === 0 || includeExtensions.some(c => c === ext))
                && !(excludeExtensions && excludeExtensions.some(c => c === ext))
            ) {
                files.push(name)
            }
        }
    }

    let promises = []

    files.forEach(name => {
        let pathInfo = path.join(dirPath, name)
        let promise = uploadGetObject(`${releativeRootPath}${name}`, pathInfo)
        promises.push(promise)
    })

    childDirs.forEach(name => {
        let pathInfo = path.join(dirPath, name)
        let rePromises = uploadDir(pathInfo, `${releativeRootPath}${name}/`, options)
        promises.push(...rePromises)
    })

    return promises
}

function uploadGetObject(fileName, localFilePath) {
    return {
        fileName,
        localFilePath
    }
}

function upload(fileName, localFilePath) {
    //reference docs url: https://developer.qiniu.com/kodo/sdk/1289/nodejs#form-upload-file

    const {scope, accessKey, secretKey} = options
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    // 简单上传
    // const options = {
    //     scope: 'retail',   //上传空间名字
    // };

    // 覆盖上传
    // reference docs url: https://developer.qiniu.com/kodo/sdk/1289/nodejs#overwrite-uptoken
    const option = {
        scope: `${scope}:` + fileName,
    }

    const putPolicy = new qiniu.rs.PutPolicy(option)
    const uploadToken = putPolicy.uploadToken(mac)

    let config = new qiniu.conf.Config()
    config.zone = qiniu.zone.Zone_z0 //华东

    let localFile = localFilePath
    let formUploader = new qiniu.form_up.FormUploader(config)
    let putExtra = new qiniu.form_up.PutExtra()
    let key = fileName

    return new Promise(function(resolve, reject) {
        // 文件上传
        formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr, respBody, respInfo) {
            if(respErr) {
                reject({error: respErr, fileName: fileName, localFileName: localFilePath})
            }

            resolve({responseInfo: respInfo, responseBody: respBody, fileName: fileName, localFileName: localFilePath})
        })
    })
}

function checkConfig(name, value) {
    if(!value) {
        throw new Error(`配置错误 ${name}`)
    }
}

class UploadToQiNiu {
    constructor(config) {
        checkConfig('accessKey', config.accessKey)
        checkConfig('secretKey', config.secretKey)
        checkConfig('scope', config.scope)

        options = {
            ...options,
            ...config,
        }
    }

    apply(compile) {
        compile.plugin("done", function(compilation, callback) {
            start(callback)
        })
    }
}

module.exports = UploadToQiNiu
