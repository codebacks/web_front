/** @description 重复好友
 * @author liyan
 * @date 2018/12/27
 */
import React, {Component} from 'react'
import {Form, Select, Input, Button, Icon, Row, Col, Table, Popover, Popconfirm, message, Modal} from 'antd'
import {connect} from 'dva'
import Link from 'umi/link'
import moment from 'moment'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'wx/common/config'
import Helper from 'wx/utils/helper'
import styles from './index.scss'

const FormItem = Form.Item
const Search = Input.Search
const Option = Select.Option

const {pageSizeOptions, DefaultAvatar, DateTimeFormat} = config

const duplicateRemark = '重复待删除'
const reasonType = 1 // 重复好友
const deleteStatus = {
    normal: {
        status: 0,
        text: '正常'
    },
    fail: {
        status: 3,
        text: '删除失败'
    },
    processing: {
        status: 1,
        text: '删除中'
    }
}

@connect(({ base, wx_friends_duplication, loading}) => ({
    base, wx_friends_duplication,
    friendsLoading: loading.effects['wx_friends_duplication/list'],
    friendsDetailLoading: loading.effects['wx_friends_duplication/friendsDetail'],
    addWhitelistLoading: loading.effects['wx_friends_duplication/addWhitelist'],
    tagLoading: loading.effects['wx_friends_duplication/tag'],
    removeLoading: loading.effects['wx_friends_duplication/remove'],
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            expandedRowKeys: [],
            currentLoad: '',
            currentDetail: '',
        }
    }

    componentDidMount() {
        this.handleSearch()
    }

    handleChange = (key, e) => {
        let val = ''
        if(e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.wx_friends_duplication.params}
        params[key] = val
        this.props.dispatch({
            type: 'wx_friends_duplication/setParams',
            payload: {
                params: params
            }
        })
    }

    handleSearch = () => {
        this.goPage(1)
    }

    clearFriendsDetail = () => {
        this.props.dispatch({
            type: 'wx_friends_duplication/setProperty',
            payload: {
                friendsDetail: {}
            },
        })
    }

    clearExpandedRowKeys = () => {
        this.setState({
            expandedRowKeys: []
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_friends_duplication/list',
            payload: {page: page},
            callback: () => {
                this.clearFriendsDetail()
                this.clearExpandedRowKeys()
            }
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_friends_duplication.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_friends_duplication/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleExpand = (expanded, record) => {
        const username = record.username
        let expandedRowKeys = [...this.state.expandedRowKeys]
        let index = expandedRowKeys.findIndex((v) => {
            return v === username
        })
        if (expanded) {
            if(index === -1) {
                expandedRowKeys.push(username)
            }
            this.loadFriendsDetail(username)
        } else {
            if(index !== -1) {
                expandedRowKeys.splice(index, 1)
            }
        }
        this.setState({
            expandedRowKeys: expandedRowKeys
        })
    }

    loadFriendsDetail = (username, callback) => {
        this.setState({currentLoad: username})
        this.props.dispatch({
            type: 'wx_friends_duplication/friendsDetail',
            payload: {username: username},
            callback: () => {
                callback && callback()
            }
        })
    }

    handleAddWhitelist = (username) => {
        const body = {
            wechat_id: username
        }
        this.props.dispatch({
            type: 'wx_friends_duplication/addWhitelist',
            payload: {
                body: body
            },
            callback: () => {
                message.success('加入成功', 1, () => {
                    const {params, total, current} = this.props.wx_friends_duplication
                    const limit = params.limit
                    if (total - 1 > limit * current) {
                        this.goPage(current)
                    } else {
                        this.goPage(current -1)
                    }
                })
            }
        })
    }

    handleTag = (record, parentRecord) => {
        this.props.dispatch({
            type: 'wx_friends_duplication/tag',
            payload: {
                uin: record.uin,
                username: parentRecord.username
            },
            callback: () => {
                let messageText = ''
                if (this.isDuplicate(record.friend_remark)) {
                    messageText = '取消标识成功'
                } else {
                    messageText = '标识成功'
                }
                message.success(message)
            }
        })
    }

    handleDeleteFriend = (record, parentRecord) => {
        this.setState({
            currentDetail: `${record.uin}${parentRecord.username}`
        })
        this.props.dispatch({
            type: 'wx_friends_duplication/remove',
            payload: {
                uin: record.uin,
                username: parentRecord.username,
                reason: reasonType
            },
            callback: (msg) => {
                if (msg) {
                    this.info(msg)
                } else {
                    this.updateFriendsDetail(parentRecord.username, record.uin)
                }
            }
        })
    }

    info = (text) => {
        Modal.info({
            title: '提示',
            content: (
                <div>{text}</div>
            ),
            onOk: () => {},
        })
    }

    updateFriendsDetail = (username, uin) => {
        let friendsDetail = {...this.props.wx_friends_duplication.friendsDetail}
        let item = [...friendsDetail[username]]
        const index = item.findIndex((v) => {
            return v.uin === uin
        })
        if(index !== -1) {
            item[index].is_deleting = 1
        }
        friendsDetail[username] = item
        console.log(friendsDetail)
        this.props.dispatch({
            type: 'wx_friends_duplication/setProperty',
            payload: {
                friendsDetail: friendsDetail
            }
        })
    }

    isDuplicate= (remark) => {
        return remark.indexOf(duplicateRemark) !== -1
    }

    getStatusText = (status) => {
        const keys = Object.keys(deleteStatus)
        const key = keys.find((k) => {
            return deleteStatus[k].status === status
        })
        if (key) {
            return deleteStatus[key].text
        }
        return ''
    }

    render() {
        const {params, list, total, current, friendsDetail} = this.props.wx_friends_duplication
        const {friendsLoading, friendsDetailLoading, addWhitelistLoading, removeLoading} = this.props
        const {expandedRowKeys, currentLoad, currentDetail} = this.state

        const columns = [
            {
                title: '头像',
                dataIndex: 'head_image',
                render: (text) => {
                    return <img src={Helper.getWxThumb(text)} className={styles.avatar}
                        onError={(e) => {e.target.src = DefaultAvatar}}
                        rel="noreferrer"
                        alt=""
                    />
                }
            },
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                render: (text) => {
                    return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
                }
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                render: (text, record) => {
                    return text || record.username
                }
            },
            {
                title: '重复次数',
                dataIndex: 'repeat_times'
            },
            {
                title: '重复情况',
                dataIndex: 'remark',
                className: styles.remarkColumn,
                render: (text) => {
                    const remarks = text.split(',').filter((item)=>{ return !!item})
                    return <div>
                        {
                            remarks.map((item, index) => {
                                return <p className={styles.remark} key={index}>{item}</p>
                            })
                        }
                    </div>
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    return <Popconfirm
                        placement="top"
                        title="加入白名单后该好友不做重复提示？"
                        icon={addWhitelistLoading ? <Icon type="loading"/> : <Icon type="exclamation-circle"/>}
                        onConfirm={()=>{this.handleAddWhitelist(record.username)}}
                        okText="确定"
                        cancelText="取消"
                    >
                        <span className={styles.stress}>加入白名单</span>
                    </Popconfirm>
                }
            }
        ]

        const expandedRowRender = (parentRecord, index, indent, expanded) => {
            const columns = [
                {
                    title: '好友备注',
                    dataIndex: 'friend_remark',
                    className: styles.remarkColumn
                },
                {
                    title: '好友互动情况',
                    dataIndex: 'interaction',
                    render: (interaction) => {
                        return <div>
                            <p>添加时间：{moment(interaction.add_time * 1000).format(DateTimeFormat)}</p>
                            {interaction.member_data ? <p>已绑定购物账号：{interaction.member_data}</p> : null }
                            {interaction.last_contact_time ? <p>最后联系时间：{moment(interaction.last_contact_time * 1000).format(DateTimeFormat)}</p> : null}
                            <p>累计对话数：{interaction.chat_count}</p>
                        </div>
                    }
                },
                {
                    title: '所属微信',
                    dataIndex: 'belong_wx_remark',
                    render: (text, record) => {
                        return text || record.belong_wx_nickname
                    }
                },
                {
                    title: '所属员工',
                    dataIndex: 'user_nickname',
                },
                {
                    title: '所属部门',
                    dataIndex: 'department',
                    className: styles.deptColumn,
                    render: (text) => {
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{text}</p>} title={null} trigger="hover">
                            <div className={styles.dept}>{text}</div>
                        </Popover>
                    }
                },
                {
                    title: '状态',
                    dataIndex: 'is_deleting',
                    className: styles.column,
                    render: (status) => {
                        return this.getStatusText(status)
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    render: (text, record) => {
                        if(record.is_deleting === deleteStatus.processing.status) {
                            return <Button size="small"
                                           disabled={record.is_deleting === deleteStatus.processing.status}
                                           icon={removeLoading && currentDetail === `${record.uin}${parentRecord.username}` ? "loading" : null}
                            >删除好友</Button>
                        }
                        return <Popconfirm
                            placement="top"
                            title="确定要删除该好友？"
                            trigger="click"
                            icon={removeLoading ? <Icon type="loading"/> : <Icon type="exclamation-circle"/>}
                            onConfirm={()=>{this.handleDeleteFriend(record, parentRecord)}}
                            okText="确定"
                            cancelText="取消"
                        >
                            <Button size="small"
                                icon={removeLoading && currentDetail === `${record.uin}${parentRecord.username}` ? "loading" : null}
                            >删除好友</Button>
                        </Popconfirm>

                    },
                },
            ]

            const {username} = parentRecord
            const data = friendsDetail[username] || []
            return (
                <Table columns={columns}
                    dataSource={data}
                    loading={friendsDetailLoading && currentLoad === username}
                    rowKey={(record) => record.uin}
                    rowClassName={styles.expandTable}
                    pagination={false}
                />
            )
        }

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E9%87%8D%E5%A4%8D%E5%A5%BD%E5%8F%8B.md',
                    }}
                />
                <div className={styles.duplicationWrapper}>
                    <Form className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={7}>
                                <FormItem {...formItemLayout}
                                    label="搜索："
                                    colon={false}
                                >
                                    <Search
                                        placeholder="输入昵称、微信号"
                                        value={params.query}
                                        onChange={(e)=>{this.handleChange('query', e)}}
                                        onSearch={this.handleSearch}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={7}>
                                <FormItem {...formItemLayout}
                                    label="重复数量："
                                    colon={false}
                                >
                                    <Select value={params.repeat_times}
                                        onChange={(e)=>{this.handleChange('repeat_times', e)}}
                                    >
                                        <Option value="">全部</Option>
                                        <Option value="2">2个以上</Option>
                                        <Option value="3">3个以上</Option>
                                        <Option value="5">5个以上</Option>
                                        <Option value="8">8个以上</Option>
                                        <Option value="10">10个以上</Option>
                                    </Select>
                                </FormItem>
                            </Col>
                            <Button type="primary"
                                icon="search"
                                className={styles.searchBtn}
                                onClick={this.handleSearch}>搜索</Button>
                        </Row>
                    </Form>
                    <div className={styles.tableTip}>
                        <span className={`${styles.left} ${styles.tip}`}>已过滤员工微信号的重复数据</span>
                        <div className={styles.right}>
                            <span className={styles.tip}>删除好友有一定的延时，为保证数据准确，建议隔天再查看数据</span>
                            <Link className={styles.link} to="/wx/whitelist">白名单</Link>
                        </div>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={list}
                        size="middle"
                        loading={friendsLoading}
                        rowKey={(record) => record.username}
                        expandedRowKeys={expandedRowKeys}
                        onExpand={this.handleExpand}
                        expandedRowRender={expandedRowRender}
                        pagination={
                            list.length ? {
                                size: 'middle',
                                total: total,
                                current: current,
                                showQuickJumper: true,
                                pageSizeOptions: pageSizeOptions,
                                showTotal: total => `共${total}条`,
                                pageSize: params.limit,
                                showSizeChanger: true,
                                onShowSizeChange: this.handleChangeSize,
                                onChange: this.goPage,
                            } : false
                        }
                    />
                </div>
            </div>
        )
    }
}
