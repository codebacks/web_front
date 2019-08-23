'use strict'

/**
 * 文件说明: 好友管理
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React, {Component, Fragment} from 'react'
import {Table, Popover, Divider, Pagination, Button, Tag, Badge, message, Modal, Icon} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import moment from 'moment'
import {safeJsonStringify} from 'utils'
import HistoryModal from 'components/business/HistoryModal'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import Profile from './components/Profile'
import Search from './components/Search'
import SetDivideModal from 'components/business/SetDivideModal'
import styles from './index.scss'

const {pageSizeOptions, DateTimeFormat, DefaultAvatar} = config

@connect(({ base, wx_friends, wx_messages, messages, loading }) => ({
    base, wx_friends, wx_messages, messages,
    friendLoading: loading.effects['wx_friends/list'],
    checkMassLoading: loading.effects['wx_friends/checkMass'],
}))
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false,
            profileVisible: false,
            record: {},
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.goPage(1)
        this.props.dispatch({type: 'wx_friends/getDivideOptions'})
    }

    componentWillUnmount() {
        this._isMounted = false
    }


    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_friends/list',
            payload: {page: page}
        })
    };

    handleShowProfile = (record) => {
        this.setState({
            profileVisible: true,
            record: record
        })
    }

    handleHideProfile = () => {
        this.setState({
            profileVisible: false,
            record: {}
        })
    }

    handleShowHistory = (record) => {
        this.setState({
            historyVisible: true,
            record: record
        })
    }

    handleHideHistory = () => {
        this.setState({
            historyVisible: false,
            record: {}
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_friends.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_friends/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    };

    handleTableChange = (pagination, filters, sorter) => {
        const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.wx_friends.params}
        let sort = []
        sort.push({
            field: field,
            order: order.replace('end', '')
        })
        params._sort = sort
        this.props.dispatch({
            type: 'wx_friends/list',
            payload: {
                params: params,
            },
        })
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {
                sortedInfo: sortedInfo,
            },
        })
    }

    toCreateMass = () => {
        const {searchParams = {}} = this.props.wx_friends

        this.props.dispatch({
            type: 'wx_friends/checkMass',
            callback: (data) => {
                if(data.no_function_limit) { // 无限制
                    router.push({
                        pathname: '/wx/friends/create_mass',
                        search: `searchParams=${encodeURIComponent(safeJsonStringify(searchParams))}`,
                    })
                }else { // 有限制
                    const content = <>
                        <div style={{marginBottom: '10px', color: '#FFAA16'}}>为避免频繁群发骚扰客户，每个商家每日仅支持【1次】好友群发</div>
                        <div>今日剩余次数：{data.left > 0 ? data.left : 0}次</div>
                    </>
                    Modal.confirm({
                        title: '好友群发',
                        content: content,
                        icon: <Icon type="warning" style={{fontSize: '20px'}}/>,
                        onOk: () => {
                            router.push({
                                pathname: '/wx/friends/create_mass',
                                search: `searchParams=${encodeURIComponent(safeJsonStringify(searchParams))}`,
                            })
                        },
                        okButtonProps: {
                            disabled: !data.allow
                        },
                    })
                }
            },
        })
    }

    setDivideModalOk = (id, selectedRows) => {
        let set_list = selectedRows.map((item, index) => {
            return {[String(item?.from_uin)]: item?.wx_id}
        })
        this.props.dispatch({
            type: 'wx_friends/setDivide',
            payload: {
                id,
                body: {set_list}
            },
            callback: () => {
                message.success('设置分组成功！')
                setTimeout(() => {
                    this.goPage(1)
                }, 1000)
            }
        })
    }

    setDivide = (setTrue) => {
        const { selectedRows } = this.props.wx_friends
        if(!selectedRows.length) {
            message.warning('请先选择需要分组的好友!')
        }else{
            setTrue()
        }
    }

    render() {
        const {
            params, list, total, current,
            selectedRowKeys, selectedRows, divideOptions,
        } = this.props.wx_friends
        const {friendLoading, checkMassLoading=false} = this.props
        const {profileVisible, record, historyVisible} = this.state

        let sortedInfo = this.props.wx_friends.sortedInfo || {}

        const columns = [
            {
                title: '头像',
                dataIndex: 'wechat.head_img_url',
                className: `${styles.avatarColumn}`,
                render: (text) => {
                    return <img src={Helper.getWxThumb(text || '')} className={styles.avatar}
                        onError={(e) => {e.target.src = DefaultAvatar}}
                        rel="noreferrer"
                        alt=""/>
                }
            },
            {
                title: '微信备注',
                dataIndex: 'wechat_remark',
                className: styles.column,
            },
            {
                title: '微信昵称',
                className: styles.column,
                dataIndex: 'wechat_nickname',
                render: (text) => {
                    return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
                }
            },
            {
                title: '微信号',
                dataIndex: 'wechat_id',
                className: styles.column,
            },
            {
                title: '分组',
                dataIndex: 'group',
                key: 'group',
                className: styles.divide,
                render: (text, record) => {
                    return <span>{ text ? text : '未分组'}</span>
                },
            },
            {
                title: '标签',
                dataIndex: 'tags',
                className: styles.column,
                render: (tags) => {
                    if(Array.isArray(tags) && tags.length) {
                        return <div className={styles.tags}>
                            {
                                tags.map((tag, idx) => {
                                    return <Tag key={idx} color="blue" className={styles.tag}>{tag}</Tag>
                                })
                            }
                        </div>
                    }
                },
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.user && record.user.departments){
                        let departments = record.user.departments
                        let content = ''
                        if(departments && departments.length){
                            content = departments.map((item)=>{
                                return item.name
                            }).join('，')
                            return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                }
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
                className: styles.column,
                render: (text, record, index) => {
                    if(record.user){
                        return record.user.nickname
                    }
                }
            },
            {
                title: '所属微信',
                dataIndex: 'service_wechat.remark',
                className: styles.column,
                render: (remark, record) => {
                    return remark || (record.service_wechat && record.service_wechat.nickname)
                }
            },
            {
                title: '来源',
                dataIndex: 'source',
                className: styles.column,
                render: (text, record) => {
                    return Helper.getFriendSource(record.source)
                }
            },
            {
                title: '好友创建时间',
                dataIndex: 'create_time',
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'create_time' && sortedInfo.order,
                className: styles.createTimeColumn,
                render: (text, record) => {
                    if (record.create_time) {
                        return moment(record.create_time * 1000).format(DateTimeFormat)
                    } else {
                        return '未知'
                    }
                }
            },
            {
                title: '是否被删除',
                dataIndex: 'is_block',
                className: styles.column,
                render: (isBlock) => {
                    return isBlock ? '是' : '否'
                }
            },
            {
                title: '状态',
                dataIndex: 'status',
                className: styles.column,
                render: (text, record) => {
                    if (!record.is_delete) {
                        return <Badge status="success" text="正常"/>
                    }
                    if (record.is_delete) {
                        return <Badge status="default" text="已删除"/>
                    }
                }
            },
            {
                title: '操作',
                dataIndex: 'option',
                render: (text, record) => {
                    return (
                        <div className={styles.operation}>
                            <span onClick={() => {this.handleShowProfile(record)}}>详情</span>
                            {record.wechat && record.wechat.username ?
                                <Fragment>
                                    <Divider type="vertical"/>
                                    <span onClick={() => {
                                        this.handleShowHistory(record)
                                    }}>聊天记录</span>
                                </Fragment>
                                : null
                            }
                        </div>
                    )
                }
            }]
        const rowSelection = {
            columnWidth: 40,
            selectedRowKeys: selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.props.dispatch({
                    type: 'wx_friends/setProperty',
                    payload: {
                        selectedRowKeys: selectedRowKeys,
                        selectedRows: selectedRows
                    }
                })
            },
        }

        return (
            <div>
                <Search {...this.props} onSearch={this.handleSearch}/>
                <div className={styles.addition}>
                        满足过滤条件共 <strong>{total}</strong> 个客户
                    <Button
                        onClick={this.toCreateMass}
                        className={styles.createMass}
                        type={'primary'}
                        loading={checkMassLoading}
                    >
                            创建群发
                    </Button>
                    <SetDivideModal
                        renderBtn={(setTrue) => {
                            return (
                                <Button onClick={() => {this.setDivide(setTrue)}} style={{'marginLeft': 14}}>设置分组</Button>
                            )
                        }}
                        type='wechat'
                        selectedRows={selectedRows}
                        data={divideOptions}
                        onOk={this.setDivideModalOk}
                    />
                </div>
                <div style={{clear: 'both'}}>
                    <Table
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={list}
                        size="middle"
                        loading={friendLoading}
                        rowKey={(record, index) => index}
                        onChange={this.handleTableChange}
                        pagination={false}
                    />
                    {list.length ? <Pagination
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
                    /> : null}
                </div>
                {historyVisible ? <HistoryModal {...this.props}
                    visible={historyVisible}
                    record={record}
                    fromUin={record.from_uin}
                    toUsername={record.wechat && record.wechat.username}
                    onCancel={this.handleHideHistory}
                /> : null}
                {profileVisible ? <Profile {...this.props}
                    visible={profileVisible}
                    record={record}
                    onCancel={this.handleHideProfile}
                /> : null}
            </div>
        )
    }
}
