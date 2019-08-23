'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {
    Row,
    Col,
    Table,
    DatePicker,
    Pagination,
    Button,
    Input,
    Icon,
    Tooltip,
    Select,
} from 'antd'
import config from 'crm/common/config'
import moment from 'moment'
import styles from './Index.scss'
import ImportOrder from './ImportOrder'
import Detail from './Detail'
import 'moment/locale/zh-cn'
const {RangePicker} = DatePicker
const Option = Select.Option
const {pageSizeOptions, DateTimeFormat} = config

moment.locale('zh-cn')
//////
export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false,
            visible: false,
            smsVisible: false,
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'crm_orders/resetState',
            payload: {}
        })
        setTimeout(()=>{
            this.props.dispatch({
                type: 'crm_orders/query',
                payload: {}
            })
            this.props.dispatch({
                type: 'crm_stores/query',
                payload: {params: {limit: 1000}}
            })
        },100)

    }

    handleSearch = () => {
        this.props.dispatch({
            type: 'crm_orders/query',
            payload: {page: 1}
        })
    };

    // handleCancelCreatePlan = () => {
    //     this.setState({visibleCreatePlan: false})
    //
    // };

    handlePageChange = (page) => {
        this.props.dispatch({
            type: 'crm_orders/query',
            payload: {page: page},
        })
    };

    handleChange = (field, e) => {
        let params = {...this.props.crm_orders.params}
        if (e.target) {
            params[field] = e.target.value.trim()
        } else {
            params[field] = e
        }
        this.props.dispatch({
            type: 'crm_orders/setParams',
            payload: params,
        })
    };
    handleQueryKeydown = (e) => {
        if (e.keyCode === 13) {
            this.handlePageChange(1)
        }
    };
    handleChangeDate = (val) => {
        let params = {...this.props.crm_orders.params}
        if (val[0]) {
            params.start_time = moment(val[0]).format(DateTimeFormat)
            params.end_time = moment(val[1]).format(DateTimeFormat)
        } else {
            params.start_time = ''
            params.end_time = ''

        }
        this.props.dispatch({
            type: 'crm_orders/setParams',
            payload: params,
        })
    };

    // handleChangeFilter = (key, val) => {
    //     let params = {...this.props.crm_orders.params}
    //     params[key] = val
    //     this.props.dispatch({
    //         type: 'crm_orders/setParams',
    //         payload: params,
    //     })
    // };
    handleImport = () => {
        this.props.dispatch({
            type: 'crm_orders/setProperty',
            payload: {importModal: true}
        })
    };

    handleDetail = (record) => {
        this.props.dispatch({
            type: 'crm_orders/setProperty',
            payload: {detailModal: true, record: record}
        })
    };

    render() {
        const {initData: config, pageHeight} = this.props.base
        const {params, list, loading, total, current, importModal, detailModal} = this.props.orders
        const columns = [{
            title: '平台',
            dataIndex: 'store.type',
            key: 'store_type',
            // fixed: 'left',
            render: (text, record, index) => {
                let _type = config.store_types.filter((item) => {
                    return item.id === record.store.type
                })
                return _type[0].name
            }
        }, {
            title: '店铺',
            dataIndex: 'store.name',
            key: 'store_name',
            // fixed: 'left',
        }, {
            title: '订单号',
            key: 'outer_order_id',
            dataIndex: 'outer_order_id',
            // fixed: 'left',
        }, {
            title: '会员名',
            key: 'member_name',
            dataIndex: 'member.name',
        }, {
            title: '联系电话',
            key: 'contact_mobile',
            dataIndex: 'contact_mobile',
        }, {
            title: '联系姓名',
            key: 'contact_name',
            dataIndex: 'contact_name',
        // }, {
        //     title: ' 商品名称',
        //     key: 'product_name',
        //     dataIndex: 'product_name',
        //     width: 200,
        //     render: (text) => {
        //         return <div className="overElli" style={{width: 200}}><Tooltip placement="topLeft"
        //                                                                        title={text}>{text}</Tooltip></div>
        //     }

        }, {
            title: '购买数量',
            key: 'product_num',
            dataIndex: 'product_num',
        }, {
            title: '总金额',
            key: 'amount_total',
            dataIndex: 'amount_total',
        }, {
            title: '订单状态',
            key: 'order_status',
            dataIndex: 'order_status',
        }, {
            title: '订单备注',
            key: 'order_remark',
            dataIndex: 'order_remark',
            width: 150,
            render: (text) => {
                return <div className="overElli" style={{width: 150}}><Tooltip placement="topLeft"
                    title={text}>{text}</Tooltip></div>
            }
        }, {
            title: '已发短信',
            key: 'sms_num',
            dataIndex: 'member.sms_stat.total',
        }, {
            title: '物流单号',
            key: 'ship_num',
            dataIndex: 'ship_num',
            // fixed: 'right',
            render: (text, record, index) => {
                if (record.ship_num) {
                    return <a
                        href={"https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd=" + record.ship_company + "%20" + record.ship_num}
                        target="_blank" rel="noopener noreferrer">{text}</a>
                }
            }
        }, {
            title: '操作',
            width: 100,
            dataIndex: 'operation',
            // fixed: 'right',
            render: (text, record, index) => {
                return (
                    <div>
                        <Button onClick={this.handleDetail.bind(this, record)}><Icon
                            type="eye"/>详情</Button>
                    </div>
                )
            }
        }]
        const getStoreTypeName = (id) => {
            let _item = config.store_types.filter((item) => {
                return item.id === id
            })
            return _item[0].name

        }
        const getStoreOptions = () => {
            let options = [<Option key="all" value="" label="全部店铺">全部店铺</Option>], list = this.props.crm_stores.list

            list.map((d) => {
                options.push(<Option key={d.id + ''} value={d.id + ''}
                    label={d.name}>【{getStoreTypeName(d.type)}】{d.name}</Option>)
            })
            return options
        }
        return (
            <div className={"page " + styles.order}
                style={{height: pageHeight}}>
                <div className="page-options">
                    <Row>
                        <Col span="12">
                            <Button type="primary" onClick={this.handleImport} icon="select">导入订单</Button>
                        </Col>
                        <Col span="12" className="textRight">
                        </Col>
                    </Row>
                </div>
                <div className={styles.filter} style={{overflowX: 'hidden',paddingBottom:0}}>
                    <Row gutter={8} style={{marginBottom: 16}}>
                        <Col span="6">
                            <Select placeholder="请选择店铺" onChange={this.handleChange.bind(this, 'store_id')}
                                value={params.store_id + ''}
                                style={{width: '100%'}}>
                                {getStoreOptions()}
                            </Select>
                        </Col>
                        <Col span="6">
                            <Input placeholder="请输入会员名或订单号" value={params.query}
                                onKeyDown={this.handleQueryKeydown}
                                onChange={this.handleChange.bind(this, 'query')}/>
                        </Col>
                        <Col span="6">
                            <RangePicker
                                showTime
                                format={DateTimeFormat}
                                placeholder={['开始时间', '结束时间']}
                                onChange={this.handleChangeDate} style={{width: '100%'}}/>
                        </Col>
                        <Col span="6">
                            <Button type="primary" onClick={this.handleSearch} icon="search">搜索</Button>
                        </Col>
                    </Row>
                </div>
                <div className={styles.list}>
                    {total ?
                        <div className={styles.options} style={{paddingBottom: 20}}>
                           共找到{total}条记录
                        </div>
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
                        onChange={this.handlePageChange}
                    />
                </div>
                {importModal ? <ImportOrder {...this.props} reload={this.handlePageChange}/> : ''}
                {detailModal ? <Detail {...this.props} /> : ''}

            </div>)
    }
}
