/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/14
 */
import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Select, Radio, Row, Col, Pagination, Icon, message, Checkbox, Modal, Alert} from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import DateRange from 'components/DateRange'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment";

const FormItem = Form.Item
const sourceMap = {
    0: '牛客服IM操作加入',
    1: '违规系统自动加入',
    2: '微信手动操作加入',
    3: '微信黑名单自动导入',
}
const wechatIdReg = /^[A-Za-z][-_A-Za-z0-9]{5,19}$/
const {pageSizeOptions, DateFormat, DateTimeFormat, DefaultAvatar} = config

@Form.create()
@connect(({base, wx_blacklist, loading}) => ({
    base,
    wx_blacklist,
    queryLoading: loading.effects['wx_blacklist/query'],
    addBlackListLoading: loading.effects['wx_blacklist/addBlackList'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowAddModal: false, // 添加黑名单弹窗
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
        let params = {...this.props.wx_blacklist.params}
        params[key] = val
        this.props.dispatch({
            type: 'wx_blacklist/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.wx_blacklist.params}
        params.limit = size
        this.props.dispatch({
            type: 'wx_blacklist/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'wx_blacklist/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_blacklist/resetParams',
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
        let params = {...this.props.wx_blacklist.params}
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
            type: 'wx_blacklist/setParams',
            payload: {params: params}
        })
    }

    removeBLackList = (record) => {
        this.props.dispatch({
            type: 'wx_blacklist/blacklistRemove',
            payload: {
                id: record.id
            },
            callback: () => {
                message.success('移出成功')
                this.goPage(this.props.wx_blacklist.current || 1)
            }
        })
    }

    addBlackList = () => {
        this.setState({
            isShowAddModal: true,
        })
    }

    handleAddCancel = () => {
        this.setState({
            isShowAddModal: false,
        })
    }

    handleAddOk = () => {
        const { getFieldValue, resetFields } = this.props.form

        this.props.dispatch({
            type: 'wx_blacklist/addBlackList',
            payload: {
                body: {
                    wechat_id: getFieldValue('wechat_id')
                }
            },
            callback: () => {
                message.success('添加成功')
                this.handleAddCancel()
                resetFields()
                this.goPage(this.props.wx_blacklist.current || 1)
            }
        })
    }

    checkWechatId = (rule, value, callback) => {
        if(!wechatIdReg.test(value)) {
            callback('微信号仅支持6-20个字母、数字、下划线或减号，以字母开头')
        }else{
            callback()
        }
    }

    render() {
        const {params, total, current, list} = this.props.wx_blacklist
        const {queryLoading, addBlackListLoading} = this.props
        const {isShowAddModal} = this.state
        const { getFieldDecorator, getFieldValue } = this.props.form
        const wechatIdVal = getFieldValue('wechat_id')

        const columns = [
            {
                title: '头像',
                dataIndex: 'head_img_url',
                key: 'head_img_url',
                className: styles.avatar,
                align: 'center',
                render: (text, record) => {
                    return (
                        <img src={text} alt="" onError={(e) => {e.target.src=DefaultAvatar}} rel="noreferrer"/>
                    )
                }
            },
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
                dataIndex: 'wechat_id',
                key: 'wechat_id',
                className: styles.uin,
             
            },
            {
                title: '操作员工',
                dataIndex: 'operator_username',
                key: 'operator_username',
                className: styles.editNickname,
                render: (text, record) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '操作时间',
                dataIndex: 'update_at',
                key: 'update_at',
                className: styles.editTime,
                render: (text, record) => {
                    return text ? moment(text*1000).format(DateTimeFormat) : '-'
                }
            },
            {
                title: '来源',
                dataIndex: 'source_name',
                align: 'center',
                className: styles.source,
            },
            {
                title: '操作',
                dataIndex: 'edit',
                key: 'edit',
                className: styles.edit,
                render: (text, record) => {
                    return <div>
                        <div className={styles.canEdit} onClick={() => this.removeBLackList(record)}>移出黑名单</div>
                    </div>
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        }

        return (
            <Fragment>
                <div className={styles.blackList}>
                    {/*<Alert style={{marginBottom: '16px'}} message="加入黑名单后会将此微信号陆续踢出所有已加入的群" type="info" showIcon />*/}
                    <div className={styles.searchWrap}>
                        <Row gutter={20}>
                            <Col span={10}>
                                <FormItem {...formItemLayout}
                                          label="搜索："
                                          colon={false}
                                >
                                    <Input placeholder="输入昵称、微信号、操作员工搜索"
                                           value={params.key}
                                           onChange={(e) => {
                                               this.handleChange('key', e)
                                           }}
                                           onPressEnter={this.handleSearch}/>
                                </FormItem>
                            </Col>
                            <Col span={10}>
                                <FormItem className={styles.executeTime} {...formItemLayout} label="执行时间："
                                          colon={false}>
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
                        </Row>
                        <Row className={styles.searchBtn} gutter={20}>
                            <Col span={10}>
                                <Col offset={4} style={{padding: "0"}}>
                                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                    <Button onClick={this.resetSearch}>重置</Button>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <div className={styles.addWrap}>
                        <Button
                            type="primary"
                            icon="plus"
                            onClick={this.addBlackList}
                        >添加</Button>
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

                <Modal
                    className={styles.addModal}
                    width={640}
                    title="添加黑名单"
                    visible={isShowAddModal}
                    onCancel={this.handleAddCancel}
                    onOk={this.handleAddOk}
                    okButtonProps={{
                        disabled: !wechatIdVal || !wechatIdReg.test(wechatIdVal),
                        loading: addBlackListLoading,
                    }}
                >
                    <Form>
                        <FormItem
                            {...formItemLayout}
                            label="黑名单："
                            colon={false}
                        >
                            {
                                getFieldDecorator('wechat_id', {
                                    trigger: "onChange",
                                    rules: [{
                                        validator: this.checkWechatId,
                                    }],
                                })(
                                    <Input
                                        className={styles.input}
                                        placeholder="请输入微信号"
                                    />
                                )
                            }

                        </FormItem>
                    </Form>
                </Modal>
            </Fragment>
        )
    }

}
