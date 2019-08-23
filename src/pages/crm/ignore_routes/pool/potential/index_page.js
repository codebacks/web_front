'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Row, Col, Table, Pagination, Button, Icon, Popover} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.scss'
import config from 'crm/common/config'
import moment from 'moment'
import Search from './Search'
import Remark from './Remark'
import Import from './Import'
import Helper from 'crm/utils/helper'
// import Sms from '../Sms/Index'
import Sms from '../sms/Batch'

const {pageSizeOptions, DateTimeFormat} = config

@connect(({ base, crm_members, crm_sms, crm_orders }) => ({
    base, crm_members, crm_sms, crm_orders
}))
@documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_members/query',
            payload: {}
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_members/query',
            payload: {page: page}
        })
    };

    handleReload = () => {
        this.goPage(1)
    };

    handleDetail = (record, e) => {
        this.setState({visibleHistory: true, record: record})
        e.preventDefault()
    };

    handleShowRemark = (record) => {
        this.props.dispatch({
            type: 'crm_members/setProperty',
            payload: {record: record, remarkModal: true}
        })
    };

    handleCancelRemark = () => {
        this.props.dispatch({
            type: 'crm_members/setProperty',
            payload: {record: '', remarkModal: false}
        })
    };

    handleSendSms = () => {
        this.props.dispatch({
            type: 'crm_sms/setProperty',
            payload: {modal: true, list: []}
        })
    };

    render() {
        const {initData: config, pageHeight} = this.props.base
        const {params, list, loading, total, current, remarkModal} = this.props.crm_members
        const {modal} = this.props.crm_sms
        const getStoreTypeName = (id) => {
            let _types = config.store_types || []
            let _item = _types.filter((item) => {
                return item.id === id
            })
            return _item[0].name

        }
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
                return record.customer.id ? '已关联' : '未关联'
            }
        }, {
            title: '订单数量',
            dataIndex: 'total_count',
        }, {
            title: '订单金额',
            dataIndex: 'total_amount',
        }, {
            title: '平均单价',
            dataIndex: 'average_amount',
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
            title: '会员名',
            dataIndex: 'name',
        }, {
            title: ()=>{
                return (
                    <div>是否派发</div>
                )
            },
            dataIndex: 'mobile_stat',
            render: (text, record) => {

                return record.mobile_stat.is_issued ? '已派发' : '未派发'
            }
        }, {
            title: '短信发送数',
            dataIndex: 'sms_num'
        }, {
            title: '备注',
            dataIndex: 'remark',
            render: (text, record, index) => {
                return <div className={styles.edit}>
                    {text}&nbsp;<Icon type="edit"
                        onClick={this.handleShowRemark.bind(this, record)}
                        className={styles.editIcon}/></div>
            }
        }]
        let help = <div>
            用户池顾名思义，是所有潜在微信客户的汇总，<br/>
            {Helper.getIn(config, 'agent.product_name')}对各平台的店铺订单数据、导入的自定义用户数据、订单数据进行自动处理，<br/>
            过滤无效与重复数据，抽取的全部潜在用户，帮助商家把这些潜在用户都加到微信去。<br/>
            用户池与订单历史的区别是，不仅包含订单中抽取用户，还包括自行导入的用户数据，<br/>
            另外做了去重和过滤处理，大部分情况下，只需要对用户池发起加粉，进行维护即可。<br/>
            用户池还对用户的订单数量、订单总额、订单均价做了统计，可以帮助筛选出高价值用户，<br/>
            进行区别加好友做处理，确保高价值客户加到微信去。
        </div>
        return ( <div className={"page " + styles.member} style={{height: pageHeight}}>
            <div className={styles.pageOptions}>
                <Row>
                    <Col span="12">
                        <Import {...this.props} reload={this.handleReload}/>
                        <a href={require('crm/assets/files/member_template.xls')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Button
                                size="default"
                                icon="download"
                                className={styles.btn}>下载模板</Button>
                        </a>
                        <Popover content={help} title={null}>
                            <span className={styles.help}>用户池是什么<Icon type="question-circle-o"/></span>
                        </Popover>
                    </Col>
                    <Col span="12" className="textRight">
                    </Col>
                </Row>
            </div>
            <Search {...this.props} search={this.handleReload}/>
            <div className={styles.list}>
                {total ?
                    <div className="rowMB">共找到{total}人<Button icon="message"
                        size="default"
                        className="mlr"
                        disabled={(params.store_type === '' || total > 3000) ? true : false}
                        onClick={this.handleSendSms}>批量发送短信</Button><span
                        className="strong">提示：发送短信需要先选择用户来源。单次最多发送3000人</span></div>
                    : ''}
                <Table
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={loading}
                    rowKey={record => record.id}
                    pagination={false}
                />
                <Pagination
                    className="ant-table-pagination"
                    total={total}
                    current={current}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共${total}条`}
                    pageSize={params.limit}
                    onChange={this.goPage}
                />
                {remarkModal ?
                    <Remark
                        {...this.props}
                        onCancel={this.handleCancelRemark}/>
                    : ''}
                {modal ?
                    <Sms {...this.props} source="member"/>
                    : ''}

            </div>
        </div>)
    }
}
