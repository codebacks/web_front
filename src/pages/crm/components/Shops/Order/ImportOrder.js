'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */


import React from 'react'
import {Form, Modal, Upload, Button, Select, notification} from 'antd'
// import {connect} from 'dva'
import Helper from 'crm/utils/helper'
import API from 'crm/common/api/order'
import router from 'umi/router'

const FormItem = Form.Item
const Option = Select.Option

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            type_id: '',
            store_id: '',
            visible: false
        }
    }


    componentDidMount() {
        this.props.dispatch({
            type: 'crm_stores/query',
            payload: {params: {limit: 1000}}
        })
    }

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_orders/setProperty',
            payload: {importModal: false}
        })
    };

    handleChange = (key, value) => {
        value = window.parseInt(value)
        if (key === 'type_id') {
            this.setState({[key]: window.parseInt(value), store_id: ''})
        } else {
            this.setState({[key]: window.parseInt(value)})
        }
    };

    refreshImportStatus = (task_id) => {
        let timer = 0
        timer = setInterval(() => {
            if (this.props.crm_orders.state === 'SUCCESS') {
                this.setState({visible: false})
                clearInterval(timer)
                notification.success({
                    message: ' 订单导入',
                    description: ' 订单导入完成',
                })
                this.handleCancel()
                this.props.reload(1)
            } else if (this.props.crm_orders.state === 'FAIL') {
                clearInterval(timer)
            } else {
                this.props.dispatch({
                    type: 'crm_orders/queryImportStatus',
                    payload: {id: task_id},
                })
            }
        }, 500)
    };
    handleCreateStore = (e) => {
        e.preventDefault()
        router.push('/wx/stores')
    };

    handleCloseProcess = () => {
        this.setState({visible: false})
    };

    render() {
        const {initData: config} = this.props.base
        const {list} = this.props.crm_stores
        const {importModal} = this.props.crm_orders
        const storeTypes = config.store_types || []
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }
        const getStoreTypeOptions = () => {
            let options = []
            storeTypes.map((d) => {
                // if (d.id !== config.storeTypeKeys.CUSTOM) {
                options.push(<Option key={d.id + ''} value={d.id + ''} label={d.name}>{d.name}</Option>)
                // }
            })
            return options
        }

        const getStoreOptions = () => {
            let options = []
            if (this.state.type_id !== '') {
                list.map((d) => {
                    if (d.type === this.state.type_id) {
                        options.push(<Option key={d.id + ''} value={d.id + ''} label={d.name}>{d.name}</Option>)
                    }
                })
                return options
            } else {
                return []
            }
        }

        const _this = this
        const props = {
            name: 'file',
            action: Helper.format(API.IMPORT.url),
            showUploadList: false,
            headers: {
                'Authorization': 'Bearer ' + this.props.base.accessToken,
            },
            data: {store_id: this.state.store_id},
            beforeUpload(file) {
                if (!_this.state.store_id) {
                    notification.error({
                        message: '导入失败',
                        description: '请先选择电商平台及店铺',
                    })
                    return false
                }
                _this.setState({visible: true})
                return true
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    // console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    _this.props.dispatch({
                        type: 'crm_orders/setProperty',
                        payload: {importStatusDesc: `${info.file.name} 上传成功 `},
                    })
                    _this.refreshImportStatus(info.file.response.data.task_id)

                } else if (info.file.status === 'error') {
                    _this.setState({visible: false})
                    notification.error({
                        message: '导入失败',
                        description: '订单导入失败!',
                    })
                }
            },
        }

        return (
            <div>

                <Modal title="导入订单" visible={importModal}
                    onCancel={this.handleCancel}
                    maskClosable={false}
                    width={640}
                    footer={[
                        <Button key="cancel" type="ghost" onClick={this.handleCancel.bind(this)}>取消</Button>
                    ]}>
                    <Form layout="horizontal"
                        className="ant-advanced-search-form">
                        <FormItem {...formItemLayout} label={'电商平台'}>
                            <Select placeholder="请选择电商平台" style={{width: 250}}
                                value={this.state.type_id + ''}
                                onChange={this.handleChange.bind(this, 'type_id')}>
                                {getStoreTypeOptions()}
                            </Select>
                        </FormItem>
                        <FormItem {...formItemLayout} label={'店铺名称'}>
                            <Select placeholder="请选择店铺" onChange={this.handleChange.bind(this, 'store_id')}
                                value={this.state.store_id + ''}
                                style={{width: 250}}>
                                {getStoreOptions()}
                            </Select>
                            <a href="#" style={{marginLeft: 20}} onClick={this.handleCreateStore}>去创建店铺</a>
                        </FormItem>
                        <FormItem {...formItemLayout} label={'订单文件'}>
                            <Upload {...props}>
                                <Button type="primary">选择文件</Button>
                            </Upload>
                            <p style={{color: '#f60'}}>第三方平台导出的execl或cvs文件，为保证正常导入，文件禁止手动修改</p>
                        </FormItem>
                    </Form>
                </Modal>
                <Modal title="订单导入" visible={this.state.visible}
                    onCancel={this.handleCloseProcess}
                    footer={null}>
                    <p style={{
                        fontSize: 18,
                        textAlign: 'center',
                        padding: '40px 0'
                    }}>{this.props.crm_orders.importStatusDesc}</p>
                </Modal>
            </div>
        )
    }
}
