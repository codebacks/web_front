'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Table, DatePicker, Button} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'crm/common/config'
import moment from 'moment'
import styles from './index.scss'
import Detail from './Detail'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')
const {RangePicker} = DatePicker
const {DateFormat} = config

@connect(({ base, crm_stat_workload }) => ({
    base, crm_stat_workload,
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            showDetail: false,
            record: null
        }
    }

    loadWorkload = () => {
        this.props.dispatch({
            type: 'crm_stat_workload/query',
            payload: {params: {}}
        })
    };

    componentDidMount() {
        this.loadWorkload()
    }

    handleChangeDate = (val) => {
        let params = {...this.props.crm_stat_workload.params}
        if (val[0]) {
            params.start_time = moment(val[0]).format(DateFormat) + ' 00:00:00'
            params.end_time = moment(val[1]).format(DateFormat) + ' 23:59:59'
        } else {
            params.start_time = ''
            params.end_time = ''

        }
        this.props.dispatch({
            type: 'crm_stat_workload/setParams',
            payload: {params: params}
        })
    };

    handleSearch = () => {
        this.props.dispatch({
            type: 'crm_stat_workload/query',
            payload: {}
        })
    };

    handleCancel = () => {
        this.setState({showDetail: false, record: null})
    };

    handleShowHistory = (record) => {
        this.setState({showDetail: true, record: record})
    };

    render() {
        const {pageHeight} = this.props.base
        const columns = [{
            title: '排名',
            dataIndex: 'sort',
            key: 'time',
            render: (text, record, idx) => (
                <span>{idx + 1}</span>
            ),
        }, {
            title: '客服',
            dataIndex: 'user.nickname',
            key: 'nickname',
        }, {
            title: '新增人数',
            dataIndex: 'new_friend_count',
            key: 'new_friend_count',
            sorter: (a, b) => a.new_friend_count - b.new_friend_count,
        }, {
            title: '发送人数',
            dataIndex: 'send_friend_count',
            key: 'send_friend_count',
            sorter: (a, b) => a.send_friend_count - b.send_friend_count,
        }, {
            title: '回复人数',
            dataIndex: 'receive_friend_count',
            key: 'receive_friend_count',
            sorter: (a, b) => a.receive_friend_count - b.receive_friend_count,

        }, {
            title: '发送消息数',
            dataIndex: 'send_count',
            key: 'send_count',
            sorter: (a, b) => a.send_count - b.send_count,

        }, {
            title: '回复消息数',
            dataIndex: 'receive_count',
            key: 'receive_count',
            sorter: (a, b) => a.receive_count - b.receive_count,
        }, {
            title: '操作',
            dataIndex: 'r5',
            key: 'option',
            render: (text, record) => (
                <Button onClick={()=>{this.handleShowHistory(record)}} size="small">查看</Button>
            ),
        }]
        const {list, params, loading} = this.props.crm_stat_workload
        return (<div className={"page " + styles.workload} style={{height: pageHeight}}>
            <div className={styles.filter}>
                <RangePicker defaultValue={[moment(params.start_time, DateFormat), moment(params.end_time, DateFormat)]}
                    style={{width: 320}} onChange={this.handleChangeDate}/><Button style={{marginLeft: 15}}
                    icon="search" type="primary"
                    onClick={this.handleSearch}>搜索</Button>
            </div>
            <div className={styles.tableWrap}>
                <Table dataSource={list} columns={columns} size="middle" loading={loading}
                    rowKey={(record) => record.user.id} pagination={false}/>
            </div>
            {this.state.showDetail ?
                <Detail {...this.props} visible={this.state.showDetail} onCancel={this.handleCancel}
                    record={this.state.record}/> : ''}

        </div>)
    }
}
