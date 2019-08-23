'use strict'

/**
 * 文件说明: 通过订单发送短信
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 17/08/01
 */
import React from 'react'
import {
    Row,
    Col,
    Table,
    Button,
    Modal,
    Switch,
    InputNumber
} from 'antd'
import moment from 'moment'
import config from 'crm/common/config'
import styles from './Index.scss'

const {DateTimeFormat} = config

class Members extends React.Component {
    constructor(props) {
        super()
        this.state = {
            filterRef: true, //过滤已关联微信
            filterLatest: true,// 过滤最近发送
            filterLatestDay: 1 //过滤最近发送天数
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (this.props.source === 'order') {
                this.props.dispatch({
                    type: 'crm_sms/queryOrders',
                    payload: {}
                })
            } else if (this.props.source === 'member') {
                this.props.dispatch({
                    type: 'crm_sms/queryMembers',
                    payload: {}
                })
            }
            this.props.dispatch({
                type: 'base/querySmsCount',
                payload: {}
            })
        }, 0)
    };


    handleRemove = (id) => {
        this.props.dispatch({
            type: 'crm_sms/removeItem',
            payload: {id: id}
        })
    };

    handleCancel = () => {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {modal: false}
        })
    }

    handleChange = (key, val) => {
        this.setState({[key]: val})
    }

    filterList = (list) => {
        let _list = [], _invalid_mobile = 0, _is_ref = 0, _is_send = 0
        const {filterRef, filterLatest, filterLatestDay} = this.state
        const {source} = this.props
        _list = list.filter((item) => {
            if (item.mobile.length !== 11 || !item.mobile.startsWith('1')) {
                _invalid_mobile++
                return false
            }
            return true
        })

        if (filterRef) {
            _list = _list.filter((item) => {
                if (source === 'order') {
                    if (item.customer_id) {
                        _is_ref++
                        return false
                    }
                } else {
                    if (item.customer.id) {
                        _is_ref++
                        return false
                    }
                }
                return true
            })
        }
        if (filterLatest && filterLatestDay > 0) {
            let t = (moment().subtract(filterLatestDay, 'days')).unix()
            _list = _list.filter((item) => {
                if (source === 'order') {
                    if (item.crm_sms_update_time && item.crm_sms_update_time > t) {
                        _is_send++
                        return false
                    }

                } else {
                    if (item.crm_sms_stat.update_time && item.crm_sms_stat.update_time > t) {
                        _is_send++
                        return false
                    }
                }
                return true
            })
        }
        return {_list, _invalid_mobile, _is_ref, _is_send}

    };

    handleRenew = () => {
        //TODO
    };

    handleNext = (list) => {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {list: list, confirmModal: false, sendModal: true}
        })
    };

    render() {
        const {list, createLoading, loadingMember} = this.props.crm_sms
        const {initData: config} = this.props.base
        const {source} = this.props
        const getStoreTypeName = (id) => {
            let _types = config.store_types || []
            let _item = _types.filter((item) => {
                return item.id === id
            })
            return _item.length && _item[0].name

        }
        let {_list, _invalid_mobile, _is_ref, _is_send} = this.filterList(list)
        const columns = [{
            title: '姓名',
            dataIndex: 'real_name',
        }, {
            title: '手机号',
            dataIndex: 'mobile',
        }, {
            title: '微信私人号',
            dataIndex: 'customer.id',
            render: (text, record) => {
                if (source === 'order') {
                    return record.customer_id ? '已关联' : '未关联'
                } else {
                    return record.customer.id ? '已关联' : '未关联'
                }
            }
        }, {
            title: '最后购买日期',
            dataIndex: 'last_buy_time',
            render: (text, record) => {
                if (record.last_buy_time) {
                    return moment(record.last_buy_time * 1000).format(DateTimeFormat)
                } else {
                    return ''
                }
            }
        }, {
            title: '更新时间',
            dataIndex: 'create_time',
            render: (text, record) => {
                return moment(record.create_time * 1000).format(DateTimeFormat)
            }
        }, {
            title: '用户来源',
            dataIndex: 'store.type',
            render: (text, record) => {
                return getStoreTypeName(record.store_type)
            }
        }, {
            title: '已发短信数',
            dataIndex: 'sms_num',
            width: 85
        }, {
            title: '操作',
            dataIndex: 'option',
            width: 85,
            render: (text, record, index) => {
                return (<Button size="small" onClick={this.handleRemove.bind(this, record.id)}
                    loading={this.state.loading}>删除</Button>)
            }
        }]
        const {sms_count} = this.props.application.userInfo.company
        const getDis = () => {
            return sms_count < _list.length || !_list.length
        }
        const getTip = () => {
            if (sms_count < _list.length) {
                return <span className="strong" onClick={this.handleRenew} style={{marginRight: 30}}>可用短信{sms_count}条，小于当前选择用户总数{_list.length},联系客户充值</span>
            }
            return ''
        }
        const footer = <div>{getTip()}<Button key="cancel" onClick={this.handleCancel}>取消</Button><Button key="submit"
            type="primary"
            disabled={getDis()}
            loading={createLoading}
            onClick={this.handleNext.bind(this, _list)}>下一步</Button>
        </div>
        return (
            <Modal title="确认发送人员" visible={this.props.crm_sms.modal}
                width={1100}
                onCancel={this.handleCancel}
                maskClosable={false}
                footer={footer}
            >
                <Row className={styles.members}>
                    <Col span="24">
                        <div className={styles.filter}>
                            <div className={styles.item}>已选择<span className="strong">{_list.length}</span>个发送用户, 自动过滤手机号非法用户({_invalid_mobile}个)</div>
                            <div className={styles.item}><Switch checked={this.state.filterRef}
                                onChange={this.handleChange.bind(this, 'filterRef')}/>&nbsp;&nbsp;
                                过滤已加微信用户({_is_ref}个)
                            </div>
                            <div className={styles.item}><Switch checked={this.state.filterLatest}
                                onChange={this.handleChange.bind(this, 'filterLatest')}/>&nbsp;&nbsp;
                                过滤&nbsp;  <InputNumber min={1} value={this.state.filterLatestDay} max={1000}
                                defaultValue={1}
                                onChange={this.handleChange.bind(this, 'filterLatestDay')}/>&nbsp;
                                天内发送过短信的用户({_is_send}个)
                            </div>
                        </div>
                        <Table dataSource={_list}
                            rowKey={record => record.id}
                            columns={columns}
                            size="small"
                            loading={loadingMember}
                            showTotal={total => `共${_list.length}条`}/>
                    </Col>
                </Row>
            </Modal>)
    }
}

Members.propTypes = {}

export default Members
