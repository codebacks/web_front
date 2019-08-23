import React, {Component} from 'react'
import {connect} from 'dva'
import {Row, Col, Form, Select, Input, Checkbox, Button, Table, Modal, Spin} from 'antd'
import Page from '@/components/business/Page'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'setting/common/config'
import {statusMap} from './config'
import SettingModal from './components/SettingModal'
import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option
const Search = Input.Search
const confirm = Modal.confirm

const {pageSizeOptions} = config

@connect(({base, loading, setting_app_whitelisting}) => ({
    base,
    setting_app_whitelisting,
    listLoading: loading.effects['setting_app_whitelisting/list'],
    checkLoading: loading.effects['setting_app_whitelisting/check'],
    allowLoading: loading.effects['setting_app_whitelisting/allow'],
}))
@documentTitleDecorator()
export default class AppWhiteListing extends Component {
    constructor(props) {
        super(props)
        this.state = {
            appRestriction: true,
            record: {},
            visible: false,
        }
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.getCheck()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getCheck = () => {
        this.props.dispatch({
            type: 'setting_app_whitelisting/check',
            payload: {},
            callback: (data) => {
                if(this._isMounted) {
                    this.setState({
                        appRestriction: !data
                    }, ()=> {
                        if(data) {
                            this.handleSearch()
                        }
                    })
                }
            }
        })
    }

    handleCheckedChange = (e) => {
        const checked = e.target.checked
        if (checked) {
            this.showConfirm()
        } else {
            this.setAppRestriction(1)
        }
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.setting_app_whitelisting.params}
        params[key] = val
        this.props.dispatch({
            type: 'setting_app_whitelisting/setParams',
            payload: params
        })
    }

    showConfirm = () => {
        confirm({
            title: '关闭应用限制',
            content: <dl>
                <dt className={styles.confirmTitle}>关闭应用限制会带来以下风险：</dt>
                <dd>1.安装不受限制的应用可能造成手机中毒</dd>
                <dd>2.安装应用数量过多会造成手机系统卡顿</dd>
            </dl>,
            okText: '继续关闭',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                this.setAppRestriction(0)
            },
            onCancel: () => {},
        })
    }

    setAppRestriction = (on) => {
        this.props.dispatch({
            type: 'setting_app_whitelisting/allow',
            payload: {
                on: on
            },
            callback: () => {
                this.setState({
                    appRestriction: !on
                })
                if(!!on) {
                    this.goPage(1)
                }
            }
        })
    }

    handleSearch = () => {
        const {appRestriction} = this.state
        if(appRestriction) {
            return
        }
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.setting_app_whitelisting.params}
        params.limit = size
        this.props.dispatch({
            type: 'setting_app_whitelisting/setParams',
            payload: params,
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'setting_app_whitelisting/list',
            payload: {page: page},
        })
    }

    handleShowSetting = (record) => {
        this.setState({
            record: record,
            visible: true
        })
    }

    handleCancelSetting = () => {
        this.setState({
            record: {},
            visible: false
        })
    }

    handleSettingOK = () => {
        this.handleCancelSetting()
        this.goPage()
    }

    getStatusOption = () => {
        let option = []
        statusMap.forEach((value, key) => {
            option.push(<Option key={key} value={key}>{value}</Option>)
        })
        return option
    }

    render() {
        const {params, list, current, total} = this.props.setting_app_whitelisting
        const {listLoading, checkLoading, allowLoading} = this.props
        const {appRestriction, visible, record} = this.state

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18}
        }

        const columns = [
            {
                title: '应用名称',
                dataIndex: 'app_name',
                className: styles.column,
                render: (text, record) => {
                    const {app_icon_url, app_name} = record
                    const url = `https://public.51zan.com/${app_icon_url}`
                    return <div className={styles.info}>
                        <img className={styles.icon} src={url} alt="icon" />
                        <span className={styles.name}>{app_name}</span>
                    </div>
                }
            },
            // {
            //     title: '版本号',
            //     dataIndex: 'app_version',
            //     className: styles.column,
            // },
            // {
            //     title: '比较类型',
            //     dataIndex: 'compare',
            //     className: styles.column,
            //     render: (compare) => {
            //         if (compare === -1) {
            //             return '以下版本'
            //         } else if (compare === 0) {
            //             return '相同版本'
            //         }
            //         else if (compare === 1) {
            //             return '以上版本'
            //         }
            //         else if (compare === 3) {
            //             return ''
            //         }
            //     }
            // },
            {
                title: '状态',
                dataIndex: 'status',
                className: styles.column,
                render: (status) => {
                    return statusMap.get(status)
                }
            },
            {
                title: '操作',
                dataIndex: 'operate',
                className: styles.column,
                render: (text, record) => {
                    return <span
                        className={styles.operate}
                        onClick={() => this.handleShowSetting(record)}
                    >设置</span>
                }
            },
        ]

        return (
            <Page>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E6%9B%B4%E5%A4%9A.md'
                    }}
                />
                <div className={styles.container}>
                    <Spin spinning={!!checkLoading || !!allowLoading}>
                        <div className={styles.allow}>
                            <Checkbox checked={appRestriction}
                                onChange={this.handleCheckedChange}
                            >关闭应用限制</Checkbox><span className={styles.tip}>关闭后，手机上安装应用将不受限制</span>
                        </div>
                    </Spin>
                    <Page.ContentAdvSearch multiple={false}>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="应用名称">
                                        <Search placeholder="请输入应用名称"
                                            maxLength={100}
                                            value={params.app_name}
                                            onChange={(e)=>{this.handleChange('app_name', e)}}
                                            onSearch={this.handleSearch}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem label="状态" {...formItemLayout}>
                                        <Select placeholder="全部状态"
                                            value={params.status}
                                            onChange={(e)=>{this.handleChange('status', e)}}
                                        >
                                            <Option value="">全部</Option>
                                            {this.getStatusOption()}
                                        </Select>
                                    </FormItem>
                                </Col>
                                <Col span={6}>
                                    <FormItem label="" {...formItemLayout}>
                                        <Button type="primary" onClick={this.handleSearch}>搜索</Button>
                                    </FormItem>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>
                    {
                        !appRestriction ? <div>
                            <p className={styles.service}>若需要白名单中没有的应用请联系客服</p>
                            <Table
                                size="middle"
                                loading={listLoading}
                                columns={columns}
                                dataSource={list}
                                rowKey={(record, index) => index}
                                pagination={
                                    list.length ? {
                                        size: 'middle',
                                        total: total,
                                        current: current,
                                        showQuickJumper: true,
                                        pageSizeOptions: pageSizeOptions,
                                        showTotal: total => `共${total}条`,
                                        pageSize: params.limit,
                                        showSizeChanger: true,
                                        onShowSizeChange: this.handleChangeSize,
                                        onChange: this.goPage,
                                    } : false
                                }
                            />
                        </div> : null
                    }
                </div>
                <SettingModal
                    visible={visible}
                    record={record}
                    onOk={this.handleSettingOK}
                    onCancel={this.handleCancelSetting}
                />
            </Page>
        )
    }
}
