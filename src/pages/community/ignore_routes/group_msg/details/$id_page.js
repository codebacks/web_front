import React from 'react'
import {
    Table,
    Pagination,
    Row,
    Col,
    Form,
    Input,
    Select,
    Button,
    Icon,
    Popover,
    Popconfirm,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'community/common/config'
import ContentHeader from 'business/ContentHeader'
import styles from '../index.less'
import _ from 'lodash'
import ExportExcel from 'components/business/ExportExcel'
import {getTabName, MsgContent} from "components/business/FullTypeMessage"

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateTimeFormat} = config

@connect(({base, community_automaticGroupMsg, loading}) => ({
    base,
    community_automaticGroupMsg,
    detailLoading: loading.effects['community_automaticGroupMsg/details'],
    taskIdLoading: loading.effects['community_automaticGroupMsg/exportTask'],

}))
@documentTitleDecorator({
    title: '群发详情',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.loadResult()
        this.goPage(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/resetDetailParams',
        })
    }

    loadResult = () => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'community_automaticGroupMsg/taskResult',
            payload: {id: id},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/details',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'community_automaticGroupMsg/details',
            payload: {
                id: id,
                page: page,
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_automaticGroupMsg.detailParams}
        params[key] = val
        this.props.dispatch({
            type: 'community_automaticGroupMsg/setProperty',
            payload: {
                detailParams: params,
            },
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.goPage(1)
    }

    reExecution = (id, historyId) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/reExecute',
            payload: {
                taskId: id,
                ids: [historyId],
            },
            callback: () => {
                const current = this.props.community_automaticGroupMsg.detailCurrent
                this.goPage(current)
            },
        })
    }

    getResultMap = (result) => {
        const resultMap = {
            '2': 0,
            '1': 0,
            '0': 0,
            '-1': 0,
            '-2': 0,
        }
        result.forEach((item) => {
            resultMap[item.status] = item.num
        })
        return resultMap
    }

    getExportTaskId = (callback) => {
        this.props.dispatch({
            type: 'community_automaticGroupMsg/exportTask',
            payload: {
                id: this.props.match.params.id,
            },
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
        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                key: 'target.nickname',
                className: `${styles.firstColumn} ${styles.nicknameColumn}`,
                render: (text, record, index) => {
                    return text ? text : record.target.display_name
                },
            },
            {
                title: '群主',
                dataIndex: 'target',
                key: 'owner',
                render: (text, record, index) => {
                    return _.get(text, 'owner.nickname', '')
                },
            },
            {
                title: '成员数',
                dataIndex: 'target.member_count',
                key: 'member_count',
                render: (text, record, idnex) => {
                    if(text) {
                        return text
                    }
                    return record.nickname
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={
                                    <p
                                        style={{
                                            'maxWidth': '240px',
                                            'wordBreak': 'break-all',
                                        }}
                                    >
                                        {content}
                                    </p>
                                }
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user',
                key: 'userNickname',
                render: (text, record, index) => {
                    return text.nickname
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    return text ? text : record.from.nickname
                },
            },
            {
                title: '回复类型',
                dataIndex: 'common_content',
                key: 'common_content_type',
                render: (text, record, index) => {
                    return getTabName(_.get(text, 'type'))
                },
            },
            {
                title: '消息内容',
                dataIndex: 'common_content',
                key: 'common_content_values',
                render: (text, record, index) => {
                    return (
                        <div className={styles.msgContent}>
                            <MsgContent
                                type={_.get(text, 'type')}
                                values={_.get(text, 'values')}
                            />
                        </div>
                    )
                },
            },
            {
                title: '是否@所有人',
                dataIndex: 'at_all',
                render: (text, record, index) => {
                    return _.get(record, 'common_content.at_all') ? '是' : '否'
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                render: (text, record, index) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
            {
                title: '执行状态',
                dataIndex: 'status',
                key: 'status',
                render: (text, record, index) => {
                    switch(text) {
                        case 0:
                            return <span className={`${styles.status} ${styles.notPull}`}>未执行</span>
                        case 2:
                            return <span className={`${styles.status} ${styles.doing}`}>执行中</span>
                        case 1:
                            return <span className={`${styles.status} ${styles.success}`}>执行成功</span>
                        case -1:
                            return <span className={`${styles.status} ${styles.error}`}> 执行失败</span>
                        case -2:
                            return <span className={`${styles.status} ${styles.notPull}`}>取消执行</span>
                        default:
                            return ''
                    }
                },
            },
            // {
            //     title: '反馈时间',
            //     dataIndex: 'feedback_time',
            //     key: 'feedback_time',
            //     render: (text, record, index) => {
            //         if(text) {
            //             return moment(text * 1000).format(DateTimeFormat)
            //         }
            //         return ''
            //     },
            // },
            {
                title: '失败原因',
                dataIndex: 'error',
                key: 'error',
                className: styles.messageColumn,
                render: (text, record, index) => {
                    if(record.error_code === 0) {
                        return '--'
                    }
                    if(record.status === -1) {
                        return (
                            <div className={styles.reExecution}>
                                <Popconfirm
                                    placement="topLeft"
                                    title={'你确定要重新执行此消息？'}
                                    icon={
                                        <Icon type="question-circle-o" style={{color: 'red'}}/>
                                    }
                                    onConfirm={() => {
                                        this.reExecution(this.props.match.params.id, record.id)
                                    }}
                                >
                                    <span>重新执行</span>
                                </Popconfirm>
                                <p>{record.error_message}</p>
                            </div>
                        )
                    }
                    return <p>{record.error_message}</p>
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const { detailLoading, taskIdLoading } = this.props
        const {detailParams, detailList, detailTotal, detailCurrent, result} = this.props.community_automaticGroupMsg

        const resultMap = this.getResultMap(result.result || [])

        return (
            <div className={styles.details}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群内群发',
                                path: '/community/group_msg',
                            },
                            {
                                name: '群发详情',
                            },
                        ]
                    }
                />
                <div className={styles.customSearchWrap}>
                    <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                        <Row gutter={20}>
                            <Col span={5}>
                                <FormItem
                                    {...formItemLayout}
                                    label="群名称："
                                    colon={false}
                                >
                                    <Input
                                        placeholder="群名称"
                                        value={detailParams.query}
                                        onChange={(e) => {
                                            this.handleChange('query', e)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={5}>
                                <FormItem
                                    {...formItemLayout}
                                    label="所属微信："
                                    colon={false}
                                >
                                    <Input
                                        placeholder="搜索微信备注、昵称、微信号"
                                        value={detailParams.wechat}
                                        onChange={(e) => {
                                            this.handleChange('wechat', e)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={5}>
                                <FormItem
                                    {...formItemLayout}
                                    label="发送状态："
                                    colon={false}
                                >
                                    <Select
                                        value={detailParams.status}
                                        onChange={(e) => {
                                            this.handleChange('status', e)
                                        }}
                                        style={{width: '100%'}}
                                    >
                                        <Option value="">全部状态</Option>
                                        <Option value="0">未执行</Option>
                                        <Option value="1">执行成功</Option>
                                        <Option value="-1">执行失败</Option>
                                        <Option value="2">执行中</Option>
                                        <Option value="-2">取消执行</Option>
                                    </Select>
                                </FormItem>
                            </Col>
                            <Col span={4}>
                                <FormItem
                                    {...formItemLayout}
                                    label=""
                                    colon={false}
                                >
                                    <Button
                                        className={styles.customSearchBtn}
                                        type="primary"
                                        icon="search"
                                        htmlType="submit"
                                    >
                                        搜索
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </div>
                {result ?
                    (
                        <div className={styles.tableHead}>
                            <div className={styles.tableHeadLeft}>
                                <div className={styles.taskNo}>
                                    指令编号：{result.task_no}
                                    <Popover
                                        content={
                                            <div
                                                className={styles.questionDesc}
                                            >
                                                由系统生成的群内群发标识；当执行异常时，可复制完整编号，发给客服，便于客服查错，更快找到问题
                                            </div>
                                        }
                                    >
                                        <Icon
                                            type="question-circle-o"
                                            className={styles.questionCircle}
                                        />
                                    </Popover>
                                </div>
                                <ExportExcel
                                    name={'群发消息-群发明细'}
                                    taskIdLoading={taskIdLoading}
                                    taskFunc={this.getExportTaskId}
                                    exportFunc={this.exportExcel}
                                />
                            </div>
                            <div className={styles.result}>
                                <div className={styles.item}>
                                    <h3>{resultMap['-1'] || 0}</h3>
                                    <p>失败</p>
                                </div>
                                <div className={styles.item}>
                                    <h3>{resultMap['1'] || 0}</h3>
                                    <p>成功</p>
                                </div>
                                <div className={styles.item}>
                                    <h3>{resultMap['0'] || 0}</h3>
                                    <p>未执行</p>
                                </div>
                                <div className={styles.item}>
                                    <h3>{resultMap['2'] || 0}</h3>
                                    <p>执行中</p>
                                </div>
                                <div className={styles.item}>
                                    <h3>{resultMap['-2'] || 0}</h3>
                                    <p>取消执行</p>
                                </div>
                            </div>
                        </div>
                    ) : ''
                }
                <div style={{clear: 'right'}}>
                    <Table
                        columns={columns}
                        dataSource={detailList}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={detailLoading}
                    />
                    {detailList.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={detailTotal}
                            current={detailCurrent}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={detailParams.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                    ) : ''
                    }
                </div>
            </div>
        )
    }
}
