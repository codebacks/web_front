/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/14
 */
import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Radio, Row, Col, Pagination, Modal, InputNumber, Icon, Alert} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import config from 'community/common/config'
import styles from './index.less'
import moment from "moment/moment"
import {message} from "antd/lib/index"
import ClearModal from "./components/ClearModal"

const FormItem = Form.Item
const {pageSizeOptions, DateFormat, DateTimeFormat} = config

@connect(({base, community_repeatGroup, loading}) => ({
    base,
    community_repeatGroup,
    queryLoading: loading.effects['community_repeatGroup/query'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            record: null, // 操作的rocord
            detailClearVisible: false,
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
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_repeatGroup.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_repeatGroup/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_repeatGroup.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_repeatGroup/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_repeatGroup/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_repeatGroup/resetParams',
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
        }, 0)
    }

    whitelistAdd = (record) => {
        const { wechat_id } = record
        this.props.dispatch({
            type: 'community_repeatGroup/whitelistAdd',
            payload: {
                body: {
                    wechat_id: wechat_id,
                }
            },
            callback: () => {
                message.success('已执行加入白名单！', 1)
                setTimeout(() => {
                    this.goPage(this.props.community_repeatGroup.current || 1)
                }, 1000)
            }
        })
    }

    addBlackList = (record) => {
        const { wechat_id } = record
        this.props.dispatch({
            type: 'community_repeatGroup/addBlackList',
            payload: {
                body: {
                    wechat_id: wechat_id,
                }
            },
            callback: () => {
                message.success('已执行加入黑名单！', 1)
                setTimeout(() => {
                    this.goPage(this.props.community_repeatGroup.current || 1)
                }, 1000)
            }
        })
    }

    showDetailModel = (record) => {
        // 请求接口，并显示modal
        this.setState({
            detailClearVisible: true,
            record: record,
        }, () => {
            this.props.dispatch({
                type: 'community_repeatGroup/queryRepeatGroup',
                payload: {wx_id: record.wechat_id},
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
            this.goPage(this.props.community_repeatGroup.current || 1)
        })
    }

    render() {
        const {params, total, current, list} = this.props.community_repeatGroup
        const {queryLoading} = this.props
        const {record} = this.state

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
                key: 'nickname',
                className: styles.nickname,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                key: 'alias',
                className: styles.uin,
                render: (text, record) => {
                    return <span>{text ? text: record?.wechat_id}</span>
                },
            },
            {
                title: '重复群详情',
                dataIndex: 'rel_cnt',
                key: 'rel_cnt',
                align: 'center',
                className: styles.detail,
                render: (text, record) => {
                    return <span className={styles.canEdit} onClick={() => this.showDetailModel(record)}>{text}</span>
                }
            },
            {
                title: '操作',
                dataIndex: 'edit',
                key: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    return (
                        <div className={styles.editWrap}>
                            <span className={styles.canEdit} onClick={() => this.whitelistAdd(record)}>加入白名单</span>
                            {
                                !record?.in_blacklist ? <span className={styles.canEdit} onClick={() => this.addBlackList(record)}>加入黑名单</span>
                                    : null
                            }
                        </div>
                    )
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        }

        return (
            <Fragment>
                <div className={styles.repeatGroup}>
                    <Alert
                        message="重复群详情数据每天24点后更新，列表展示为前一天的重复加群微信号，筛选条件为工作群"
                        type="info"
                        style={{marginBottom: 10}}
                        showIcon
                    />
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={12}>
                                <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                    <Input
                                        placeholder="输入微信昵称模糊搜索或输入完整微信号搜索"
                                        value={params.key}
                                        onChange={(e) => {
                                            this.handleChange('key', e)
                                        }}
                                        onPressEnter={this.handleSearch}
                                    />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={7}>
                                <Col offset={2} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.tableWrap}>
                        <Table columns={columns}
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
                    visible={this.state.detailClearVisible}
                    onCancel={this.clearModalOnCancel}
                    onOk={this.clearModalOnOk}
                />
            </Fragment>
        )
    }

}
