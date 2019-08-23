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
    Popover,
    Icon,
} from 'antd'
import {connect} from "dva/index"
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'community/common/config'
import styles from '../index.less'
import EllipsisPopover from "components/EllipsisPopover"
import MsgContent from "components/business/FullTypeMessage/components/MsgContent"
import ContentHeader from 'business/ContentHeader'
import ExportExcel from 'components/business/ExportExcel'
import _ from "lodash"

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateTimeFormat} = config

@connect(({wx_massRecord, loading}) => ({
    wx_massRecord,
    detailLoading: loading.effects['wx_massRecord/details'],
    taskIdLoading: loading.effects['wx_massRecord/exportTask'],
}))
@documentTitleDecorator({
    title: '群发明细',
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
            type: 'wx_massRecord/resetDetailParams',
        })
    }

    loadResult = () => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'wx_massRecord/taskResult',
            payload: {id: id},
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'wx_massRecord/details',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    goPage = (page) => {
        const id = this.props.match.params.id
        this.props.dispatch({
            type: 'wx_massRecord/details',
            payload: {
                id: id,
                page: page,
            },
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.wx_massRecord.detailParams}

        params[key] = val
        this.props.dispatch({
            type: 'wx_massRecord/setProperty',
            payload: {
                detailParams: params,
            },
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        this.goPage(1)
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
            type: 'wx_massRecord/exportTask',
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
            type: 'wx_massRecord/exportExcel',
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
                title: '微信昵称',
                dataIndex: 'target.nickname',
            },
            {
                title: '微信号',
                dataIndex: 'target',
                key: 'user',
                render: (text, record) => {
                    return text.alias || text.username
                },
            },
            {
                title: '微信备注',
                dataIndex: 'target.remark_name',
            },
            {
                title: '客户姓名',
                dataIndex: 'customer.name',
                className: `${styles.firstColumn} ${styles.nicknameColumn}`,
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if (departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <EllipsisPopover
                                lines={1}
                                content={content}
                            />
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    return text ? text : record.from.nickname
                },
            },
            {
                title: '消息内容',
                dataIndex: 'message',
                key: 'message',
                render: (text, record, index) => {
                    return (
                        <MsgContent
                            type={_.get(record, 'common_content.type')}
                            values={_.get(record, 'common_content.values')}
                        />
                    )
                },
            },
            {
                title: '执行时间',
                dataIndex: 'execute_time',
                key: 'execute_time',
                render: (text, record, index) => {
                    if (text) {
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
                    switch (text) {
                        case 0:
                            return <span className={`${styles.status} ${styles.notPull}`}>未发送</span>
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
                    if (record.error_code === 0) {
                        return '--'
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
        const {
            detailParams,
            detailList,
            detailTotal,
            detailCurrent,
            result = {},
        } = this.props.wx_massRecord

        const resultMap = this.getResultMap(result.result || [])

        return (
            <div className={styles.details}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群发记录',
                                path: '/wx/mass_record',
                            },
                            {
                                name: '群发明细',
                            },
                        ]
                    }
                />
                <div className={styles.customSearchWrap}>
                    <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                        <Row gutter={20}>
                            <Col span={7}>
                                <FormItem
                                    {...formItemLayout}
                                    label="搜索："
                                    colon={false}
                                >
                                    <Input
                                        placeholder="搜索微信昵称/微信号/微信备注"
                                        value={detailParams.query}
                                        onChange={(e) => {
                                            this.handleChange('query', e)
                                        }}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={7}>
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
                                        <Option value="0">未发送</Option>
                                        <Option value="1">成功</Option>
                                        <Option value="-1">失败</Option>
                                        <Option value="2">执行中</Option>
                                        <Option value="-2">已取消</Option>
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
                                                由系统生成的群发标识；当执行异常时，可复制完整编号，发给客服，便于客服查错，更快找到问题
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
                                    name={'个人号-群发明细'}
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
                                    <p>未发送</p>
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
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={detailLoading}
                    />
                    {detailList.length
                        ? (
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
