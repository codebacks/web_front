/**
 **@time: 2018/8/6
 **@Description: 公众号授权
 **@author: sunlizhi
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Popover, Switch, Button, Icon, Modal, Table, Form, message,Divider } from 'antd'
import SubConfigModel from './components/SubConfigModel'
import PayConfigModel from './components/PayConfigModel'
import config from '@/pages/setting/config'
import styles from './index.less'
import Page from '@/components/business/Page'
import DocumentTitle from 'react-document-title'

const confirm = Modal.confirm

@connect(({ setting_subscription, base }) => ({
    setting_subscription,
    base,
}))

@Form.create()

export default class Index extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formVisible: false,
            authVisible: false,
            subConfigureVisible: false,
            payConfigureVisible: false,
            authInfo: {},
            xiaohongbaoTips: this.props.location.query.type === 'openAuthorization',
            blueprintTips: this.props.location.query.type === 'openBlueprintAuthorization',
            firstBinding: this.props.location.query.type === 'openFirstBindingAuthorization',
            distributor: this.props.location.query.type === 'openDistributorAuthorization',
            editPayConfigureOption: '',
            editPayConfigureId: -1,
            confirmLoading: false,
            subAppId: -1,
            subAppRecord: {},
            switchLoading: false, // 设为支付公众号滑块loading
            currentSubName: '', // 当前公众号
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
                    update_time: '',
                    pay_conf_id: -1,
                }
            ],
            // 上传的文件
            fileList: [{
                uid: '-1',
                name: '',
                status: 'done',
            }],
            // 授权信息
            authInfoData: []
        }
    }

    // 页面加载调用
    componentDidMount() {
        this.getData()
        this.getQnToken('document')
    }

    // 解除授权
    showConfirm(app_id) {
        confirm({
            title: '确认要解除吗？',
            content: '解除后，与公众号相关的功能将无法使用，是否确定解除？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'setting_subscription/subUnbind',
                    payload: {
                        app_id: app_id
                    },
                    callback: () => {
                        this.props.dispatch({
                            type: 'setting_subscription/deleteSub',
                            payload: {
                                app_id: app_id
                            }
                        })
                    }
                })
            },
            onCancel() { },
        })
    }

    // 获取公众号列表
    getData = (type) => {
        this.props.dispatch({
            type: 'setting_subscription/subData',
            payload: {},
        })
    }

    // 获取文件上传七牛的token
    getQnToken = (type) => {
        this.props.dispatch({
            type: 'setting_subscription/qiniuToken',
            payload: {
                type: type
            },
        })
    }

    // 模态弹窗取消（关闭）
    handleCancel = () => {
        this.setState({
            formVisible: false,
            subConfigureVisible: false,
            payConfigureVisible: false,
            xiaohongbaoTips: false,
            blueprintTips: false,
            firstBinding: false,
            distributor: false,
            authInfo: {}
        })
    }

    // 授权弹窗关闭
    handleCancelAuth = () => {
        window.location.reload()
    }

    // 点击授权信息，查看授权状态
    authInfoClick = (app_id, record) => {
        this.setState({ authInfoData: [] })
        this.props.dispatch({
            type: 'setting_subscription/getSubAuthInfo',
            payload: {
                app_id: app_id
            },
            callback: (res) => {
                let data = res
                if (data.length && data.length > 0) {
                    for (let [i, v] of data.entries()) {
                        v.key = (i + 1)
                    }
                    this.setState({ authInfoData: data })
                } else {
                }
                // console.log(data)
            }
        })
        this.setState({
            formVisible: true,
            authInfo: record
        })
    }

    // 授权公众号
    addAuth = (isForce) => {
        if (this.bandingStatus && isForce !== true) return
        console.log(config.mpAuth)
        window.open(config.mpAuth, '_blank')
        this.setState({
            formVisible: false,
            authVisible: true
        })
    }

    // 点击公众号配置
    addSubConfigure = (status, app_id) => {
        this.setState({
            subConfigureVisible: true,
            subAppId: app_id
        })
    }

    // 点击支付配置
    addPayConfigure = (status, item) => {
        // 支付配置弹窗内显示公众号名称
        this.setState({
            payConfigureVisible: true,
            subAppRecord: item,
            subAppId: item.app_id
        })
    }

    // 设置支付功能接口调用
    putPaySwitch = (app_id, has_wx_pay) => {
        this.setState({ switchLoading: true })
        this.props.dispatch({
            type: 'setting_subscription/putSubConfigure',
            payload: {
                app_id: app_id,
                has_wx_pay: has_wx_pay
            },
            callback: () => {
                // console.log(app_id)
                let subDataArr = this.props.setting_subscription.subData
                for (let v of subDataArr) {
                    if (has_wx_pay === 2) {
                        Object.assign(v, { has_wx_pay: 1 })
                    }
                    if (v.app_id === app_id) {
                        Object.assign(v, { has_wx_pay: has_wx_pay })
                        this.setState({ subData: subDataArr })
                    }
                }
                this.setState({ switchLoading: false })
            }
        })
    }

    // 设置支付功能滑块
    paymentFunctionSwitch = (checked, record) => {
        if (checked === false) {
            this.putPaySwitch(record.app_id, 1)
        } else {
            if (record.status === 1 && record.has_pay_conf === 1) {
                this.putPaySwitch(record.app_id, 2)
            } else {
                message.warning('请先设置公众号配置和支付配置！')
            }
        }
        // console.log(checked, app_id)
    }
    bandingStatus = false
    isBanding = (data) => {
        this.bandingStatus = Array.isArray(data) && data.length > 0
        return this.bandingStatus
    }
    render() {
        const { subData } = this.props.setting_subscription
        const isBanding = this.isBanding(subData)
        // 支付功能
        const paymentFunction = (
            <div>
               启用支付功能后，可参与发小红包、晒图红包等营销活动，<br />并从该公众号商户平台扣款
            </div>
        )
        // 公众号列表table
        const columns = [{
            title: '主体信息',
            dataIndex: 'principal_name',
            key: 'principal_name',
        }, {
            title: '公众号名称',
            dataIndex: 'name',
            key: 'name',
        }, {
            title: '授权时间',
            dataIndex: 'auth_at',
            key: 'auth_at',
        },
        // 隐藏公众号配置
        // {
        //     title: '公众号配置',
        //     dataIndex: 'has_auth',
        //     key: 'has_auth',
        //     render: (text, record) => {
        //         let btn = null
        //         if (record.status === 1) {
        //             btn = <div className={styles.subConfigure} onClick={() => this.addSubConfigure(text, record.app_id)}>{text===1?'已配置':'未配置'}</div>
        //         }
        //         return (
        //             <div>
        //                 {btn}
        //             </div>
        //         )
        //     },
        // },
        {
            title: '支付配置',
            dataIndex: 'has_pay_conf',
            key: 'has_pay_conf',
            render: (text, record) => {
                let btn = null
                if (record.status === 1) {
                    btn = <div className={styles.subConfigure} onClick={() => this.addPayConfigure(text, record)}>{text === 1 ? '已配置' : '未配置'}</div>
                }
                return (
                    <div>
                        {btn}
                    </div>
                )
            },
        }, {
            title: <span className={styles.paymentFunction}>
                <Popover placement="topLeft" content={paymentFunction}>
                    支付功能
                    <Icon type="question-circle-o" className={styles.icon} />
                </Popover>
            </span>,
            dataIndex: 'has_wx_pay',
            key: 'has_wx_pay',
            render: (text, record) => {
                let sw = null
                if (record.status === 1) {
                    sw = <Switch checkedChildren="开" unCheckedChildren="关" loading={this.state.switchLoading} defaultChecked={text === 2} checked={text === 2} onChange={(checked) => this.paymentFunctionSwitch(checked, record)} />
                }
                return (
                    <div>
                        {sw}
                    </div>
                )
            },
        }, {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (text) => (
                <span className={text === 1 ? styles.pointGreen : styles.pointGray}>{text === 1 ? '可用' : '不可用'}</span>
            ),
        }, {
            title: '操作',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <div className={styles.operationBtn}>
                        <a href="javascript:;" onClick={() => this.authInfoClick(record.app_id, record)}>{record.status === 1 ? "授权信息" : "重新授权"}</a>
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
                className: 'hz-table-column-width-80',
            }, {
                title: '授权内容',
                dataIndex: 'name',
                key: 'name',
                className: 'hz-table-column-width-140',
            }, {
                title: '授权状态',
                dataIndex: 'status',
                className: 'hz-table-column-width-120',
                key: 'status',
                render: (text) => (
                    <span className={text === 1 ? styles.pointGreen : styles.pointGray}>{text === 1 ? '已授权' : '未授权'}</span>
                ),
            },
        ]

        // const action = (
        //     <div>
        //         <Button type="primary" onClick={this.addAuth}>授权公众号</Button>
        //         <span className="hz-page-content-action-description">
        //             添加多个公众号（服务号类型）、小程序必须为同一个主体信息！
        //         </span>
        //     </div>
        // )

        const action = (
            <div>
                <Button type="primary" disabled={isBanding} onClick={this.addAuth}>授权公众号</Button>
                <span className="hz-page-content-action-description">
                目前只允许授权一个公众号，新增授权须先解除已授权的公众号
                    {/* {
                        isBanding? '目前只允许授权一个公众号，新增授权须先解除已授权的公众号':'添加公众号（服务号类型）、小程序，主体信息须一致'
                    } */}
                </span>
            </div>
        )

        return <DocumentTitle title="公众号授权">
            <Page>
                <Page.ContentHeader
                    title="公众号"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md"
                    showDescriptionIcon={false}
                    action={action}
                />
                <Table
                    columns={columns}
                    dataSource={subData}
                    pagination={false}
                    rowKey="id"
                />
                {/* 公众号配置弹窗 */}
                <SubConfigModel
                    key={'sub' + this.state.subAppId}
                    subConfigureVisible={this.state.subConfigureVisible}
                    subAppId={this.state.subAppId}
                    handleCancel={this.handleCancel}
                    {...this.props}
                />
                {/* 支付配置弹窗 */}
                <PayConfigModel
                    key={'pay' + this.state.subAppId}
                    subAppRecord={this.state.subAppRecord}
                    payConfigureVisible={this.state.payConfigureVisible}
                    subAppId={this.state.subAppId}
                    handleCancel={this.handleCancel}
                    {...this.props}
                />
                {/* 授权信息弹窗 */}
                <Modal visible={this.state.formVisible} title="授权信息"
                    onOk={this.addAuth} onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" disabled={isBanding && this.state.authInfo.status !== 1} onClick={() => { this.addAuth(true)}}>重新授权</Button>]}
                >
                    <div>
                        <Table columns={authInfoColumns}
                            dataSource={this.state.authInfoData}
                            scroll={{ y: 400 }}
                            pagination={false} />
                    </div>
                </Modal>
                {/* 授权公众号提示 */}
                <Modal visible={this.state.authVisible} title="提示"
                    onCancel={this.handleCancelAuth}
                    footer={[<Button key="back" onClick={this.addAuth}>
                        授权失败，重试
                    </Button>, <Button key="submit" type="primary" onClick={this.handleCancelAuth}>
                        已成功授权
                    </Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>请在新窗口中完成微信公众号授权</span>
                        <a href="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%8E%88%E6%9D%83.md" target="_blank" rel="noopener noreferrer">使用教程</a>
                    </div>
                </Modal>
                {/* 小红包提示 */}
                <Modal visible={this.state.xiaohongbaoTips} title="提示"
                    onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" onClick={this.handleCancel}>确定</Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>开通小红包功能，请先授权公众号，并完成公众号配置和支付配置，打开支付开关即可。</span>
                    </div>
                </Modal>
                {/* 晒图红包提示 */}
                <Modal visible={this.state.blueprintTips} title="提示"
                    onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" onClick={this.handleCancel}>确定</Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>使用晒图红包功能，请先授权公众号，并完成公众号配置和支付配置，打开支付开关即可。</span>
                    </div>
                </Modal>
                {/*首邦有礼提示 */}
                <Modal visible={this.state.firstBinding} title="提示"
                    onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" onClick={this.handleCancel}>确定</Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>使用首绑有礼功能，请先授权公众号，并完成公众号配置和支付配置，打开支付开关即可。</span>
                    </div>
                </Modal>
                {/*分销提示 */}
                <Modal visible={this.state.distributor} title="提示"
                    onCancel={this.handleCancel}
                    footer={[<Button key="submit" type="primary" onClick={this.handleCancel}>确定</Button>]}>
                    <div>
                        <span className={styles.subAuthTips}>使用分销功能，请先授权公众号，并完成公众号配置和支付配置，打开支付开关即可。</span>
                    </div>
                </Modal>
            </Page>
        </DocumentTitle>
    }
}

