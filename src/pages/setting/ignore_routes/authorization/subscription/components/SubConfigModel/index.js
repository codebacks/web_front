/*
 * @Author: sunlzhi 
 * @Date: 2018-09-07 10:30:15 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-09-12 11:21:42
 */

import React, {Component} from 'react'
import { Button, Modal, Upload, message } from 'antd'
import styles from './index.less'

export default class Index extends Component {
    state = {
        // 上传的文件
        fileList: [],
        subAppId: '',
        loading: false
    }

    componentDidMount () {
        let subAppId = this.props.subAppId
        this.getSubConfigure(subAppId)
        this.setState({
            subAppId
        })
    }

    // 获取当前公众号配置详情
    getSubConfigure = (app_id) => {
        this.props.dispatch({
            type: 'setting_subscription/addSubConfigure',
            payload: {
                app_id: app_id
            },
            callback: (res) => {
                let dataObj = {
                    uid: '-1',
                    name: '',
                    status: 'done',
                }
                let data = Object.assign(dataObj,  { name: res.txt_path })
                let dataArr = res.txt_path?[data]:[]
                this.setState({
                    fileList: dataArr,
                    subConfigureVisible: true
                })
            }
        })
    }

    // 限制上传文件个数
    uplaodFileChange = (info) => {
        let fileList = info.fileList
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1)
        // 2. Read from response and show file link
        fileList = fileList.map((file) => {
            if (file.response) {
                // Component will show file.url as link
                file.name = file.response.key
            }
            return file
        })
        // 3. Filter successfully uploaded files according to response from server
        fileList = fileList.filter((file) => {
            if (file.response) {
                return !!file.response.key
            }
            return true
        })
        this.setState({ fileList })
    }

    OnSubOk = () => {
        // this.props.subOk(this.props.subAppId)
        // 公众号配置确认
        if (this.state.fileList.length > 0) {
            this.setState({ loading: true })
            this.props.dispatch({
                type: 'setting_subscription/putSubConfigure',
                payload: {
                    app_id: this.state.subAppId,
                    txt_url: this.state.fileList[0].name
                },
                callback: () => {
                    let subDataArr = this.props.setting_subscription.subData
                    for (let v of subDataArr) {
                        if (v.app_id === this.state.subAppId) {
                            Object.assign(v,  { has_auth: 1 })
                            this.setState({subData: subDataArr})
                            break
                        }
                    }
                    
                    this.setState({ loading: false })
                    this.handleCancel()
                }
            })
        } else {
            message.error('请先上传TXT文件')
        }

    }

    handleCancel = () => {
        this.props.handleCancel()
    }

    render() {

        // 上传文件的配置
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: '.txt',
            showUploadList: {
                showRemoveIcon: false
            },
            headers: {},
            data: {
                token: this.props.setting_subscription.qiniuToken.token
            },
            onChange: this.uplaodFileChange,
        }

        return (
            <Modal title="公众号配置"
                visible={this.props.subConfigureVisible}
                onOk={this.OnSubOk}
                confirmLoading={this.state.loading}
                onCancel={this.handleCancel}
            >
                <p>
                    <span className={styles.subConPadding}>当前公众号的商户号，需与选择的支付配置商户号一致</span>
                    <a href="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md" target='_blank' rel="nofollow me noopener noreferrer">使用教程</a>
                </p>
                <div className={styles.uploadBox}>
                    <span style={{float: 'left', marginTop: 6}}>网页授权TXT：</span>
                    <Upload {...uploadProps} fileList={this.state.fileList} className={styles.upload} onRemove={false}>
                        <Button>上传</Button>
                    </Upload>
                </div>
            </Modal>
        )
    }
}