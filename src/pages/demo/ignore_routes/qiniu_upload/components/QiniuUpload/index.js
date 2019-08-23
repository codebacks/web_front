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
import {fileToObject} from 'antd/lib/upload/utils'
import * as qiniu from 'qiniu-js'
import _ from 'lodash'
import {localStorageFn} from 'utils'
import {computeMd5} from "qiniu-js/src/utils"
import {captureException} from 'utils/raven'

const huzanQiniuResKey = 'HUZAN_QINIU_TEST_RES_KEY'
const QiNiuHost = ['upload.qiniup.com', 'up-z0.qiniup.com', 'upload-jjh.qiniup.com', 'upload-xs.qiniup.com', 'upload.qbox.me', 'up.qiniup.com']

@connect(({base}) => ({
    base,
}))
class Index extends React.PureComponent {
    static propTypes = {
        getKey: PropTypes.func,
        beforeUpload: PropTypes.func,
    }

    static defaultProps = {
        accept: 'image/jpeg,image/jpg,image/png,image/gif',
        beforeUpload: (file) => {
            return new Promise((resolve, reject) => {
                const typeOk = file.type === 'image/jpeg'
                    || file.type === 'image/jpg'
                    || file.type === 'image/png'
                    || file.type === 'image/gif'
                if(!typeOk) {
                    notification.error({
                        message: '图片格式错误',
                        description: '仅能上传jpg/jpeg/png/gif格式图片',
                    })
                    reject(new Error('仅能上传jpg/jpeg/png/gif格式图片'))
                }
                const sizeOk = file.size <= 1024 * 1024 * 2
                if(!sizeOk) {
                    notification.error({
                        message: '图片大小超出限制',
                        description: '图片大小不能超过2M',
                    })
                    reject(new Error('图片大小不能超过2M'))
                }
                resolve()
            })
        },
        getKey: (file, hash, qiniuAuthRes) => {
            let idx = file.name.lastIndexOf('.')
            let ext = ''
            if(idx !== -1) {
                ext = file.name.substr(idx)
            }

            return `${qiniuAuthRes.user_dir}${hash}${ext}`
        },
    }

    static extra = '支持jpg、jpeg、png、gif格式，图片大小不超过2MB(上传图片时，如出现浏览器卡死的情况，请尝试关闭输入法)'

    static getDerivedStateFromProps(nextProps) {
        if('fileList' in nextProps) {
            return {
                fileList: nextProps.fileList || [],
            }
        }
        return null
    }

    constructor(props) {
        super(props)

        this.state = {
            fileList: props.fileList || props.defaultFileList || [],
        }

        this.qiniuAuthRes = this.getQiniuAuthRes()
        this.qiniuAuthLoading = false
        this.qiniuAuthPromiseArr = []
    }

    componentWillUnmount() {
        this.resolveQiniuAuthPromiseArr()
    }

    getQiniuAuthRes = () => {
        try {
            const qiniuAuthResStr = localStorageFn('getItem', [huzanQiniuResKey], null)

            return JSON.parse(qiniuAuthResStr)
        }catch(e) {
            return null
        }
    }

    setQiniuAuthRes = (value) => {
        try {
            return localStorageFn('setItem', [huzanQiniuResKey, JSON.stringify(value)])
        }catch(e) {
            return false
        }
    }

    removeQiniuAuthRes = () => {
        return localStorageFn('removeItem', [huzanQiniuResKey])
    }

    onChange = (info) => {
        if(!('fileList' in this.props)) {
            this.setState({fileList: info.fileList})
        }

        const {onChange} = this.props
        if(onChange) {
            onChange(info)
        }
    }

    qiniuUpload = ({file, key, token, putExtra, config, qiniuConfig, onProgress, onError, onSuccess, qiniuAuthRes}) => {
        let observable = qiniu.upload(
            file,
            key,
            token,
            putExtra,
            {
                ...config,
                ...{
                    uphost: qiniuConfig.QiNiuHost.shift(),
                },
            },
        )
        qiniuConfig.subscription = observable.subscribe({
            next: (response) => {
                response.percent = response.total.percent
                onProgress(response)
            },
            error: (err) => {
                if(qiniuConfig.QiNiuHost.length) {
                    this.qiniuUpload({
                        file,
                        key,
                        token,
                        putExtra,
                        config,
                        qiniuConfig,
                        onProgress,
                        onError,
                        onSuccess,
                        qiniuAuthRes,
                    })
                }else {
                    this.qiniuAuthRes = null
                    this.removeQiniuAuthRes()
                    captureException('七牛SDK上传失败', {extra: err})
                    onError(err)
                }
            },
            complete(res) {
                res.domain = qiniuAuthRes.domain
                res.url = `https://${res.domain}/${res.key}`
                onSuccess(res, file)
            },
        })
    }

    upload = (qiniuAuthRes, option, QiNiuHost = []) => {
        const {file, onProgress, onSuccess, onError} = option
        let isAbort = false
        let qiniuConfig = {
            QiNiuHost,
            subscription: {},
        }
        computeMd5(file).then((hash) => {
            if(isAbort) {
                return
            }
            const {accept} = this.props
            const key = this.props.getKey(file, hash, qiniuAuthRes)

            this.qiniuUpload({
                file,
                key,
                token: qiniuAuthRes.credentials.session_token,
                putExtra: {},
                config: {
                    mimeType: accept.split(','),
                    disableStatisticsReport: true,
                },
                qiniuConfig,
                onProgress,
                onError,
                onSuccess,
                qiniuAuthRes,
            })
        }).catch((e) => {
            console.log(e)
            captureException('md5计算失败', {extra: e})
            onError(e)
            notification.error({
                message: 'md5 error!',
            })
        })

        return {
            abort() {
                isAbort = true
                if(typeof _.get(qiniuConfig, 'subscription.unsubscribe') === 'function') {
                    qiniuConfig.subscription.unsubscribe()
                }
                qiniuConfig = null
            },
        }
    }

    checkTokenExpired = () => {
        const qiniuAuthRes = this.qiniuAuthRes
        if(!qiniuAuthRes) {
            return true
        }
        const expiredTime = qiniuAuthRes.expiredTime || 0
        const now = new Date().getTime()

        return (expiredTime - now) < (1000 * 60 * 10)
    }

    customRequest = (option) => {
        return this.upload(this.qiniuAuthRes, option, this.getQiNiuHost())
    }

    getQiNiuHost = () => {
        return QiNiuHost.slice()
    }

    resolveQiniuAuthPromiseArr = (data) => {
        const qiniuAuthPromiseArr = this.qiniuAuthPromiseArr
        qiniuAuthPromiseArr.forEach(({resolve, reject}) => {
            resolve(data)
        })
        this.qiniuAuthPromiseArr = []
    }

    rejectQiniuAuthPromiseArr = (data) => {
        const qiniuAuthPromiseArr = this.qiniuAuthPromiseArr
        qiniuAuthPromiseArr.forEach(({resolve, reject}) => {
            reject(data)
        })
        this.qiniuAuthPromiseArr = []
    }

    qiniuAuth = () => {
        return new Promise((resolve, reject) => {
            if(this.checkTokenExpired()) {
                if(this.qiniuAuthLoading) {
                    this.qiniuAuthPromiseArr.push({resolve, reject})
                    return
                }
                this.qiniuAuthLoading = true
                this.props.dispatch({
                    type: 'base/qiniuAuthTest',
                    payload: {},
                    callback: (res) => {
                        this.qiniuAuthLoading = false
                        if(!this.checkTokenExpired()) {
                            resolve(res.data)
                            return
                        }
                        if(_.get(res, 'meta.code') === 200) {
                            this.qiniuAuthRes = res.data
                            this.qiniuAuthRes.expiredTime = new Date().getTime() + (this.qiniuAuthRes.expires * 1000)
                            this.setQiniuAuthRes(this.qiniuAuthRes)
                            resolve(res.data)
                            this.resolveQiniuAuthPromiseArr(res.data)
                        }else {
                            reject(res)
                            this.rejectQiniuAuthPromiseArr(res)
                        }
                    },
                })
            }else {
                resolve(this.qiniuAuthRes)
            }
        })
    }

    beforeUpload = async (file) => {
        const targetItem = fileToObject(file)
        targetItem.status = 'uploading'
        const nextFileList = this.state.fileList
        const fileIndex = nextFileList.findIndex(({uid}) => uid === targetItem.uid)
        if(fileIndex === -1) {
            nextFileList.push(targetItem)
        }else {
            nextFileList[fileIndex] = targetItem
        }

        this.onChange({
            file: targetItem,
            fileList: nextFileList.concat(),
        })

        const {beforeUpload} = this.props
        let res
        try {
            if(beforeUpload) {
                res = await beforeUpload(file)
                if(res === false) {
                    throw new Error('beforeUpload error!')
                }
            }
            await this.qiniuAuth()
        }catch(e) {
            const nextFileList = this.state.fileList
            const fileIndex = nextFileList.findIndex(({uid}) => uid === targetItem.uid)
            if(fileIndex > -1) {
                nextFileList.splice(fileIndex, 1)
                targetItem.status = 'removed'
                this.onChange({
                    file: targetItem,
                    fileList: nextFileList.concat(),
                })
            }

            captureException('上传前校验失败', {extra: e})
            throw new Error(e)
        }

        return res
    }

    render() {
        const {fileList} = this.state
        const {uploadRef, ...otherProps} = this.props
        return (
            <Upload
                {...otherProps}
                ref={uploadRef}
                fileList={fileList}
                beforeUpload={this.beforeUpload}
                onChange={this.onChange}
                customRequest={this.props.customRequest ? this.props.customRequest : this.customRequest}
            />
        )
    }
}

export default Index
