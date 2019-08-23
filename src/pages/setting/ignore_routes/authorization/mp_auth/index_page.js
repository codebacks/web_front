/**
 **@time: 2018/8/6
 **@Description: 小程序授权
 **@author: sunlizhi
 */

import React, {Component} from 'react'
import {connect} from 'dva'
import {Button, Modal, Table, Divider} from 'antd'
import config from 'setting/config'
import MpaPayConfigModel from './components/MpaPayConfigModel'
import styles from './index.less'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'

const confirm = Modal.confirm

@connect(({setting_mpa, base}) => ({
    setting_mpa,
    base,
}))

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formVisible: false,
            authVisible: false,
            payConfigureVisible: false,
            editPayConfigureOption: '',
            editPayConfigureId: -1,
            confirmLoading: false,
            subAppId: -1,
            subAppRecord: {},
            modalFormProp: {
                label: '',
                title: '',
                visible: false,
            },
            // 支付配置列表
            payConfigure: [
                {
                    id: -1,
                    used_info: '',
                    key: '请选择',
                    update_time	: '',
                    pay_conf_id: -1,
                }
            ],
            // 授权信息
            authInfoData: []
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.getData()
    }

    // 解除授权
    showConfirm (app_id) {
        confirm({
            title: '确认要解除吗？',
            content: '解除后，与小程序相关的功能将无法使用，是否确定解除？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'setting_mpa/mpaUnbind',
                    payload: {
                        app_id: app_id
                    },
                    callback: () => {
                        this.props.dispatch({
                            type: 'setting_mpa/deleteMpa',
                            payload: {
                                app_id: app_id
                            }
                        })
                    }
                })
            },
            onCancel() {},
        })
    }

    // 获取小程序列表
    getData = (type) => {
        this.props.dispatch({
            type: 'setting_mpa/getMpas',
            payload: {},
        })
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            payConfigureVisible: false,
        })
    }
    
    // 授权弹窗关闭
    handleCancelAuth = () => {
        window.location.reload()
    }

    // 点击授权信息，查看授权状态
    authInfoClick = (app_id) => {
        this.setState({authInfoData: []})
        this.props.dispatch({
            type: 'setting_mpa/getSubAuthInfo',
            payload: {
                app_id: app_id
            },
            callback: (res) => {
                let data = res
                if (data.length && data.length>0) {
                    for (let [i, v] of data.entries()) {
                        v.key = (i+1)
                    }
                    this.setState({authInfoData: data})
                } else {
                }
                // console.log(data)
            }
        })
        this.setState({
            formVisible: true
        })
    }

    // 授权小程序
    addAuth = () => {
        window.open(config.mpaAuth, '_blank')
        this.setState({
            formVisible: false,
            authVisible: true
        })
    }

    // 点击支付配置
    addPayConfigure = (status, item) => {
        // 支付配置弹窗内显示小程序名称
        this.setState({
            payConfigureVisible: true,
            subAppRecord: item,
            subAppId: item.app_id
        })
    }

    // 选择支付配置
    getPayConfigureId = (key, value) => {
        // console.log(key, value)
        this.setState({
            editPayConfigureOption: value.props.children[1],
            editPayConfigureId: key
        })
    }

    render() {
        const {mpas} = this.props.setting_mpa
        // 小程序列表table
        const columns = [{
            title: '主体信息',
            dataIndex: 'principal_name',
            key: 'principal_name',
        }, {
            title: '小程序名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '授权时间',
            dataIndex: 'auth_at',
            key: 'auth_at',
        }, {
            title: '支付配置',
            dataIndex: 'has_pay_conf',
            key: 'has_pay_conf',
            render: (text, record) => {
                let btn = null
                if (record.status === 1) {
                    btn = <div className={styles.subConfigure} onClick={() =>this.addPayConfigure(text, record)}>{text===1?'已配置':'未配置'}</div>
                }
                return (
                    <div>
                        {btn}
                    </div>
                )
            },
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <span className={text===1?styles.pointGreen:styles.pointGray}>{text===1?'可用':'不可用'}</span>
            ),
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <div className={styles.operationBtn}>
                        <a href="javascript:;" onClick={() => this.authInfoClick(record.app_id)}>{record.status===1?"授权信息":"重新授权"}</a>
                        <Divider type="vertical" />
                        <a href="javascript:;" onClick={() => this.showConfirm(record.app_id)}>解除</a>
                    </div>
                )
            },
        }]

        // 授权信息列表
        const authInfoColumns = [
            {
                title: '序号',
                dataIndex: 'key',
            },{
                title: '授权内容',
                dataIndex: 'name',
                key: 'name',
            },{
                title: '授权状态',
                dataIndex: 'status',
                key: 'status',
                render: (text) => (
                    <span className={text===1?styles.pointGreen:styles.pointGray}>{text===1?'已授权':'未授权'}</span>
                ),
            },
        ]
        
        // 头部配置
        const action = (
            <div>
                <Button type="primary" onClick={this.addAuth}>授权小程序</Button>
                {/* <span className="hz-page-content-action-description">
                添加公众号（服务号类型）、小程序，主体信息须一致
                </span> */}
            </div>
        )

        return <DocumentTitle title="小程序授权">
            <Page>
                <Page.ContentHeader
                    title="小程序"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md"
                    showDescriptionIcon={false}
                    action={action}
                />
                <Table 
                    columns={columns} 
                    dataSource={mpas}
                    pagination={false} 
                    rowKey="id"
                />
                {/* 支付配置弹窗 */}
                <MpaPayConfigModel 
                    key={'pay'+this.state.subAppId}
                    subAppRecord={this.state.subAppRecord}
                    payConfigureVisible={this.state.payConfigureVisible}
                    subAppId={this.state.subAppId}
                    handleCancel={this.handleCancel}
                    {...this.props}
                />
                {/* 授权信息弹窗 */}
                <Modal visible={this.state.formVisible} title="授权信息"
                    onOk={this.addAuth} onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" onClick={this.addAuth}>重新授权</Button>]}
                >
                    <div>
                        <Table columns={authInfoColumns}
                            dataSource={this.state.authInfoData}
                            scroll={{ y: 400 }}
                            pagination={false}/>
                    </div>
                </Modal>
                {/* 授权小程序提示 */}
                <Modal visible={this.state.authVisible} title="提示"
                    onCancel={this.handleCancelAuth}
                    footer={[<Button key="back" onClick={this.addAuth}>
                    授权失败，重试
                    </Button>, <Button key="submit" type="primary" onClick={this.handleCancelAuth}>
                    已成功授权
                    </Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>请在新窗口中完成微信小程序授权</span>
                        <a href="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md" target="_blank" rel="noopener noreferrer">使用教程</a>
                    </div>
                </Modal>
            </Page>
        </DocumentTitle>
    }
}

