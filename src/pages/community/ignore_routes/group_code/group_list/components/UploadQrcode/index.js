/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/21
 */

import React from 'react'
import {Form, Modal, Button, notification} from 'antd'
import {connect} from 'dva'
import moment from 'moment/moment'
import QiniuUpload from 'components/QiniuUpload'
import styles from './index.less'
import config from "community/common/config"

const { DateTimeFormat } = config
const FormItem = Form.Item
const mapQrcodeTxt = {
    0: '二维码不存在',
    1: '二维码正常',
    2: '二维码过期',
    // 3: '二维码失效',
}

@connect(({base, community_groupCodeGroupList, loading}) => ({
    base,
    community_groupCodeGroupList,
    autoUploadLoading: loading.effects['community_groupCodeGroupList/autoUploadGroupQrcode'],
    uploadLoading: loading.effects['community_groupCodeGroupList/uploadGroupQrcode'],
}))
class UploadQrcode extends React.Component {
    constructor(props) {
        super()
        this.state = {
            qrcode_url: props.record.qrcode_url,
            fileList: [],
        }
    }

    componentDidMount(){
        const {record} = this.props
        this.props.dispatch({
            type: 'community_groupCodeGroupList/getAutoUploadQrcodeStatus',
            payload: {
                group_activity_id: this.props.group_activity_id,
                row_id: record.id,
            },
        })
    }

    handleSendCode = () => {
        const { autoUploadQrcodeStatus, autoUploadQrcodeTtl } = this.props.community_groupCodeGroupList
        if(autoUploadQrcodeStatus === 0) {
            const {record} = this.props
            this.props.dispatch({
                type: 'community_groupCodeGroupList/autoUploadGroupQrcode',
                payload: {
                    group_activity_id: this.props.group_activity_id,
                    row_id: record.id,
                },
                callback: () => {
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
        } else{
            Modal.warning({
                title: '指令发送失败',
                content: `上传中，请等待${autoUploadQrcodeTtl}秒后再试`,
                onOk: () => {
                    this.props.onCancel()
                },
            })
        }



    }

    handleSaveQrcode = (info) => {
        if(info.file.status === 'done') {
            const {record} = this.props
            this.setState({qrcode_url: info.file.response.url, fileList: info.fileList})
            this.props.dispatch({
                type: 'community_groupCodeGroupList/uploadGroupQrcode',
                payload: {
                    group_activity_id: this.props.group_activity_id,
                    row_id: record.id,
                    body: {qrcode_url: `${info.file.response.url}`}
                },
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

    getStatusTxtCls = (val) => {
        let cls = `${styles.statusTxt} `
        if(val === 0 || val === 2 || val === 3) {
            cls +=  `${styles.overTime}`
        }else{
            cls +=  `${styles.primary}`
        }
        return cls
    }

    render() {
        const { fileList } = this.state
        const { record, autoUploadLoading, uploadLoading } = this.props
        let qrcode_url = this.state.qrcode_url, timestamp = new Date().getTime()
        if(qrcode_url) {
            qrcode_url.includes('?') ? qrcode_url += `&timestamp=${timestamp}` : qrcode_url += `?timestamp=${timestamp}`
        }

        return (
            <Modal
                title="二维码名片"
                visible={this.props.visible}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={null}>
                <div className={styles.qrcodeWrap}>
                    {qrcode_url &&
                    <img className={styles.qrcode} src={qrcode_url} onClick={this.handleUploadQrcode}/>}
                    {/*qrcode_status  二维码状态  # 0:二维码不存在  1:二维码正常 2:二维码过期 3:二维码失效*/}
                    <div>群二维码状态：<span className={this.getStatusTxtCls(record.qrcode_status)}>{mapQrcodeTxt[record.qrcode_status]}</span></div>
                    {record.qrcode_status === 0 ? null: <div className={styles.overTime}>过期时间：{moment(record.qrcode_expiration).format(DateTimeFormat)}</div>}
                    <div className={styles.btn}>
                        <Button
                            type="primary"
                            icon="android-o"
                            onClick={this.handleSendCode}
                            loading={autoUploadLoading}
                            style={{width: 160}}
                        >发指令手机上传</Button>
                    </div>
                    <div className={styles.btn}>
                        <QiniuUpload
                            onChange={this.handleSaveQrcode}
                            fileList={fileList}
                            showUploadList={false}
                        >
                            <Button icon="upload" style={{width: 160}} loading={uploadLoading}>手动上传</Button>
                        </QiniuUpload>
                    </div>
                </div>
            </Modal>
        )
    }
}

UploadQrcode.propTypes = {}

export default UploadQrcode