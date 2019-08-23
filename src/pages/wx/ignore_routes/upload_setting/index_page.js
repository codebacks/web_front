import React, {Component, Fragment} from 'react'
import {Row, Col, Form, Input, Select, Button, Table, Popover, message} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import DivideSelect from 'components/business/DivideSelect'
import BatchSetting from './components/BatchSetting'
import Setting from './components/Setting'
import config from 'wx/common/config'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DefaultAvatar} = config

@connect(({ base, wx_upload_setting, loading}) => ({
    base,
    wx_upload_setting,
    listLoading: loading.effects['wx_upload_setting/list'],
}))
@documentTitleDecorator()
export default class IndexPage extends Component {
    constructor(props) {
        super(props)
        this.state = {
            batchSettingVisible: false,
            settingVisible: false,
            settingType: '',
            record: {},
            checked: false,
        }
    }

    componentDidMount() {
        this.getWXDivideOptions()
        this.handleSearch()
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
    }

    getWXDivideOptions = () => {
        this.props.dispatch({
            type: 'wx_upload_setting/wxDivideOptions',
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_upload_setting.params}
        params[key] = val

        this.props.dispatch({
            type: 'wx_upload_setting/setProperty',
            payload: {
                params: params,
            },
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_upload_setting/list',
            payload: {page: page}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_upload_setting.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_upload_setting/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleBatchSetting = () => {
        const {selectedRowKeys} = this.props.wx_upload_setting
        if (!selectedRowKeys.length) {
            message.warn('请先选择微信号')
            return
        }
        this.handleShowBatchSetting()
    }

    handleShowBatchSetting = () => {
        this.setState({
            batchSettingVisible: true
        })
    }

    handleHideBatchSetting = () => {
        this.setState({
            batchSettingVisible: false
        })
    }

    handleBatchSettingOk = () => {
        this.handleHideBatchSetting()
        this.resetSelectedRowKeys()
        this.goPage()
    }

    handleSetting = (type, record, checked) => {
        this.setState({
            settingVisible: true,
            settingType: type,
            record: record,
            checked: checked,
        })
    }

    handleHideSetting = () => {
        this.setState({
            settingVisible: false
        })
    }

    handleSettingOk = (checked) => {
        this.handleHideSetting()
        const {settingType, record} = this.state
        const list = _.cloneDeep(this.props.wx_upload_setting.list)
        const index = list.findIndex((v) => {
            return record.uin === v.uin
        })
        if (index !== -1) {
            const origin = list[index]
            list[index].auto_upload_img = {
                ...origin.auto_upload_img,
                ...{
                    [settingType]: checked ? 1 : 0
                }
            }
            this.props.dispatch({
                type: 'wx_upload_setting/setProperty',
                payload: {
                    list: list
                }
            })
        }
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_upload_setting/resetParams',
        })
    }

    resetSelectedRowKeys = () => {
        this.props.dispatch({
            type: 'wx_upload_setting/setProperty',
            payload: {
                selectedRowKeys: []
            }
        })
    }

    resetSearch = () => {
        this.resetParams()
        this.resetSelectedRowKeys()
        setTimeout(()=>{
            this.handleSearch()
        }, 0)
    }

    render() {
        const {params, list, total, current, wxDivideOptionsHasAll, selectedRowKeys} =  this.props.wx_upload_setting
        const {listLoading} = this.props
        const {batchSettingVisible, settingVisible, settingType, record, checked} = this.state

        const columns = [
            {
                title: '微信号信息',
                dataIndex: 'wechat',
                className: styles.weChatColumn,
                render: (text, record) => {
                    return <div className={styles.weChatInfo}>
                        <img className={styles.avatar}
                            src={record.head_img_url}
                            onError={(e)=>{
                                e.target.src = DefaultAvatar
                            }}
                            alt="头像"
                        />
                        <div className={styles.info}>
                            <p>{record.nickname}</p>
                            <p>{record.mobile}</p>
                            <p>{record.alias || record.username}</p>
                        </div>
                    </div>
                }
            },
            {
                title: '微信号备注',
                dataIndex: 'remark',
                className: styles.remarkColumn
            },
            {
                title: '分组',
                dataIndex: 'group',
            },
            {
                title: '私聊自动上传',
                dataIndex: 'auto_upload_img.private_chat',
                render: (status, record) => {
                    return <span className={styles.stress} onClick={() => this.handleSetting('private_chat', record, status)}>
                        {status ? '开启' : '关闭'}
                    </span>
                }
            },
            {
                title: '群聊自动上传',
                dataIndex: 'auto_upload_img.room_chat',
                render: (status, record) => {
                    return <span className={styles.stress} onClick={() => this.handleSetting('room_chat', record, status)}>
                        {status ? '开启' : '关闭'}
                    </span>
                }
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                            title={null} trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                render: (nickname, record) => {
                    return nickname || record.user.username
                },
            },
        ]

        const rowSelection = {
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys) => {
                this.props.dispatch({
                    type: 'wx_upload_setting/setProperty',
                    payload: {
                        selectedRowKeys: selectedRowKeys,
                    }
                })
            },
        }


        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <Fragment>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Input placeholder="输入昵称、手机号、微信号、备注"
                                    value={params.query}
                                    maxLength={20}
                                    onChange={(e)=>{this.handleChange('query', e)}}
                                    onPressEnter={this.handleSearch}
                                />

                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value) => {
                                        this.handleChange('user_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="分组：" colon={false}>
                                <DivideSelect
                                    placeholder='全部分组'
                                    selectedId={params.group_id}
                                    data={wxDivideOptionsHasAll}
                                    onChange={(value) => {this.handleChange('group_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="私聊自动上传：" colon={false}>
                                <Select
                                    placeholder={'全部'}
                                    style={{width: '100%'}}
                                    value={params.private_chat}
                                    onChange={(e) => this.handleChange('private_chat', e)}
                                >
                                    <Option value={''}>全部</Option>
                                    <Option value={1}>开启</Option>
                                    <Option value={0}>关闭</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="群聊自动上传：" colon={false}>
                                <Select
                                    placeholder={'全部'}
                                    style={{width: '100%'}}
                                    value={params.room_chat}
                                    onChange={(e) => this.handleChange('room_chat', e)}
                                >
                                    <Option value={''}>全部</Option>
                                    <Option value={1}>开启</Option>
                                    <Option value={0}>关闭</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20} className={styles.searchBtn}>
                        <Col span={8}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>

                <div className={styles.operation}>
                    <Button type="primary" onClick={this.handleBatchSetting}>图片自动上传</Button>
                </div>

                <Table
                    className={styles.table}
                    columns={columns}
                    rowSelection={rowSelection}
                    dataSource={list}
                    loading={listLoading}
                    rowKey={record => record.uin}
                    pagination={list.length ? {
                        total: total,
                        current: current,
                        showQuickJumper: true,
                        showTotal: total => `共 ${total} 条`,
                        pageSize: params.limit,
                        showSizeChanger: true,
                        onChange: this.goPage,
                        onShowSizeChange: this.handleChangeSize,
                        pageSizeOptions: pageSizeOptions,
                    } : false}
                />

                <BatchSetting
                    visible={batchSettingVisible}
                    uins={selectedRowKeys}
                    onCancel={this.handleHideBatchSetting}
                    onOk={this.handleBatchSettingOk}
                />
                <Setting
                    visible={settingVisible}
                    type={settingType}
                    record={record}
                    checked={checked}
                    onCancel={this.handleHideSetting}
                    onOk={this.handleSettingOk}
                />
            </Fragment>
        )
    }
}
