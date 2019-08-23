/** @description 关键词统计
 */
import React, {Component} from 'react'
import {Row, Col, Form, Input, Button, Table, Pagination, message, Alert, Popconfirm} from 'antd'
import {connect} from 'dva'
import moment from 'moment'
import DateRange from 'components/DateRange'
import AddKeyword from '../../components/AddKeyword'
import config from 'community/common/config'
import helper from 'utils/helper'
import styles from './index.less'

const FormItem = Form.Item
const Search = Input.Search
const {DateFormat, DateTimeFormat, pageSizeOptions} = config

@connect(({base, community_keyword_mgt, loading}) => ({
    base, community_keyword_mgt,
    listLoading: loading.effects['community_keyword_mgt/list'],
}))
export default class Management extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            sortedInfo: null
        }
    }

    componentDidMount() {
        this.goPage()
    }

    componentWillUnmount() {
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        if (key === 'key') {
            if (helper.isEmojiCharacter(val)) {
                val = helper.filterEmojiCharacter(val)
                message.warning('不支持输入表情符号')
            }
        }
        let params = {...this.props.community_keyword_mgt.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_keyword_mgt/setParams',
            payload: {params: params},
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.community_keyword_mgt.params}
        if (startValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.start_time = ''
        }
        if (endValue) {
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.end_time = ''
        }
        this.props.dispatch({
            type: 'community_keyword_mgt/setParams',
            payload: {params: params}
        })
    };

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_keyword_mgt/list',
            payload: {page: page},
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_keyword_mgt.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_keyword_mgt/list',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_keyword_mgt.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_keyword_mgt/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
            this.resetSortedInfo()
        }, 0)
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_keyword_mgt/resetParams',
        })
        this.keywordMgtTime.setDate(null, null)
    }


    remove = (id) => {
        this.props.dispatch({
            type: 'community_keyword_mgt/remove',
            payload: {
                id: id
            },
            callback: () => {
                message.success('删除成功')
                const {params: {limit}, total, current} = this.props.community_keyword_mgt
                const currentTotal = total - 1
                if (currentTotal <= limit) {
                    this.goPage(1)
                } else {
                    const rest = currentTotal % limit
                    if (rest) {
                        this.goPage()
                    } else {
                        this.goPage(current - 1)
                    }
                }
            }
        })
    }

    handleShowAddKeyword = () => {
        this.setState({
            visible: true
        })
    }

    handleAddKeywordOk = () => {
        this.handleHideAddKeyword()
        this.goPage()
    }

    handleHideAddKeyword = () => {
        this.setState({
            visible: false
        })
    }

    render() {
        const {params, list, total, current} = this.props.community_keyword_mgt
        const {listLoading} = this.props
        let {visible, sortedInfo} = this.state
        sortedInfo = sortedInfo || {}

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
                title: '关键词',
                dataIndex: 'keyword',
                className: styles.column,
            },
            {
                title: '创建人',
                dataIndex: 'operator_user_name',
                className: styles.column,
            },
            {
                title: '创建时间',
                dataIndex: 'create_at',
                className: styles.column,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'create_at' && sortedInfo.order,
                render: (timestamp) => {
                    if(timestamp) {
                        return moment(parseInt(timestamp, 10) * 1000).format(DateTimeFormat)
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                className: styles.column,
                render: (text, record) => {
                    return <Popconfirm placement="bottomRight" title="确定删除该关键词?"
                        onConfirm={()=>{this.remove(record.id)}}
                        okText="确定"
                        cancelText="取消">
                        <span className={styles.stress}>删除</span>
                    </Popconfirm>
                }
            }
        ]

        return (
            <div className={styles.wrapper}>
                <Alert className={styles.alert}
                    type="info"
                    showIcon
                    message="添加的关键词仅统计设为工作群的群聊数据，关键词总数量上限50个，统计间隔时间3小时，添加统计后执行转让群主操作会导致统计不准确，请尽量避免此操作"
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                <Search placeholder="输入关键词或创建人搜索" value={params.key}
                                    onChange={(e)=>{this.handleChange('key', e)}}
                                    onSearch={this.handleSearch}
                                    maxLength={20}
                                />
                            </FormItem>
                        </Col>
                        <Col span={12}>
                            <FormItem {...timeFormItemLayout} label="创建时间：" colon={false}>
                                <DateRange
                                    {...this.props}
                                    ref={(ref) => {
                                        this.keywordMgtTime = ref
                                    }}
                                    startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                    endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                    startPlaceholder="不限"
                                    endPlaceholder="不限"
                                    onChange={this.handleChangeDate}
                                    maxRangeDays={60}
                                    maxToday={true}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row  className={styles.operateBtn} gutter={20}>
                        <Col span={12}>
                            <Col offset={6}>
                                <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <Button type="primary"
                    icon="plus"
                    className={styles.add}
                    onClick={this.handleShowAddKeyword}
                >添加关键词</Button>
                <Table
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={listLoading}
                    rowKey={record => record.id}
                    pagination={false}
                    onChange={this.handleTableChange}
                />
                {
                    list.length ? <Pagination
                        className="ant-table-pagination"
                        total={total}
                        current={current}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={params.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.goPage}
                    /> : null
                }
                { visible ? <AddKeyword visible={visible}
                    onOk={this.handleAddKeywordOk}
                    onCancel={this.handleHideAddKeyword}
                /> : null }
            </div>
        )
    }
}
