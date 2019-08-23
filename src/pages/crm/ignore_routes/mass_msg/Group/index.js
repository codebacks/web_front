import React, {Fragment} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Divider} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import config from 'crm/common/config'
import DateRange from "components/DateRange"
import ParamsModal from 'crm/components/MassMsg/ParamsModal'
import commonStyles from '../common.scss'
import styles from './index.scss'

const FormItem = Form.Item
const {pageSizeOptions, DateFormat, DateTimeFormat} = config

@connect(({loading}) => ({
    loading,
    groupLoading: loading.effects['crm_mass_msg_group/list']
}))
@Form.create()
export default class Group extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            params: {},
            paramsModal: false
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if(e && e.target){
            val = e.target.value
        } else {
            val = e
        }
        let {params} = this.props.crm_mass_msg_group
        params[key] = val
        this.props.dispatch({
            type: 'crm_mass_msg_group/setParams',
            payload: {
                params: params,
            },
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/list',
            payload: {page: page},
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_mass_msg_group.params}
        params.limit = size
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.crm_mass_msg_group.params}
        startValue = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        endValue = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        params.last_send_time = `${startValue},${endValue}`
        this.props.dispatch({
            type: 'crm_mass_msg_group/setParams',
            payload: {params: params}
        })
    }

    handleShowParamsModal = (record) => {
        this.setState({
            params: {id: record.id},
            paramsModal: true
        })
    }

    handleHideParamsModal = () => {
        this.setState({
            params: {},
            paramsModal: false
        })
    }

    goToGroupCreate = () => {
        router.push('/crm/mass_msg/group_create')
    }

    goToCreate = (record) => {
        router.push({
            pathname: '/crm/mass_msg/create',
            query: {
                id: record.id,
                name: record.name,
            }
        })
    }

    goToGroupRecord = (record) => {
        router.push({
            pathname: `/crm/mass_msg/group_record/${record.id}`,
            query: {
                name: record.name,
                referrer: '/crm/mass_msg?type=1'
            }
        })
    }

    render() {
        const {
            params,
            total,
            current,
            list,
        } = this.props.crm_mass_msg_group

        const {groupLoading} = this.props

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        const {paramsModal} = this.state

        const columns = [
            {
                title: '组名',
                dataIndex: 'name',
            },
            {
                title: '最后群发时间',
                dataIndex: 'last_send_time',
                render: (text, record, index) => {
                    if(text){
                        return moment(text * 1000).format('YYYY-MM-DD HH:mm')
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
                    return moment(text * 1000).format('YYYY-MM-DD HH:mm')
                }
            },
            {
                title: '操作',
                dataIndex: 'params',
                render: (text, record, index) => {
                    return <div className={commonStyles.stress}>
                        <span onClick={() => {
                            this.goToCreate(record)
                        }}>新增群发</span>
                        <Divider type="vertical" />
                        <span onClick={() => {
                            this.goToGroupRecord(record)
                        }}>群发记录</span>
                        <Divider type="vertical" />
                        <span onClick={()=>{
                            this.handleShowParamsModal(record)
                        }}>筛选条件</span>
                    </div>
                }
            }
        ]

        const lastSendTime = params.last_send_time.split(',')

        return (
            <Fragment>
                <div className={commonStyles.searchWrap}>
                    <Form className="ant-advanced-search-form">
                        <Row gutter={20}>
                            <Col span={7}>
                                <FormItem {...formItemLayout} label="搜索："
                                    colon={false}>
                                    <Input
                                        placeholder="输入组名"
                                        value={params.name}
                                        onChange={(e)=>{this.handleChange('name', e)}}
                                        onPressEnter={this.handleSearch}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...timeFormItemLayout}
                                    className={commonStyles.timeFormItem}
                                    label="最后群发时间："
                                    colon={false}
                                >
                                    <DateRange
                                        ref="createTime"
                                        {...this.props}
                                        maxToday={true}
                                        style={{width: '100%'}}
                                        startPlaceholder="开始时间"
                                        endPlaceholder="结束时间"
                                        startValue={lastSendTime[0] ? moment(lastSendTime[0], DateFormat) : ''}
                                        endValue={lastSendTime[1] ? moment(lastSendTime[1], DateFormat) : ''}
                                        onChange={this.handleChangeDate}
                                    />
                                </FormItem>
                            </Col>
                            <Button type="primary" icon="search" className={styles.searchBtn} onClick={this.handleSearch}>搜索</Button>
                        </Row>
                    </Form>
                </div>
                <div className={styles.create}>
                    <Button icon="plus"
                        type="primary"
                        onClick={this.goToGroupCreate}>新增客户组
                    </Button>
                </div>
                <div className={commonStyles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={groupLoading}
                    />
                </div>
                {list.length ? (
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
                { paramsModal ?
                    <ParamsModal {...this.props}
                        visible={paramsModal}
                        params={this.state.params}
                        onCancel={this.handleHideParamsModal}
                    />
                    : ''}
            </Fragment>
        )
    }
}
