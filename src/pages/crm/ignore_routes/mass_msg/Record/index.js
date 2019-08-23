import React, {Fragment} from 'react'
import {Form, Input, Button, Icon, Row, Col, Table, Pagination, Modal, Divider} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import config from 'crm/common/config'
import DateRange from "components/DateRange"
import Messages from 'crm/components/MassMsg/Messages'
import FriendsModal from 'crm/components/MassMsg/FriendsModal'
import commonStyles from '../common.scss'
import styles from './index.scss'

const FormItem = Form.Item
const confirm = Modal.confirm
const {pageSizeOptions, DateFormat, DateTimeFormat} = config

@connect(({loading}) => ({
    loading,
    taskLoading: loading.effects['crm_mass_msg_record/tasks'],
    groupLoading: loading.effects['crm_mass_msg_group/groupDetail']
}))
@Form.create()
export default class Record extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            friendsModal: false,
            messages: [],
            messagesModal: false,
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_record/resetParams'
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target){
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.crm_mass_msg_record.params}
        params[key] = val
        this.props.dispatch({
            type: 'crm_mass_msg_record/setParams',
            payload: {
                params: params,
            },
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_mass_msg_record/tasks',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_mass_msg_record.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_mass_msg_record/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleChangeDate = (key, startValue, endValue) => {
        let params = {...this.props.crm_mass_msg_record.params}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        params[key] = `${startValue},${endValue}`
        this.props.dispatch({
            type: 'crm_mass_msg_record/setParams',
            payload: {params: params}
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_record/resetParams',
        })
        this.refs.createTime.setDate(null, null)
        this.refs.executeTime.setDate(null, null)
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    };

    showConfirm = (record) => {
        let result = {}
        record.result.forEach((item) => {
            result[item.status] = item.num
        })
        confirm({
            title: `取消后将有${result['0']}条数据不会执行，是否确定要取消执行？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.cancelExecution(record.id)
            }
        })
    }

    cancelExecution = (id) => {
        this.props.dispatch({
            type: 'crm_mass_msg_record/cancelExecution',
            payload: {
                id: id
            },
            callback: () => {
                const {current} = this.props.crm_mass_msg_record
                this.goPage(current)
            }
        })
    }

    goToDetail = (record) => {
        router.push({
            pathname: `/crm/mass_msg/details/${record.id}`,
            state: {
                taskId: record.task_no,
                title: record.title,
                location: this.props.location
            }
        } )
    }

    handleShowMessages = (messages) => {
        this.setState({
            messages: messages,
            messagesModal: true
        })
    }

    handleHideMessages = () => {
        this.setState({
            messages: [],
            messagesModal: false
        })
    }

    handleShowFriendsDetail = (record) => {
        this.loadGroupDetail(record.group_id)
        this.setState({
            friendsModal: true,
            record: record
        })
    }

    handleHideFriendsDetail = () => {
        this.setState({
            friendsModal: false,
            record: {}
        })
    }

    loadGroupDetail = (id) => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/groupDetail',
            payload: {
                id: id
            },
            callback: (data) => {
                this.props.dispatch({
                    type: 'crm_mass_msg_group/setProperty',
                    payload: {
                        filterParams: data.params
                    }
                })
            }
        })
    }

    render() {
        const {
            params,
            tasks,
            total,
            current,
        } = this.props.crm_mass_msg_record

        const {friendsModal, record, messages, messagesModal} = this.state

        const {taskLoading, groupLoading} = this.props

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        const columns = [
            {
                title: '群发主题',
                dataIndex: 'title',
            },
            {
                title: '客户组',
                dataIndex: 'group.name',
            },
            {
                title: '群发客户数',
                dataIndex: 'num',
                render: (text, record, index)=> {
                    return record.task_no === this.state.record.task_no && groupLoading ? <Icon type="loading"/>
                        : <span className={commonStyles.stress} onClick={()=>{this.handleShowFriendsDetail(record)}}>{text}</span>
                }
            },
            {
                title: '消息数',
                dataIndex: 'messages',
                render: (text, record, index) => {
                    return <span className={commonStyles.stress} onClick={()=>{this.handleShowMessages(record.messages)}}>{record.messages.length}</span>
                }
            },
            {
                title: '发送',
                dataIndex: 'result',
                render: (text, record, index) => {
                    if(text.length){
                        let result = {}
                        text.forEach((item) => {
                            result[item.status] = item.num
                        })
                        return <div className={commonStyles.resultPre}>
                            <p>{`成功${result['1'] || 0}条`}</p>
                            <p>{`失败${result['-1'] || 0}条`}</p>
                            <p>{`执行中${result['2'] || 0}条`}</p>
                            <p>{`未执行${result['0'] || 0}条`}</p>
                            <p>{`取消${result['-2'] || 0}条`}</p>
                        </div>
                    }
                }
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                render: (text, record, index) => {
                    if (text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                }
            },
            {
                title: '创建人',
                dataIndex: 'created_by.nickname',
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (text, record, index) => {
                    return moment(text * 1000).format(DateTimeFormat)
                }
            },
            {
                title: '操作',
                dataIndex: '',
                render: (text, record, index) => {
                    let result = {}
                    record.result.forEach((item) => {
                        result[item.status] = item.num
                    })
                    return <div className={styles.operate}>
                        {result['0'] ?
                            <span>
                                <span className={styles.cancel} onClick={() => {
                                    this.showConfirm(record)
                                }}>取消</span>
                                <Divider type="vertical" />
                            </span>
                            : ''}
                        <span className={styles.detail} onClick={() => {
                            this.goToDetail(record)
                        }}>明细</span>
                    </div>
                }
            }
        ]

        const createTime = params.create_time.split(',')
        const executeTime = params.execute_time.split(',')

        return (
            <Fragment>
                <div className={commonStyles.searchWrap}>
                    <Form className="ant-advanced-search-form">
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="搜索："
                                    colon={false}>
                                    <Input
                                        placeholder="请输入群发主题"
                                        value={params.title}
                                        onChange={(e)=>{this.handleChange('title', e)}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="组名："
                                    colon={false}>
                                    <Input
                                        placeholder="请输入分组名称"
                                        value={params.group_name}
                                        onChange={(e)=>{this.handleChange('group_name', e)}}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={10} style={{marginLeft: '6px'}}>
                                <FormItem {...timeFormItemLayout}
                                    className={commonStyles.timeFormItem}
                                    label="创建时间："
                                    colon={false}
                                >
                                    <DateRange
                                        ref="createTime"
                                        {...this.props}
                                        maxToday={true}
                                        style={{width: '100%'}}
                                        startPlaceholder="创建时间"
                                        endPlaceholder="创建时间"
                                        startValue={createTime[0] ? moment(createTime[0], DateFormat) : ''}
                                        endValue={createTime[1] ? moment(createTime[1], DateFormat) : ''}
                                        onChange={(startValue, endValue)=>{this.handleChangeDate('create_time', startValue, endValue)}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...timeFormItemLayout}
                                    className={commonStyles.timeFormItem}
                                     style={{marginLeft: '20px'}}
                                    label="执行时间："
                                    colon={false}
                                >
                                    <DateRange
                                        ref="executeTime"
                                        {...this.props}
                                        style={{width: '100%'}}
                                        startPlaceholder="执行时间"
                                        endPlaceholder="执行时间"
                                        startValue={executeTime[0] ? moment(executeTime[0], DateFormat) : ''}
                                        endValue={executeTime[1] ? moment(executeTime[1], DateFormat) : ''}
                                        onChange={(startValue, endValue)=>{this.handleChangeDate('execute_time', startValue, endValue)}}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={20}>
                            <Col span={8}>
                                <Col offset={8}>
                                    <div className={commonStyles.searchBtn}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetParams}>重置</Button>
                                    </div>
                                </Col>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <div className={commonStyles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={tasks}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={taskLoading}
                    />
                </div>
                {tasks.length ? (
                    <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共 ${total} 条`}
                        pageSize={params.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.goPage}
                    />
                ) : (
                    ''
                )}
                { friendsModal && !groupLoading ?
                    <FriendsModal {...this.props}
                        visible={friendsModal}
                        record={record}
                        onCancel={this.handleHideFriendsDetail}
                    /> : ''}
                <Messages visible={messagesModal}
                    messages={messages}
                    onCancel={this.handleHideMessages}
                />
            </Fragment>
        )
    }
}
