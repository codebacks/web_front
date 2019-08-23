'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */

import React from 'react'
import {Form, Modal, Button, notification} from 'antd'
import {connect} from 'dva'
import QiniuUpload from 'components/QiniuUpload'
import styles from './UploadQrcode.scss'

const FormItem = Form.Item

@connect(({loading}) => ({}))
class UploadQrcode extends React.Component {
    constructor(props) {
        super()
        this.state = {
            qrcode_url: props.record.qrcode_url,
            notifyLoading: false,
            loading: false,
            fileList: [],
        }
    }

    handleSendCode = () => {
        // 发送手机指令上传
        this.setState({notifyLoading: true})
        this.props.dispatch({
            type: 'wx_wechats/notifications',
            payload: {
                body: {
                    uin: this.props.record.uin,
                    type: 'card',
                },
            },
            callback: () => {
                this.setState({notifyLoading: false})
                Modal.success({
                    title: '指令发送成功',
                    content: '通过手机上传图片会有延时，稍后刷新查看！',
                    onOk: () => {
                        this.props.onCancel()
                        this.props.reload()
                    },
                })
            },
        })

    }

    handleUploadError = (key, error) => {
        notification.error({message: '上传失败', description: error})
        this.setState({loading: false})
    }

    handleReady = () => {
        this.setState({loading: true})
    }

    handleSaveQrcode = (info) => {
        if(info.file.status === 'done') {
            const {record} = this.props
            this.setState({loading: false, qrcode_url: info.file.response.url, fileList: info.fileList})
            this.props.dispatch({
                type: 'wx_wechats/update',
                payload: {username: record.username, body: {qrcode_url: `${info.file.response.url}`}},
                callback: () => {
                    this.props.reload()
                },
            })
        }else {
            this.setState({fileList: info.fileList})
        }
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {loading, notifyLoading, fileList} = this.state
        return (
            <Modal title="二维码名片" visible={this.props.visible}
                   onCancel={this.handleCancel}
                   maskClosable={false}
                   footer={null}>
                <div className={styles.qrcodeWrap}>
                    <div className={styles.btn}>
                        <Button type="primary" icon="android-o" onClick={this.handleSendCode}
                                loading={notifyLoading} style={{width: 160}}>发指令手机上传</Button>
                    </div>
                    {this.state.qrcode_url &&
                    <img className={styles.qrcode} src={this.state.qrcode_url} onClick={this.handleUploadQrcode}/>}
                    <div className={styles.btn}>
                        <QiniuUpload
                            onChange={this.handleSaveQrcode}
                            fileList={fileList}
                            showUploadList={false}
                        >
                            <Button icon="upload" style={{width: 160}} loading={loading}>手动上传</Button>
                        </QiniuUpload>
                    </div>
                </div>
            </Modal>
        )
    }
}

UploadQrcode.propTypes = {}

export default UploadQrcode