/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent} from 'react'
import {Form, Input, Button, Row, Col, Table, Pagination, Badge} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import EllipsisPopover from "components/EllipsisPopover"
import styles from './index.less'
import config from 'community/common/config'
import _ from 'lodash'
import {hot} from "react-hot-loader"

const FormItem = Form.Item
const {pageSizeOptions} = config

@hot(module)
@connect(({base, community_groupCodeGroupMembers, loading}) => ({
    base,
    community_groupCodeGroupMembers,
    queryLoading: loading.effects['community_groupCodeGroupMembers/query'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            key: '',
            offset: 0,
            current: 1,
            limit: 10,
            total: 0,
            _list: [],
            currentList: [],
            group_activity_id: '',
            row_id: '',
        }
    }

    componentDidMount() {
        const { query } = this.props.location
        if(query && query?.group_activity_id && query?.row_id) {
            this.setState({
                group_activity_id: query.group_activity_id,
                row_id: query.row_id,
            }, () => {
                this.props.dispatch({
                    type: 'community_groupCodeGroupMembers/getGroupMemberExtra',
                    payload: {
                        group_activity_id: query.group_activity_id,
                        row_id: query.row_id,
                    },
                })
                this.props.dispatch({
                    type: 'community_groupCodeGroupMembers/query',
                    payload: {
                        group_activity_id: query.group_activity_id,
                        row_id: query.row_id,
                    },
                    callback: (resData) => {
                        this.setState({
                            _list: resData,
                            total: resData.length,
                        }, () => {
                            this.goPage(1)
                        })
                    }
                })
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
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        this.setState({
            key: val,
        })
    }

    handleChangeSize = (current, size) => {
        this.setState({limit: size})
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        const { limit } = this.state
        this.setState({
            offset: limit * (page - 1),
            current: page,
        }, () => {
            this.setCurrentList()
        })
    }

    setCurrentList = () => {
        const { offset, limit, _list, key } = this.state
        let currentList = _.slice(_list, offset, offset+limit)
        if(key) {
            currentList = _list.filter((item) => {
                return item.nickname.toLowerCase().indexOf(key.toLowerCase()) >= 0 || item.remark_name.toLowerCase().indexOf(key.toLowerCase()) >= 0
            })
        }
        currentList = this.sortList(currentList)
        this.setState({
            currentList: currentList
        })
    }

    sortList = (list) => {
        const ownerList = list.filter((item) => {
            return item.is_owner
        })
        const adminList = list.filter((item) => {
            return item.is_admin
        })
        const otherMemberList = list.filter((item) => {
            return !item.is_owner && !item.is_admin
        })
        return _.concat(ownerList, adminList, otherMemberList)
    }

    resetParams = () => {
        this.setState({
            key: '',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 100)
    }

    goToPage = (type, record=null) => {
        switch (type) {
            case 'add':
                router.push({
                    pathname: `/community/group_code/add_activity`,
                    params: {
                        record: record
                    }
                })
                break
            case 'pageConfig':
                router.push({
                    pathname: `/community/group_code/page_config`,
                    query: {
                        id: record.id
                    }
                })
                break

        }
    }

    getRole = (record) => {
        const { is_admin, is_owner, is_uin } = record
        let txt = ''
        if(is_owner) {
            txt = '群主'
        } else if(is_admin) {
            txt = '管理员'
        } else{
            txt = '普通成员'
        }
        return txt
    }

    render() {
        const { key, limit, total, current, currentList, _list } = this.state
        const { extra } = this.props.community_groupCodeGroupMembers

        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 16}, }

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                className: styles.nickname,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                className: styles.uin,
                render: (text, record, index) => {
                    return <span>{text ? text : record?.username}</span>
                },
            },
            {
                title: '群昵称',
                dataIndex: 'remark_name',
                className: styles.groupNickname,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '群身份',
                dataIndex: 'groupIdent',
                className: styles.groupIdent,
                render: (text, record, index) => {
                    return <div>
                        <span>{this.getRole(record)}</span>
                    </div>
                },
            },
            {
                title: '是否是员工号',
                dataIndex: 'is_uin',
                className: styles.owner,
                align: 'center',
                render: (text, record, index) => {
                    return <span>{text === 1 ? '是': '否'}</span>
                },
            },
            /*{
                title: '操作',
                dataIndex: '',
                className: styles.edit,
                render: (text, record, index) => {
                    return (
                        <div>
                            {
                                record.is_mission_wechat === 1 ? <div className={`${styles.canEdit} ${styles.disabled}`}>设为任务号</div>
                                    : <div className={styles.canEdit} onClick={() => this.setTaskId(record)}>设为任务号</div>
                            }
                        </div>
                    )
                },
            },*/
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群活动',
                                path: '/community/group_code'
                            },
                            {
                                name: '群列表',
                                path: `/community/group_code/group_list?group_activity_id=${this.state.group_activity_id}`
                            },
                            {
                                name: '群成员管理',
                            },
                        ]
                    }
                />

                <div className={styles.groupList}>
                    <div className={styles.groupName}>
                        <span>群名称：</span>
                        <EllipsisPopover lines={1} content={extra?.group_nickname} popoverContentClassName={styles.ellipsisTxt}/>
                    </div>
                    <div className={styles.header}>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{extra?.total_in_cnt}</div>
                            <div>进群总人数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{extra?.actual_member_cnt}</div>
                            <div>群内实际人数</div>
                        </div>
                    </div>
                    <div className={styles.searchWrap}>
                        <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false} >
                                        <Input placeholder="输入群昵称、微信昵称" value={key} onChange={(e) => this.handleChange('key', e)} />
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
                            dataSource={currentList}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={this.props.queryLoading}
                        />
                    </div>
                    {_list.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                    ) : (
                        ''
                    )}
                </div>
            </div>
        )
    }
}
