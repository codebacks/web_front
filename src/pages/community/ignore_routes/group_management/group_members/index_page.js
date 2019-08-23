/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent, Fragment} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Badge, message} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'business/Page'
import EllipsisPopover from "components/EllipsisPopover"
import styles from './index.less'
import config from 'community/common/config'
import _ from 'lodash'
import {hot} from "react-hot-loader"

const FormItem = Form.Item
const {pageSizeOptions} = config

@hot(module)
@connect(({base, community_groupMembers, loading}) => ({
    base,
    community_groupMembers,
    queryLoading: loading.effects['community_groupMembers/query'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            uin: '',
            username: '',
            record: null,
        }
    }

    componentDidMount() {
        const { query, state } = this.props.location
        if(query && query?.uin && query?.username && state) {
            this.setState({
                uin: query.uin,
                username: query.username,
                record: state.record,
            }, () => {
                this.goPage(1)
            })
        }
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_groupMembers.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_groupMembers/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupMembers.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupMembers/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        const { uin, username } = this.state
        this.props.dispatch({
            type: 'community_groupMembers/query',
            payload: {
                uin: uin,
                username: username,
                page: page
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupMembers/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 100)
    }

    getRole = (record) => {
        const { is_admin, is_owner, is_tasker } = record
        let txt = ''
        if(is_owner) {
            txt = <div>
                <div>群主</div>
                {
                    is_tasker ?
                        <Fragment>
                            <div className={styles.tasker}><Badge status='processing'></Badge>任务号</div>
                            <div className={styles.dangerous}>存在风险</div>
                        </Fragment>
                        : null
                }
            </div>
        } else if(is_admin) {
            txt = <div>
                <div>管理员</div>
                { is_tasker ? <div className={styles.tasker}><Badge status='processing'></Badge>任务号</div>: null}
            </div>
        } else{
            txt = <div>
                <div>普通成员</div>
                { is_tasker ? <div className={styles.tasker}><Badge status='processing'></Badge>任务号</div>: null}
            </div>
        }
        return txt
    }

    render() {
        const { record } = this.state
        const { queryLoading } = this.props
        const { params, list, total, current } = this.props.community_groupMembers

        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 16}, }

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.nickname,
                render: (text, record, index) => {
                    return <span>{text ? text: record?.display_name}</span>
                },
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                className: styles.uin,
                render: (text, record, index) => {
                    return <span>{text ? text: record.username}</span>
                },
            },
            {
                title: '群昵称',
                dataIndex: 'remark_name',
                className: styles.groupNickname,
                render: (text, record, index) => {
                    return <span>{text ? text: '-'}</span>
                },
            },
            {
                title: '群身份',
                dataIndex: 'groupIdent',
                className: styles.groupIdent,
                render: (text, record, index) => {
                    return <div>
                        {this.getRole(record)}
                    </div>
                },
            },
            {
                title: '是否是员工号',
                dataIndex: 'is_staff',
                className: styles.isStaff,
                align: 'center',
                render: (text, record, index) => {
                    return <span>{text ? '是': '否'}</span>
                },
            },
        ]

        return (
            <Page>
                <Page.ContentHeader title='群成员管理'/>
                <div className={styles.groupMembers}>
                    <div className={styles.groupName}>
                        <span>群名称：</span>
                        <EllipsisPopover lines={1} content={record?.target?.nickname || record?.target?.display_name} popoverContentClassName={styles.ellipsisTxt}/>
                    </div>
                    <div className={styles.searchWrap}>
                        <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false} >
                                        <Input placeholder="输入群昵称、微信昵称" value={params.query} onChange={(e) => this.handleChange('query', e)} />
                                    </FormItem>
                                </Col>
                                <Col span={12} className={styles.operateBtn}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={queryLoading}
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
                    ) : ''}
                </div>
            </Page>
        )
    }
}
