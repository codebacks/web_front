import React from 'react'
import {Table, Popover, Pagination} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import ContentHeader from 'business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import createFaceHtml from 'components/Face/createFaceHtml'
import environmentConfig from 'wx/config'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import {commentStatus} from '../../config'
import styles from './index.scss'

const {pageSizeOptions, DateTimeFormat} = config

const timeColumn =  {
    title: '时间',
    dataIndex: 'create_time',
    // sorter: true,
    render: (text) => {
        if (text) {
            return moment(text * 1000).format(DateTimeFormat)
        }
        return ''
    }
}

@connect(({base, wx_moments_comment, loading}) => ({
    base,
    wx_moments_comment,
    taskLoading: loading.effects['wx_moments_comment/tasks'],
}))
@documentTitleDecorator({
    overrideTitle: (props)=>{
        const query = props.location.query
        if(query.is_add === '0') {
            return '延时评论记录'
        }
        return '追评记录'
    }
})
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
        }
    }

    componentDidMount() {
        this.handleSearch()
    }

    componentWillUnmount() {
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_moments_comment.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_moments_comment/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        const {id} = this.props.match.params
        this.props.dispatch({
            type: 'wx_moments_comment/tasks',
            payload: {
                id: id,
                params: {
                    is_add: this.getIsAdd()
                },
                page: page
            },
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    getIsAdd = () => {
        const isAdd = helper.getUrlParams('is_add')
        return isAdd ? parseInt(isAdd, 10) : 1
    }

    isSupport = (record) => {
        if (this.getIsAdd()) {
            return true
        }
        const thresholdTime = this.getThresholdTime()
        const executeTime = moment(record.execute_time * 1000)
        return executeTime.isAfter(thresholdTime)
    }

    getThresholdTime = () => {
        let thresholdTime = ''
        if (environmentConfig.isDevEnvironment) {
            thresholdTime = moment('2019-02-22 00:00')
        } else if (environmentConfig.isTestEnvironment) {
            thresholdTime = moment('2019-03-01 10:00')
        } else if (environmentConfig.isStagingEnvironment) {
            thresholdTime = moment('2019-03-12 11:00')
        } else {
            thresholdTime = moment('2019-03-12 20:30')
        }
        return thresholdTime
    }

    goToDetail = (record) => {
        const location = this.props.location
        router.push({
            pathname: `/wx/automatic/moments/comments/${this.props.match.params.id}/details/${record.id}`,
            query: {
                referrer: `${location.pathname}${location.search}`
            }
        })
    }

    render () {
        const columns = [
            {
                title: '内容',
                dataIndex: 'content',
                className: styles.descColumn,
                render: (text) => {
                    if (text) {
                        return <Popover placement="topLeft" content={createFaceHtml({tagName: 'pre', tagProps: {className: styles.wholeDesc}, values: text})}>
                            {createFaceHtml({tagName: 'pre', tagProps: {className: styles.descCut}, values: text})}
                        </Popover>
                    }
                }
            },
            timeColumn,
            {
                title: '执行数量',
                dataIndex: 'uin_count',
                render: (count, record) => {
                    if (this.isSupport(record)) {
                        return count
                    }
                    return '--'
                }
            },
            {
                title: '执行结果',
                dataIndex: 'result',
                render: (text, record) => {
                    if (this.isSupport(record)) {
                        let content = []
                        commentStatus.forEach((value, key) => {
                            content.push(<p key={key}>{`${value} ${text[key] || 0} 条`}</p>)
                        })
                        return <div className={styles.resultPre}>
                            {content}
                        </div>
                    }
                    return '--'
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    if(this.isSupport(record)) {
                        return <span className={styles.stress} onClick={()=>{this.goToDetail(record)}}>明细</span>
                    }
                    return '--'
                }
            },
        ]

        const {params, tasks, total, current} = this.props.wx_moments_comment
        const {taskLoading} = this.props

        const {query} = this.props.location
        const isAdd = query.is_add ? !!(parseInt(query.is_add, 10)) : true

        return (
            <div className={styles.content}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '发朋友圈',
                                path: '/wx/automatic/moments',
                            },
                            {
                                name: `${isAdd ? '追评' : '延时评论'}记录`,
                            },
                        ]
                    }
                />
                <div className={styles.tableWrap}>
                    <Table
                        columns={columns}
                        dataSource={tasks}
                        size="middle"
                        rowKey={(record, index) => index}
                        loading={taskLoading}
                        // onChange={this.handleTableChange}
                        pagination={false}
                    />
                    {tasks.length && params.is_add ? <Pagination
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
                    /> : null}
                </div>
            </div>
        )
    }
}