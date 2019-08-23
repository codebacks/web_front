/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */

import React from 'react'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import {notification, Upload} from 'antd'
import COS from 'cos-js-sdk-v5'
import util from "cos-js-sdk-v5/src/util"

@connect(({base}) => ({
    base,
}))
class Index extends React.PureComponent {
    static propTypes = {
        getKey: PropTypes.func,
    }

    static defaultProps = {
        accept: 'image/jpeg,image/jpg,image/png,image/gif',
        beforeUpload: (file) => {
            const typeOk = file.type === 'image/jpeg'
                || file.type === 'image/jpg'
                || file.type === 'image/png'
                || file.type === 'image/gif'
            if(!typeOk) {
                notification.error({
                    message: '图片格式错误',
                    description: '仅能上传jpg/jpeg/png/gif格式图片',
                })
                return Promise.reject()
            }
            const sizeOk = file.size <= 1024 * 1024 * 2
            if(!sizeOk) {
                notification.error({
                    message: '图片大小超出限制',
                    description: '图片大小不能超过2M',
                })
                return Promise.reject()
            }
        },
        getKey: (file, hash, token)=>{
            let idx = file.name.lastIndexOf('.')
            let ext = ''
            if (idx !== -1) {
                ext = file.name.substr(idx)
            }

            return `${token.user_dir}/${hash}${ext}`
        }
    }

    static extra = '支持jpg、jpeg、png、gif格式，图片大小不超过2MB(上传图片时，如出现浏览器卡死的情况，请尝试关闭输入法)'

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
                    return this.props.getKey(file, hash, token)
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

    render() {
        return (
            <Upload
                {...this.props}
                customRequest={this.props.customRequest ? this.props.customRequest : this.customRequest}
            />
        )
    }
}

export default Index
