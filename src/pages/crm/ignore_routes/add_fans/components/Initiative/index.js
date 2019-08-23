
/** @description 主动加粉
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import {Form, Select, Input, Button, Row, Col, Table, Divider, Popover, message, Badge} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import config from 'crm/common/config'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import Setting from '../Setting'
import {addedType} from "../../config"
import utils from '../../utils'
import styles from './index.scss'

const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const {pageSizeOptions, DefaultAvatar} = config


@connect(({base, loading, crm_add_fans_initiative}) => ({
    base,
    crm_add_fans_initiative,
    listLoading: loading.effects['crm_add_fans_initiative/list']
}))
export default class Initiative extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [],
            templateIds: [],
            uins: [],
            record: {},
            settingVisible: false,
            settingType: 0,
        }
        this._isMounted = false
    }

    componentDidMount() {
        this._isMounted = true
        this.handleSearch()
    }

    componentWillUnmount() {
        this._isMounted = false
        this.resetParams()
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.crm_add_fans_initiative.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
        }

        // if (key === 'type') { // 关闭
        //     if (val === -1) {
        //         params.enabled = 0
        //     } else {
        //         params.enabled = undefined
        //     }
        // }

        this.props.dispatch({
            type: 'crm_add_fans_initiative/setParams',
            payload: {
                params: params
            }
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_add_fans_initiative/list',
            payload: {page: page},
            callback: () => {
                if(this._isMounted) {
                    this.resetSelectedRowKeys()
                }
            }
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_add_fans_initiative.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_add_fans_initiative/setParams',
            payload: {params: params},
        })
        this.resetSelectedRowKeys()
        this.goPage(1)
    }

    onSelectRowChange = (selectedRowKeys) => {
        this.setState({
            selectedRowKeys: selectedRowKeys,
        })
    }

    resetSelectedRowKeys = () => {
        this.setState({
            selectedRowKeys: []
        })
    }

    handleSet = (type, record) => {
        if (type === 0) {
            // 单选
            this.handleSingleSet(type, record)
        } else if (type === 1) {
            // 批量
            this.handleBatchSet(type)
        }
    }

    handleSingleSet = (type, record) => {
        this.handleShowSetting(type, [], [], record)
    }

    handleBatchSet = (type) => {
        const {selectedRowKeys} = this.state
        if (!selectedRowKeys.length) {
            message.warning('请先选择需要配置的微信号')
            return
        }
        const templateIds = this.getTemplateIds(selectedRowKeys)
        this.handleShowSetting(type, selectedRowKeys, templateIds, {})
    }

    getTemplateIds = (selectedRowKeys) => {
        const {list} = this.props.crm_add_fans_initiative
        let templateIds = []
        list.forEach((v) => {
            if (selectedRowKeys.includes(v.uin)) {
                templateIds.push({
                    uin: v.uin,
                    templateId: v.template_id,
                })
            }
        })
        return templateIds
    }

    handleShowSetting = (type, uins, templateIds, record) => {
        this.setState({
            uins: uins,
            templateIds: templateIds,
            settingVisible: true,
            settingType: type,
            record: record
        })
    }

    handleSettingOk = () => {
        this.handleHideSetting()
        this.reload()
    }

    handleHideSetting = () => {
        this.setState({
            uins: [],
            templateIds: [],
            settingVisible: false,
            settingType: 0,
            record: {},
        })
    }

    reload = () => {
        const {current} = this.props.crm_add_fans_initiative
        this.goPage(current)
    }

    goToRecord = (uin) => {
        router.push({
            pathname: `/crm/add_fans/record/${uin}`
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'crm_add_fans_initiative/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
        }, 0)
    }

    render() {
        const {params, list, total, current} = this.props.crm_add_fans_initiative
        const {listLoading} = this.props
        const {selectedRowKeys, uins, templateIds,  record, settingVisible, settingType} = this.state

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectRowChange,
            getCheckboxProps: (record) => ({
                disabled: !record.is_active,
            }),
        }

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
                title: '备注',
                dataIndex: 'remark',
                className: styles.remarkColumn,
            },
            {
                title: '在线状态',
                dataIndex: 'im_online_status',
                render: (status) => {
                    if(status) {
                        return <Badge status="success" text="在线"/>
                    }
                    return <Badge status="default" text="离线"/>
                }
            },
            {
                title: '加粉类型',
                dataIndex: 'type',
                className: styles.typeColumn,
                render: (type, record) => {
                    if (record.enabled) {
                        const text = utils.getAddedTypeText(type)
                        return <div className={styles.type}>
                            <p>{text}</p>
                            <p>{record.template_title}
                                { record.template_enabled ? null : <span className={styles.disabled}>[已被禁用]</span> }
                            </p>
                        </div>
                    } else {
                        return '关闭'
                    }
                }
            },
            {
                title: '今日加粉成功数',
                dataIndex: 'today_success_count',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>}
                            title={null}
                            trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.userColumn,
            },
            {
                title: '操作',
                dataIndex: 'operation',
                className: styles.operationColumn,
                render: (text, record) => {
                    const isActive = record.is_active
                    return <div className={`${styles.operation} ${isActive ? styles.active : styles.inactive}`}>
                        <span onClick={isActive ? () => this.goToRecord(record.uin) : null}>加粉记录</span>
                        <Divider type="vertical"/>
                        <span onClick={isActive ? () => this.handleSet(0, record) : null}>加粉配置</span>
                    </div>
                }
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div className={styles.initiativeWrapper}>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8 }>
                            <FormItem {...formItemLayout}
                                label="微信号信息："
                                colon={false}
                            >
                                <Search
                                    placeholder="搜索微信昵称、微信号、手机号"
                                    value={params.keyword}
                                    onChange={(e)=>{this.handleChange('keyword', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="备注："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入备注信息"
                                    value={params.remark}
                                    onChange={(e)=>{this.handleChange('remark', e)}}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout}
                                label="加粉类型："
                                colon={false}
                            >
                                <Select placeholder="请选择"
                                    value={params.type}
                                    onChange={(e)=>{this.handleChange('type', e)}}
                                >
                                    <Option value="">全部</Option>
                                    {/*<Option value={-1}>关闭</Option>*/}
                                    {
                                        Object.keys(addedType).map((key, index) => {
                                            const {type, text} = addedType[key]
                                            return <Option key={index} value={type}>{text}</Option>
                                        })
                                    }
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row className={styles.searchBtn} gutter={20}>
                        <Col span={8}>
                            <Col offset={8}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>
                <div className={styles.addition}>
                    <div>
                        <Button type="primary"
                                onClick={()=>{this.handleSet(1)}}>
                            加粉配置
                        </Button>
                        <span className={styles.stress}>近期微信加大力度查封微信号，为避免被封号，建议近期减少使用此功能</span>
                    </div>
                    <div>未激活设备不支持此功能</div>
                </div>
                <Table
                    rowSelection={rowSelection}
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={listLoading}
                    rowKey={(record) => record.uin}
                    pagination={
                        list.length ? {
                            size: 'middle',
                            total: total,
                            current: current,
                            showQuickJumper: true,
                            pageSizeOptions: pageSizeOptions,
                            showTotal: total => `共${total}条记录`,
                            pageSize: params.limit,
                            showSizeChanger: true,
                            onShowSizeChange: this.handleChangeSize,
                            onChange: this.goPage,
                        } : false
                    }
                />
                {
                    settingVisible ? <Setting visible={settingVisible}
                        type={settingType}
                        uins={uins}
                        templateIds={templateIds}
                        record={record}
                        onOk={this.handleSettingOk}
                        onCancel={this.handleHideSetting}
                    /> : null
                }
            </div>
        )
    }
}
