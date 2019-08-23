/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/17
 */
import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Row, Col, Pagination, Icon, message, Modal} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import DateRange from 'components/DateRange'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import documentTitleDecorator from "hoc/documentTitle"
import GroupViewContextModal from "business/HistoryMessages/GroupViewContextModal"

const FormItem = Form.Item
const Option = Select.Option

const {pageSizeOptions, DateFormat, DateTimeFormat, DefaultAvatar} = config
const violateTypes = ['', 10, 12, 13, 14, 15, 16, 17]
const violateStatus = ['', 0, 1, 2]
const mapViolationType = {
    '': '全部',
    10: '消息敏感词',
    // 11: '群成员昵称以及群昵称敏感词',
    12: '发送公众号名片/个人号名片',
    13: '发送链接分享',
    14: '发送小程序',
    15: '发送小视频',
    16: '防骚扰',
    17: '群名锁定禁止修改',
}
const mapViolationStatus = {
    '': '全部',
    0: '未警告',
    1: '已警告',
    2: '已踢出',
}

@documentTitleDecorator()
@connect(({base, community_violationRecords, loading}) => ({
    base,
    community_violationRecords,
    queryLoading: loading.effects['community_violationRecords/query'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowWarningModal: false,
        }
    }

    componentDidMount() {
        this.goPage(1)
    };

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'violator' || key === 'chatroom_name' || key === 'chatroom_owner') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_violationRecords.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_violationRecords/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_violationRecords.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_violationRecords/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_violationRecords/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_violationRecords/resetParams',
        })
        this.executeTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    handleChangeExecuteDate = (startValue, endValue) => {
        let params = {...this.props.community_violationRecords.params}
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
            type: 'community_violationRecords/setParams',
            payload: {params: params}
        })
    }

    joinWhiteList = (record) => {
        this.props.dispatch({
            type: 'community_violationRecords/joinWhiteList',
            payload: {
                id: record.id
            },
            callback: () => {
                message.success('成功加入白名单！', 2)
                setTimeout(() => {
                    this.goPage(this.props.community_violationRecords.current || 1)
                }, 2000)
            }
        })
    }

    sendWarning = (record) => {
        this.props.dispatch({
            type: 'community_violationRecords/sendWarning',
            payload: {
                id: record.id,
            },
            callback: () => {
                message.success('发送警告成功！', 2)
                setTimeout(() => {
                    this.goPage(this.props.community_violationRecords.current || 1)
                }, 2000)

            }
        })
    }

    kickoutGroup = (record) => {
        this.props.dispatch({
            type: 'community_violationRecords/kickoutGroup',
            payload: {
                id: record.id,
            },
            callback: () => {
                message.success('踢出群聊成功！', 2)
                setTimeout(() => {
                    this.goPage(this.props.community_violationRecords.current || 1)
                }, 2000)
            }
        })
    }


    render() {
        const {params, total, current, list} = this.props.community_violationRecords
        const {queryLoading} = this.props
        const {isShowWarningModal} = this.state

        const columns = [
            {
                title: '头像',
                dataIndex: 'from.head_img_url',
                key: 'from.head_img_url',
                className: styles.avatar,
                align: 'center',
                render: (text, record) => {
                    return (
                        <img src={text} alt="" onError={(e) => {e.target.src=DefaultAvatar}} />
                    )
                }
            },
            {
                title: '微信昵称',
                dataIndex: 'from.nickname',
                key: 'from.nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '微信号',
                dataIndex: 'from.alias',
                key: 'from.alias',
                className: styles.uin,
                render: (text, record) => {
                    return <span>{text ? text: record?.from?.wechat_id}</span>
                },
            },
            {
                title: '所在群',
                dataIndex: 'target.display_name',
                key: 'target.display_name',
                className: styles.group,
                render: (text, record) => {
                    return <span>{record.target.nickname ? record.target.nickname: text}</span>
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.nickname',
                key: 'target.owner.nickname',
                className: styles.owner,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '违规时间',
                dataIndex: 'occurrence_time',
                key: 'occurrence_time',
                className: styles.violationTime,
                sorter: (a, b) => a.occurrence_time - b.occurrence_time,
                render: (text, record) => {
                    return text ? moment(text*1000).format(DateTimeFormat) : '-'
                }
            },
            {
                title: '违规类型',
                dataIndex: 'task_name',
                key: 'task_name',
                className: styles.violateType,
            },
            {
                title: '违规详情',
                dataIndex: 'staff_wechat_info',
                className: styles.violationDetail,
                align: 'center',
                render: (text, record) => {
                    console.log('record', record)
                    return <>
                        {
                            !record?.staff_wechat_info?.uin ? '-' : (
                                <GroupViewContextModal
                                    activeRecord={{create_time: record?.micro_occurrence_time}}
                                    activeSession={{
                                        from: {
                                            username: record?.staff_wechat_info?.wechat_id,
                                            uin: record?.staff_wechat_info?.uin,
                                        },
                                        target: {username: record?.target?.username,},
                                    }}
                                    renderBtn={(setTrue) => {
                                        return (<span className={styles.canEdit} onClick={setTrue}>查看</span>)
                                    }}
                                />
                            )
                        }
                    </>
                },
            },
            {
                title: '违规次数',
                dataIndex: 'violation_count',
                className: styles.violationCount,
                align: 'center',
            },
            {
                title: '状态',
                dataIndex: 'process_status',
                key: 'process_status',
                className: styles.status,
                render: (text, record) => {
                    return <span>{(text || text===0) ? mapViolationStatus[text]: ''}</span>
                },
            },
            {
                title: '操作',
                dataIndex: 'edit',
                key: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    if(record.process_status === 2) {
                        return <div>
                            <div className={styles.noEdit}>加入白名单</div>
                            <div className={styles.noEdit}>发送警告</div>
                            <div className={styles.noEdit}>踢出群聊</div>
                        </div>
                    }else{
                        return <div>
                            {
                                record.in_whitelist === 0 ? <div className={styles.canEdit} onClick={() => this.joinWhiteList(record)}>加入白名单</div>: ''
                            }
                            <div className={styles.canEdit} onClick={() => this.sendWarning(record)}>发送警告</div>
                            <div className={styles.canEdit} onClick={() => this.kickoutGroup(record)}>踢出群聊</div>
                        </div>
                    }

                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        return (
            <Fragment>
                <div className={styles.blackList}>
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="微信号搜索：" colon={false}>
                                    <Input
                                        placeholder="输入违规者昵称/微信号搜索"
                                        value={params.violator}
                                        onChange={(e) => {
                                            this.handleChange('violator', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="群名称搜索：" colon={false}>
                                    <Input
                                        placeholder="输入群名称搜索"
                                        value={params.chatroom_name}
                                        onChange={(e) => {
                                            this.handleChange('chatroom_name', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="群主搜索搜索：" colon={false}>
                                    <Input
                                        placeholder="输入群主搜索"
                                        value={params.chatroom_owner}
                                        onChange={(e) => {
                                            this.handleChange('chatroom_owner', e)
                                        }}
                                        onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                        </Row>

                        <Row gutter={20}>
                            <Col span={8}>
                                <FormItem className={styles.executeTime} {...formItemLayout} label="违规时间：" colon={false}>
                                    <DateRange
                                        ref={(node) => this.executeTime = node}
                                        startPlaceholder="不限"
                                        endPlaceholder="不限"
                                        startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                        endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                        onChange={this.handleChangeExecuteDate}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="违规类型：" colon={false}>
                                    <Select value={params.type} style={{width: '80%'}} placeholder="请选择违规类型" onChange={(e) => this.handleChange('type', e)}>
                                        {
                                            violateTypes.map((item, index) => {
                                                return <Option value={item} key={index}>{mapViolationType[item]}</Option>
                                            })
                                        }
                                    </Select>
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout} label="选择状态：" colon={false}>
                                    <Select value={params.status} style={{width: '60%'}} placeholder="请选择状态" onChange={(e) => this.handleChange('status', e)}>
                                        {
                                            violateStatus.map((item, index) => {
                                                return <Option value={item} key={index}>{mapViolationStatus[item]}</Option>
                                            })
                                        }
                                    </Select>
                                </FormItem>
                            </Col>
                        </Row>

                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={10}>
                                <Col offset={2} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
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
                <Modal
                    width={600}
                    title="发送警告"
                    visible={isShowWarningModal}
                    onCancel={this.handleWarningCancel}
                    onOk={this.handleWarningOk}
                >
                    <div style={{marginBottom: 10}}>警告：</div>
                    <Input
                        placeholder="请输入警告文字"
                        rows={4}
                        onChange={this.warningTxtChange}
                    />
                </Modal>
            </Fragment>
        )
    }

}
