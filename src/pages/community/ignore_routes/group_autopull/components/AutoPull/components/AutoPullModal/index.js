/**
 * @Description
 * @author XuMengPeng
 * @date 2018/11/7
 */
import React, { PureComponent } from 'react'
import {Col, Row, Button, Radio, Icon, Form, Input, InputNumber, Select, message, Modal, Switch, Checkbox, Table, Divider, Popover, Alert} from 'antd'
import { connect } from 'dva'
import moment from 'moment'
import styles from './index.less'
import Helper from 'wx/utils/helper'
import _ from 'lodash'
import EllipsisPopover from 'components/EllipsisPopover'
import DivideSelect from 'components/business/DivideSelect'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

@connect(({community_autoPullModal, loading}) => ({
    community_autoPullModal,
    updateItemLoading: loading.effects['community_autoPullModal/updateItem'],
    queryLoading: loading.effects['community_autoPullModal/query'],
}))
export default class AutoPullModal extends PureComponent{

    constructor(props) {
        super(props)
        this.state = {
            limitVisible: false,
            limitNum: 0, // 暂存行设置的拉人上限
            limitNumRecord: null, // 暂存设置拉人上限的行数据
            isShowOpenGroup: '', // ''：不选择，0：关闭，1：开启
        }
    }
    componentDidMount() {}

    componentWillUnmount() {}

    handleOk = () => {
        this.props.onOk()
        this.props.dispatch({type: 'community_autoPullModal/resetParams'})
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_autoPullModal.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_autoPullModal/setProperty',
            payload: {params}
        })
    }

    searchOk = () => {
        this.loadSearch()
    }
    paramsReset = () => {
        this.props.dispatch({type: 'community_autoPullModal/resetParams'})
        setTimeout(() => {
            this.loadSearch()
        }, 0)
    }

    loadSearch = () => {
        this.props.dispatch({
            type: 'community_autoPullModal/query',
            payload: {
                uin: this.props.record.uin
            }
        })
    }

    radioOpenChange = (e) => {
        const { value } = e.target
        this.setState({
            isShowOpenGroup: value
        })
    }
    rowSwitchChange = (value, record) => {
        this.props.dispatch({
            type: 'community_autoPullModal/updateItem',
            payload: {
                uin: this.props.record.uin,
                chatroom_name: record.target.username,
                body: {status: value ? '1': '0'},
            },
            callback: () => {
                this.loadSearch()
            }
        })
    }
    showLimitModal= (text, record) => {
        this.setState({
            limitVisible: true,
            limitNum: text,
            limitNumRecord: record
        })
    }

    limitHandleOk = () => {
        this.props.dispatch({
            type: 'community_autoPullModal/updateItem',
            payload: {
                uin: this.props.record.uin,
                chatroom_name: this.state.limitNumRecord.target.username,
                body: {maxmember: this.state.limitNum},
            },
            callback: (res) => {
                this.limitHandleCancel()
                this.loadSearch()
            }
        })
    }

    limitHandleCancel = () => {
        this.setState({
            limitVisible: false,
            limitNum: 0,
            limitNumRecord: null,
        })
    }

    limitChange = (value) => {
        this.setState({
            limitNum: value
        })
    }

    moveItem = (isUp, record) => {
        let ord = record.auto_group_setting.ord
        isUp ? ord++ : ord--
        this.props.dispatch({
            type: 'community_autoPullModal/updateItem',
            payload: {
                uin: this.props.record.uin,
                chatroom_name: record.target.username,
                body: {ord},
            },
            callback: () => {
                this.loadSearch()
            }
        })
    }

    renderSort = (record, index, statusLastIndex) => {
        const { auto_group_setting: { status } } = record
        let cont = ''
        if(!!status) {
            if(index === statusLastIndex && statusLastIndex === 0) { // 只有一个
                cont = <div>
                    <span style={{color: '#999'}}>上移</span>
                    <Divider type="vertical" />
                    <span style={{color: '#999'}}>下移</span>
                </div>
            } else if(index === 0 && statusLastIndex !== 0) { // 不止一个且第一个
                cont = <div>
                    <span style={{color: '#999'}}>上移</span>
                    <Divider type="vertical" />
                    <a onClick={() => this.moveItem(false, record)}>下移</a>
                </div>
            } else if(index === statusLastIndex && statusLastIndex !== 0) { // 不止一个且最后一个
                cont = <div>
                    <a onClick={() => this.moveItem(true, record)}>上移</a>
                    <Divider type="vertical" />
                    <span style={{color: '#999'}}>下移</span>
                </div>
            }else{ // 都可以上下移
                cont = <div>
                    <a onClick={() => this.moveItem(true, record)}>上移</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.moveItem(false, record)}>下移</a>
                </div>
            }
        }else{
            cont = <span>-</span>
        }
        return cont
    }

    render() {
        const { limitVisible, limitNum, isShowOpenGroup } = this.state
        const { visible, updateItemLoading, queryLoading } = this.props
        const { params, maxmember_options, list, } = this.props.community_autoPullModal
        let listTemp = _.cloneDeep(list), statusLastIndex = 0
        if(listTemp.length) {
            listTemp = list.filter((item) => {
                if (isShowOpenGroup === '') {
                    return item
                } else if (isShowOpenGroup === '1') {
                    return !!item.auto_group_setting.status
                } else if (isShowOpenGroup === '0') {
                    return !!(!item.auto_group_setting.status)
                }
            })
            statusLastIndex = _.findLastIndex(listTemp, (item) => !!item?.auto_group_setting?.status)
        }
        const formItemLayout = {labelCol: {span: 6}, wrapperCol: {span: 18}}
        const columns = [
            {
                align: 'center',
                title: '自动拉群',
                dataIndex: 'auto_group_setting.status',
                key: 'auto_group_setting.status',
                className: styles.tableSwitch,
                render: (text, record) => <Switch checked={!!text} checkedChildren="开" unCheckedChildren="关"  onChange={(value) => this.rowSwitchChange(value, record)}/>,
            },
            {
                align: 'center',
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: styles.tableGroupName,
                render: (text, record) => <EllipsisPopover lines={3} content={text || record.target.display_name || ''}/>
            },
            {
                title: '分组',
                dataIndex: 'target.grouping',
                key: 'target.grouping',
                className: styles.tableGroupDivide,
                render: (text, record) => {
                    return <span>{ text?.title ? text?.title : '未分组'}</span>
                },
            },
            {
                align: 'center',
                title: '群主',
                key: 'target.owner.nickname',
                dataIndex: 'target.owner.nickname',
                className: styles.tableGroupOwner,
            },
            {
                align: 'center',
                title: '成员数',
                key: 'target.member_count',
                dataIndex: 'target.member_count',
                className: styles.memberCount,
            },
            {
                align: 'center',
                title:  ()=>{
                    return (
                        <Popover
                            title="拉人上限设置："
                            content={<div>群自动拉人上限，默认为 500 人，最多为 500 人，当实际群成员人数超过拉人上限后，<br/>将不再往此群拉人，而往下一个已开启“自动拉群”的群拉人</div>}
                        >
                            拉人上限 <Icon type="question-circle" style={{color: '#4391FF'}}/>
                        </Popover>
                    )
                },
                key: 'auto_group_setting.maxmember',
                dataIndex: 'auto_group_setting.maxmember',
                className: styles.tableGroupLimit,
                render: (text, record) => (
                    <span onClick={() => this.showLimitModal(text, record)}>
                        <a href="javascript:;">{text}</a>
                    </span>
                )
            },
            {
                align: 'center',
                title: '排序',
                key: 'auto_group_setting.ord',
                dataIndex: 'auto_group_setting.ord',
                className: styles.tableSort,
                render: (text, record, index) => this.renderSort(record, index, statusLastIndex),
            },
            {
                align: 'center',
                title: '备注',
                key: 'target.remark',
                dataIndex: 'target.remark',
                className: styles.tableRemark,
                render: (text, record) => <span>{text ? text: '无'}</span>
            },
            {
                title: '可用状态',
                key: 'enable_status',
                dataIndex: 'enable_status',
                className: styles.enableStatus,
                render: (text, record) => {
                    return (record?.target?.member_count < record?.auto_group_setting?.maxmember) ? '可用'
                        : <div style={{color: '#f00'}}>不可用<br/>成员数已达拉人上限</div>
                }
            },
        ]
        return (
            <div>
                <Modal
                    title="自动拉群"
                    width={1000}
                    destroyOnClose={true}
                    visible={visible}
                    okButtonProps={{loading: queryLoading}}
                    className={styles.autoPullModalWrapper}
                    onOk={this.handleOk}
                    onCancel={this.handleOk}
                    destroyOnClose={true}
                >
                    <Alert
                        showIcon
                        type="info"
                        message="开启自动拉群，微信号将根据启用状态顺序拉人进群，如配置列表中该好友已在开启的任意一个群中，将不会再拉入其他群"
                    />
                    <div className={styles.type}>
                        {
                            params?.type === 1 ? '新好友拉群' : params?.type === 2 ? `暗号：${params?.keyword}` : null
                        }
                    </div>
                    <div className={styles.listWrapper}>
                        <div className={styles.searchBar}>
                            <Row gutter={20}>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                        <Input
                                            value={params.query}
                                            placeholder="输入群名称、群备注关键词搜索"
                                            onChange={(e) => this.handleChange('query', e)}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="分组：" colon={false}>
                                        <DivideSelect
                                            placeholder='全部分组'
                                            selectedId={params.grouping_id}
                                            data={this.props.community_autoPull?.groupDivideOptionsHasAll}
                                            onChange={(e) => {this.handleChange('grouping_id', e)}}
                                        />
                                    </FormItem>
                                </Col>
                                <Col span={8}>
                                    <FormItem {...formItemLayout} label="可用状态：" colon={false}>
                                        <Select
                                            style={{width: '100%'}}
                                            value={params.status}
                                            onChange={(e)=>{this.handleChange('status', e)}}
                                            placeholder='全部'
                                        >
                                            <Option value="">全部</Option>
                                            <Option value={1}>可用</Option>
                                            <Option value={0}>不可用</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row className={styles.searchBtn} gutter={20}>
                                <Col span={7}>
                                    <Col offset={1}>
                                        <Button type="primary" icon="search" onClick={this.searchOk} loading={queryLoading}>搜索</Button>
                                        <Button onClick={this.paramsReset}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                            <div style={{marginTop: 16, color: '#999'}}>群列表显示该微信号加入的工作群，如退出群或禁用工作群，都将自动从列表移出，不再显示</div>
                            <Row>
                                <Col>
                                    <RadioGroup value={isShowOpenGroup} onChange={this.radioOpenChange} className={styles.radioGroup}>
                                        <Radio value="">全部</Radio>
                                        <Radio value="1">只显示已开启的群</Radio>
                                        <Radio value="0">只显示未开启的群</Radio>
                                    </RadioGroup>
                                </Col>
                            </Row>
                        </div>
                        <div className={styles.list}>
                            <Table
                                columns={columns}
                                dataSource={listTemp}
                                rowKey={record => record.target.username}
                                size="middle"
                                pagination={false}
                                scroll={{y: 250}}
                                loading={queryLoading}
                            />
                        </div>
                    </div>
                </Modal>
                <Modal
                    title="自动拉群拉人上限"
                    visible={limitVisible}
                    onOk={this.limitHandleOk}
                    onCancel={this.limitHandleCancel}
                    className={styles.limitModal}
                    width={360}
                    mask={false}
                >
                    <div className={styles.inputWrapper}>
                        <div className="label">拉人上限：</div>
                        <InputNumber className={styles.inputNumber} value={limitNum} min={0} max={500}
                            step={50}
                            onChange={this.limitChange}
                        />
                    </div>
                    <div>拉人上限设置为0时将不指定上限，达到上限自动停止拉人，最大不能超过群拉人上限最大值500</div>
                </Modal>
            </div>
        )
    }
}
