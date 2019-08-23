/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/11/3
 */

import React from 'react'
import COS from 'cos-js-sdk-v5'
import { notification, Button } from 'antd'
import COSUpload from 'components/COSUpload'
import helper from '../../utils/helper'
import util from "cos-js-sdk-v5/src/util"
import config from '../../common/config'

class UploadFile extends React.PureComponent {
    constructor (props) {
        super(props)
        this.state = {}
    }

    componentDidMount () {
    }

	upload = (file, token) => {
	    util.getFileMd5(file, (err, hash) => {
	        if (!err) {
	            const iThis = this
                const getKey = ()=>{
                    let idx = file.name.lastIndexOf('.')
                    let ext = ''
                    if (idx !== -1) {
                        ext = file.name.substr(idx)
                    }

                    return `${token.user_dir}/${hash}${ext}`
                }
	            const cos = new COS({
	                getAuthorization: (options, cb) => {
	                    const data = {
	                        TmpSecretId: token.credentials && token.credentials.tmp_secret_id,
	                        TmpSecretKey: token.credentials && token.credentials.tmp_secret_key,
	                        XCosSecurityToken: token.credentials && token.credentials.session_token,
	                        ExpiredTime: token.expired_time
	                    }
	                    cb(data)
	                }
	            })
	            if (iThis.props.limit && file.size > iThis.props.limit) {
	                notification.error({
	                    message: '错误提示',
	                    description: `文件大小不能超过${(iThis.props.limit / 1024 / 1024).toFixed(2)}M.`
	                })
	            } else {
	                if (!config.ImageTypes.includes(file.type)) {
	                    notification.error({
	                        message: '错误提示',
	                        description: `目前支持上传图片格式${config.ImageTypes.join('、')}`
	                    })
	                    return false
	                }
	                if (file.size > 1024 * 1024) {
	                    cos.sliceUploadFile({
	                        Bucket: token.bucket, // Bucket 格式：test-1250000000
	                        Region: token.region,
	                        Key: getKey(file.name),
	                        Body: file,
	                        TaskReady: function (tid) {
	                            iThis.props.onReady(tid, file)
	                        },
	                        onHashProgress: function (progressData) {
	                            // console.log('onHashProgress', JSON.stringify(progressData));
	                        },
	                        onProgress: function (progressData) {
	                            iThis.props.onProgress(progressData)
	                        }
	                    }, function (err, data) {
	                        if (!err) {
	                            iThis.props.onUploaded(helper.formatUrl(data.Location))
	                        } else {
	                            iThis.props.onError(err)
	                        }
	                    })
	                } else {
	                    cos.putObject({
	                        Bucket: token.bucket, // Bucket 格式：test-1250000000
	                        Region: token.region,
	                        Key: getKey(file.name),
	                        Body: file,
	                        TaskReady: function (tid) {
	                            iThis.props.onReady(tid, file)
	                        },
	                        onProgress: function (progressData) {
	                            iThis.props.onProgress(progressData)
	                        }
	                    }, (err, data) => {
	                        if (!err) {
	                            iThis.props.onUploaded(helper.formatUrl(data.Location))
	                        } else {
	                            iThis.props.onError(err)
	                        }
	                    })
	                }
	            }
	        } else {
                notification.error({
                    message: 'md5 error!',
                })
            }
	    })
	}

	handleChangeFileList = ({fileList}) => {
	    let file = fileList[fileList.length - 1]
	    this.setState({fileList: [file]})
	    if (file.status === 'done') {
	        this.setState({url: file.response.url})
	    }
	}

	render () {
	    const {fileList} = this.state
	    const uploadProps = {
	        accept: 'image/*',
	        beforeUpload: () => {
	            this.setState({loading: true})
	        },
	        customRequest: (option) => {
	            this.props.dispatch({
	                type: 'base/cosAuth',
	                payload: {},
	                callback: async (res) => {
	                    const {file, onProgress, onSuccess, onError} = option
	                    this.upload(file, res, onProgress, onSuccess, onError)
	                }
	            })
	        },
	        onChange: this.handleChangeFileList,
	        fileList,
	        showUploadList: false
	    }

	    return (
	        <COSUpload {...uploadProps} >
	            {
	                this.props.children ? this.props.children : <Button icon="upload">上传</Button>
	            }
	        </COSUpload>
	    )
	}
}

export default UploadFile
