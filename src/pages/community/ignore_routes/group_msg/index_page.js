import React, {PureComponent} from 'react'
import {
    Form,
    Input,
    Button,
    Row,
    Col,
    Table,
    Pagination,
    Modal,
    Icon,
} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import styles from './index.less'
import config from 'community/common/config'
import DateRange from "./components/DateRange"
import _ from 'lodash'
import {hot} from "react-hot-loader"
import MsgContentModal from "business/FullTypeMessage/components/MsgContentModal"
import ExportExcel from 'components/business/ExportExcel'

const FormItem = Form.Item
const confirm = Modal.confirm
const {pageSizeOptions, DateTimeFormat} = config

@hot(module)
@connect(({base, community_automaticGroupMsg, loading}) => ({
    base,
    community_automaticGroupMsg,
    tasksLoading: loading.effects['community_automaticGroupMsg/tasks'],
    taskIdLoading: loading.effects['community_automaticGroupMsg/exportTaskMsg'],
    checkMassLoading: loading.effects['community_automaticGroupMsg/checkMass'],
}))
@documentTitleDecorator()
@Form.create()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

    handleChange = (e) => {
        let {params} = this.props.community_automaticGroupMsg
        params.title = e.target.value
        this.props.dispatch({
            type: 'community_automaticGroupMsg/setParams',
            payload: {
                params: params,
            },
        })
    }

    goPage = page => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/tasks',
            payload: {page: page},
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/tasks',
            payload: {
                params: {
                    page: 1,
                    limit: size,
                },
            },
        })
    }

    resetParamsAndQuery = () => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/resetParamsAndQuery',
        })
    }

    showConfirm = (record, num) => {
        confirm({
            iconType: 'info-circle',
            title: '取消执行',
            content: `取消后将有${num}条数据不会执行，是否确定要取消执行？`,
            okText: '确定',
            cancelText: '取消',
            onOk: () => {
                this.cancelExecution(record.id)
            },
            onCancel: () => {
            },
        })
    }

    cancelExecution = (id) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/cancelled',
            payload: {
                id: id,
            },
            callback: () => {
                const {current} = this.props.community_automaticGroupMsg
                this.goPage(current)
            },
        })
    }

    goToDetail = (record) => {
        router.push(`/community/group_msg/details/${record.id}`)
    }

    goToCreate = () => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/checkMass',
            callback: (data) => {
                if(data.no_function_limit) { // 无限制
                    router.push('/community/group_msg/new_group_msg')
                }else{ // 有限制
                    const content = <>
                        <div style={{marginBottom: '10px', color: '#FFAA16'}}>为避免频繁群发骚扰客户，每个商家每日仅支持【1次】群内群发</div>
                        <div>今日剩余次数：{data.left > 0 ? data.left : 0}次</div>
                    </>
                    Modal.confirm({
                        title: '群发消息',
                        content: content,
                        icon: <Icon type="warning" style={{fontSize: '20px'}} />,
                        onOk: () => {
                            router.push('/community/group_msg/new_group_msg')
                        },
                        okButtonProps: {
                            disabled: !data.allow
                        },
                    })
                }
            },
        })
    }

    onDateChange = (value, name) => {
        const {params} = this.props.community_automaticGroupMsg
        params[name] = value
        this.props.dispatch({
            type: 'community_automaticGroupMsg/setParams',
            payload: {params: params},
        })
    }

    //导出数据
    getExportTaskId = (callback) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/exportTaskMsg',
            callback: (data) => {
                callback && callback(data)
            }
        })
    }
    exportExcel = (taskId, callback) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/exportExcel',
            payload: {
                taskId: taskId
            },
            callback: (res) => {
                callback && callback(res)
            }
        })
    }

    render() {
        const {
            params,
            total,
            current,
            tasks,
            taskIdLoading,
        } = this.props.community_automaticGroupMsg

        const {checkMassLoading=false} = this.props

        const formItemLayout = {
            labelCol: {span: 6},
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
                className: `${styles.firstColumn} ${styles.typeColumn}`,
            },
            {
                title: '微信群数量',
                dataIndex: 'num',
                className: styles.descColumn,
                align: 'center',
            },
            {
                title: '消息数',
                dataIndex: 'messages',
                className: styles.content,
                align: 'center',
                render: (text, record, index) => {
                    return (
                        <MsgContentModal
                            contents={text}
                            transformItem={(data) => data}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.stress}
                                        onClick={setTrue}
                                    >
                                        {text.length || 0}
                                    </span>
                                )
                            }}
                        />
                    )
                },
            },
            {
                title: '发送状态',
                dataIndex: 'result',
                render: (text, record, index) => {
                    const obj = {
                        '2': 0,
                        '1': 0,
                        '0': 0,
                        '-1': 0,
                        '-2': 0,
                    }
                    text.forEach((item) => {
                        obj[item.status] = item.num
                    })
                    return (
                        <div className={styles.resultPre}>
                            <p>{`成功${obj['1'] || 0}条`}</p>
                            <p>{`失败${obj['-1'] || 0}条`}</p>
                            <p>{`执行中${obj['2'] || 0}条`}</p>
                            <p>{`未执行${obj['0'] || 0}条`}</p>
                            <p>{`取消${obj['-2'] || 0}条`}</p>
                        </div>
                    )
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                render: (text, record, index) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '可执行时间段',
                dataIndex: 'time_from',
                render: (text, record) => {
                    if(text && record?.time_to) {
                        return `${text}-${record?.time_to}`
                    }else{
                        return '不限制'
                    }
                },
            },
            {
                title: '创建人',
                dataIndex: 'created_by',
                className: styles.countColumn,
                render: (text, record, index) => {
                    return _.get(text, 'nickname', '')
                },
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                render: (text, record, index) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '操作',
                dataIndex: '',
                render: (text, record, index) => {
                    const item = record.result.find((item) => {
                        if(item.status === 0) {
                            return true
                        }
                    }) || {num: 0}

                    return (
                        <div className={styles.operate}>
                            {item.num > 0 ? <span onClick={() => {
                                this.showConfirm(record, item.num)
                            }}>取消</span> : ''}
                            <span onClick={() => {
                                this.goToDetail(record)
                            }}>明细</span>
                        </div>
                    )
                },
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E5%8F%91%E6%B6%88%E6%81%AF.md',
                    }}
                />
                <div className={styles.automatedGroup}>
                    <div>
                        <div className={styles.searchWrap}>
                            <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                                <Row gutter={20}>
                                    <Col span={12}>
                                        <FormItem
                                            {...formItemLayout}
                                            label="搜索："
                                            colon={false}
                                        >
                                            <Input
                                                placeholder="请输入关键字"
                                                value={params.title}
                                                onChange={this.handleChange}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col span={12}>
                                        <FormItem
                                            {...timeFormItemLayout}
                                            label="创建时间："
                                            colon={false}
                                        >
                                            <DateRange
                                                style={{width: '100%'}}
                                                startDatePickerOptions={{
                                                    value: params.createStart,
                                                    onChange: (value) => {
                                                        this.onDateChange(value, 'createStart')
                                                    },
                                                }}
                                                endDatePickerOptions={{
                                                    value: params.createEnd,
                                                    onChange: (value) => {
                                                        this.onDateChange(value, 'createEnd')
                                                    },
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={20}>
                                    <Col span={12}>
                                        <FormItem
                                            {...timeFormItemLayout}
                                            label="执行时间："
                                            colon={false}
                                        >
                                            <DateRange
                                                style={{width: '100%'}}
                                                startDatePickerOptions={{
                                                    value: params.executeStart,
                                                    onChange: (value) => {
                                                        this.onDateChange(value, 'executeStart')
                                                    },
                                                }}
                                                endDatePickerOptions={{
                                                    value: params.executeEnd,
                                                    onChange: (value) => {
                                                        this.onDateChange(value, 'executeEnd')
                                                    },
                                                }}
                                            />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={20} className={styles.operateBtn}>
                                    <Col span={12}>
                                        <Col offset={6}>
                                            <Button
                                                type="primary"
                                                icon="search"
                                                htmlType="submit"
                                            >
                                                搜索
                                            </Button>
                                            <Button onClick={this.resetParamsAndQuery}>重置</Button>
                                        </Col>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <div className={styles.createMoment}>
                            <div className={styles.createMomentLeft}>
                                <Button
                                    icon="plus"
                                    type="primary"
                                    onClick={this.goToCreate}
                                    loading={checkMassLoading}
                                >
                                    新增群发
                                </Button>
                                <ExportExcel
                                    name={'群发消息-'}
                                    taskIdLoading={taskIdLoading}
                                    taskFunc={this.getExportTaskId}
                                    exportFunc={this.exportExcel}
                                    cls={styles.exportExcelCls}
                                />
                            </div>
                        </div>
                        <div className={styles.tableWrap}>
                            <Table
                                columns={columns}
                                dataSource={tasks}
                                size="middle"
                                rowKey={(record, index) => index}
                                pagination={false}
                                loading={this.props.tasksLoading}
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
                    </div>
                </div>
            </div>
        )
    }
}
