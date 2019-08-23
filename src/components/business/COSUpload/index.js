/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */

import React from 'react'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import {Upload, notification} from 'antd'
import COS from 'cos-js-sdk-v5'
import util from 'cos-js-sdk-v5/src/util'

@connect(({base}) => ({
    base,
}))
class Index extends React.Component {
    static propTypes = {
        uploadProps: PropTypes.object,
    }

    formatUrl = (url) => {
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
    }

    upload = (file, token, onProgress, onSuccess, onError) => {
        util.getFileMd5(file, (err, hash)=>{
            if(!err){
                const getKey = () => {
                    let idx = file.name.lastIndexOf('.')
                    let ext = ''
                    if (idx !== -1) {
                        ext = file.name.substr(idx)
                    }

                    return `${token.user_dir}/${hash}${ext}`
                }

                const cos = new COS({
                    getAuthorization: (options, callback) => {
                        callback({
                            TmpSecretId: token.credentials && token.credentials.tmp_secret_id,
                            TmpSecretKey: token.credentials && token.credentials.tmp_secret_key,
                            XCosSecurityToken: token.credentials && token.credentials.session_token,
                            ExpiredTime: token.expired_time,
                        })
                    },
                })

                if(file.size > 1024 * 1024) {
                    cos.sliceUploadFile({
                        Bucket: token.bucket,
                        Region: token.region,
                        Key: getKey(file.name),
                        Body: file,
                        TaskReady: function(tid) {

                        },
                        onHashProgress: function(progressData) {

                        },
                        onProgress: function(progressData) {
                            onProgress(progressData)
                        },
                    }, (err, data) => {
                        if(!err) {
                            data.url = this.formatUrl(data.Location)
                            onSuccess(data, {})
                        }else {
                            onError(err)
                        }
                    })
                }else {
                    cos.putObject({
                        Bucket: token.bucket,
                        Region: token.region,
                        Key: getKey(file.name),
                        Body: file,
                        TaskReady: function(tid) {

                        },
                        onProgress: function(progressData) {
                            onProgress(progressData)
                        },
                    }, (err, data) => {
                        if(!err) {
                            data.url = this.formatUrl(data.Location)
                            onSuccess(data, {})
                        }else {
                            onError(err)
                        }
                    })
                }
            }else {
                notification.error({
                    message: 'md5 error!',
                })
            }
        })
    }

    checkTokenExpired = () => {
        const cosAuthRes = this.cosAuthRes
        if(!cosAuthRes) {
            return true
        }
        const expiredTime = cosAuthRes.expired_time || 0
        const now = new Date().getTime()

        return (expiredTime * 1000 - now) < (1000 * 60 * 30)
    }

    customRequest = (option) => {
        const {file, onProgress, onSuccess, onError} = option
        if(this.checkTokenExpired()) {
            this.props.dispatch({
                type: 'base/cosAuth',
                payload: {},
                callback: async (res) => {
                    this.cosAuthRes = res
                    this.upload(file, res, onProgress, onSuccess, onError)
                },
            })
        }else {
            this.upload(file, this.cosAuthRes, onProgress, onSuccess, onError)
        }
    }

    setCustomRequest = (uploadProps) => {
        if(typeof uploadProps.customRequest === 'undefined') {
            uploadProps.customRequest = this.customRequest
        }
    }

    render() {
        const {uploadProps, children} = this.props

        this.setCustomRequest(uploadProps)

        return (
            <Upload {...uploadProps}>
                {children}
            </Upload>
        )
    }
}

export default Index
