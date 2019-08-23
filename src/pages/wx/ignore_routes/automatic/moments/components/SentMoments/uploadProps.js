import {notification} from 'antd'
import {imageType, imageMaxSize, videoMaxSize} from '../../config'

const imageTypeText = imageType.join('/').replace(/image\//g, '')

const uploadProps = {
    imageUploadProps: (fileList, onChange) => {
        return {
            accept: imageType.join(','),
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    const typeOk = imageType.includes(file.type)
                    if(!typeOk){
                        notification.error({
                            message: '图片格式错误',
                            description: `仅能上传${imageTypeText}格式图片`,
                        })
                        reject(file)
                        return
                    }
                    const sizeOk = file.size <= 1024 * 1024 * imageMaxSize // 图片大小限制
                    if(!sizeOk){
                        notification.error({
                            message: '图片大小超出限制',
                            description: `图片大小不能超过${imageMaxSize}M`,
                        })
                        reject(file)
                        return
                    }
                    resolve(file)
                })
            },
            onChange: onChange,
            fileList,
            showUploadList: false,
            multiple: true,
        }
    },
    videoUploadProps: (fileList, onChange) => {
        return {
            accept: 'video/mp4',
            onChange: onChange,
            beforeUpload: (file)=>{
                return new Promise((resolve, reject) => {
                    const typeOk = file.type === 'video/mp4'
                    if (!typeOk) {
                        notification.error({
                            message: '视频格式错误',
                            description: '仅能上传mp4视频文件!',
                        })
                        reject(file)
                        return
                    }
                    const sizeOk = file.size <= 1024 * 1024 * videoMaxSize // 视频大小限制
                    if (!sizeOk) {
                        notification.error({
                            message: '视频大小超出限制',
                            description: `视频大小不能超过${videoMaxSize}M`,
                        })
                        reject(file)
                        return
                    }
                    resolve(file)
                })
            },
            fileList: fileList,
        }
    },
    coverUploadProps: (fileList, onChange) => {
        return {
            accept: imageType.join(','),
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    const typeOk = imageType.includes(file.type)
                    if(!typeOk){
                        notification.error({
                            message: '图片格式错误',
                            description: `仅能上传${imageTypeText}格式图片`,
                        })
                        reject(file)
                        return
                    }
                    const sizeOk = file.size <= 1024*1024 // 图片大小限制1M以内
                    if(!sizeOk){
                        notification.error({
                            message: '图片大小超出限制',
                            description: '图片大小不能超过1M',
                        })
                        reject(file)
                        return
                    }
                    resolve(file)
                })
            },
            showUploadList: false,
            listType: "picture-card",
            onChange: onChange,
            fileList: fileList,
        }
    }
}

export default uploadProps
