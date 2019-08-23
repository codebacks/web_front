import React, { Fragment } from 'react'
import { connect } from 'dva'
import { Table, Button, Form, Input, Select, Row, Col, Pagination, message } from 'antd'
import config from 'wx/common/config'
import moment from "moment/moment"
import _ from 'lodash'
import ClearModal from "./components/ClearModal"

import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions} = config

@connect(({ community_groupMemberRepeat, loading}) => ({
    community_groupMemberRepeat,
    queryLoading: loading.effects['community_groupMemberRepeat/query']
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: null,
            detailClearVisible: false,
        }
    }

    componentDidMount() {
        this.goPage(1)
    }
    componentWillUnmount() {}

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_groupMemberRepeat?.current
        }
        this.props.dispatch({
            type: 'community_groupMemberRepeat/query',
            payload: {page: page}
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_groupMemberRepeat.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_groupMemberRepeat/setProperty',
            payload: {params: params}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupMemberRepeat.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupMemberRepeat/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    resetSearch = () => {
        this.resetParams()
        this.goPage(1)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupMemberRepeat/resetParams',
        })
    }

    showDetailModel = (record) => {
        // 请求接口，并显示modal
        this.setState({
            detailClearVisible: true,
            record: record,
        }, () => {
            this.props.dispatch({
                type: 'community_groupMemberRepeat/queryDetail',
                payload: {chatroomname: record.chatroomname},
            })
        })
    }

    clearModalOnCancel = () => {
        this.setState({
            detailClearVisible: false,
            record: null,
        })
    }
    clearModalOnOk = () => {
        this.setState({
            detailClearVisible: false,
            record: null,
        }, () => {
            this.goPage(this.props.community_groupMemberRepeat.current || 1)
        })
    }


    render() {
        const { params, total, current, list } = this.props.community_groupMemberRepeat
        const { queryLoading } = this.props
        const { record, detailClearVisible } = this.state
        const formItemLayout = {labelCol: {span: 6}, wrapperCol: {span: 18},}
        const columns = [
            {
                title: '群名称',
                dataIndex: 'target.nickname',
                className: styles.groupName,
                render: (text, record) => {
                    return (
                        <span>{text ? text : record?.target?.display_name}</span>
                    )
                }
            },
            {
                title: '群主信息',
                dataIndex: 'target.owner',
                className: styles.groupOwner,
                render: (text, record) => {
                    return (
                        <>
                            <div className={styles.groupOwnerItem}>{text?.display_name || text?.nickname}</div>
                            <div className={styles.groupOwnerItem}>{text?.alias || text?.username}</div>
                            {
                                text?.is_staff ? (
                                    <div className={styles.groupOwnerItem}>
                                        <span className={styles.staffFlag}>员工号</span>
                                    </div>
                                ) : null
                            }
                        </>
                    )
                }
            },
            {
                title: '群成员数',
                dataIndex: 'target.member_count',
                className: styles.groupMemberCount,
            },
            {
                title: '员工号数',
                dataIndex: 'count',
                className: styles.staffCount,
                align: 'center',
                render: (text, record) => {
                    return (
                        <span className={styles.canEdit} onClick={() => this.showDetailModel(record)}>{text}</span>
                    )
                }
            },
        ]

        return (
            <Fragment>
                <div className={styles.groupMemberRepeat}>
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={7}>
                                <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                    <Input placeholder="输入群名称、群主昵称搜索"
                                        value={params.key}
                                        onChange={(e)=>{this.handleChange('key', e)}}/>
                                </FormItem>
                            </Col>
                            {/*<Col span={7}>
                                <FormItem {...formItemLayout} label="群主是否是员工：" colon={false}>
                                    <Select
                                        style={{width: '100%'}}
                                        value={params.status} onChange={(e)=>{this.handleChange('status', e)}}
                                        placeholder='全部'
                                    >
                                        <Option value="">全部</Option>
                                        <Option value={1}>是</Option>
                                        <Option value={2}>否</Option>
                                    </Select>
                                </FormItem>
                            </Col>*/}
                        </Row>
                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={7}>
                                <Col offset={1}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch} loading={queryLoading}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.statusWrap}>
                        <div className={styles.statusWrapLeft}>列表仅展示员工号数量>2的工作群</div>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            loading={queryLoading}
                            rowKey={(record, index) => index}
                            pagination={false}
                        />
                        {list.length ?
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
                            : ''}
                    </div>
                </div>
                <ClearModal
                    record={record}
                    visible={detailClearVisible}
                    onCancel={this.clearModalOnCancel}
                    onOk={this.clearModalOnOk}
                />
            </Fragment>
        )
    }
}
