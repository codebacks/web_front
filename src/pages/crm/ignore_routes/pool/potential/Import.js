'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import  {Modal, Upload, Button, notification} from 'antd'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/member'

export default  class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visible: false
        }
    }


    componentDidMount() {

    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_members/setProperty',
            payload: {importModal: false}
        })
    };

    refreshImportStatus = (res) => {
        let desc = `共上传${res.count}条记录，成功${res.success_count},失败${res.fail_count}`
        this.props.dispatch({
            type: 'crm_members/setProperty',
            payload: {importStatusDesc: desc}
        })
        this.props.reload()
    };

    handleCloseProcess = () => {
        this.setState({visible: false})
    };

    render() {
        const _this = this
        const props = {
            name: 'file',
            action: Helper.format(API.IMPORT.url),
            showUploadList: false,
            headers: {
                'Authorization': 'Bearer ' +  this.props.base.accessToken,
            },
            data: {},
            beforeUpload(file){
                _this.setState({visible: true})
                return true
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                }
                if (info.file.status === 'done') {
                    _this.props.dispatch({
                        type: 'crm_members/setProperty',
                        payload: {importStatusDesc: `${info.file.name} 上传成功 `},
                    })
                    _this.refreshImportStatus(info.file.response.data)

                } else if (info.file.status === 'error') {
                    _this.setState({visible: false})
                    notification.error({
                        message: '导入失败',
                        description: '导入用户失败!',
                    })
                }
            },
        }

        return (
            <div style={{display:'inline-block'}}>
                <Upload {...props}>
                    <Button icon="select" type="primary">导入用户</Button>
                </Upload>
                <Modal title="导入用户" visible={this.state.visible}
                    onCancel={this.handleCloseProcess}
                    maskClosable={false}
                    footer={null}>
                    <p style={{
                        fontSize: 18,
                        textAlign: 'center',
                        padding: '40px 0'
                    }}>{this.props.crm_members.importStatusDesc}</p>
                </Modal>
            </div>
        )
    }
}
