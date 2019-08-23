/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import {  Table, Pagination } from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'components/business/Page'
import {Link} from 'dva/router'
import styles from './index.less'

@connect(({mall_account,base}) => ({
    base,
    mall_account
}))

@documentTitleDecorator({
    title:'账户详情'
})
export default class Index extends Component {
    constructor ( props) {
        super(props)
        this.state = {
            //当前页
            page: 1,
            //每页条数
            per_page: 10,
            id:''
        }
    }

    componentDidMount () {
        let id =  this.props.location.query.id
        this.setState({
            id:id
        },function(){
            this.getData(this.state.page,this.state.per_page)
            this.accountDetail()
        })

    }
    // 获取账户数据
    getData (page,per_page) {
        this.props.dispatch({
            type: 'mall_account/accountDetailList',
            payload: {
                //当前页
                page: page -1,
                //每页条数
                per_page: per_page,
                id : this.state.id
            },
            callback:() =>{
            }
        })
    }
    // 获取近7日金额和结算时间
    accountDetail () {
        this.props.dispatch({
            type: 'mall_account/accountDetail',
            payload: {
                id:this.state.id
            },
            callback:() =>{
            }
        })
    }

    handleTableChange = (value) => {
        this.setState({
            page:value
        })
        this.getData(value,this.state.per_page)
    }

    toSelectchange = (value,pageSize) =>{
        this.setState({
            page:value,
            per_page: pageSize
        })
        this.getData(value,pageSize)
    }
    render() {
        const columns = [{
            title: '订单生成时间',
            dataIndex: 'created_at',
            key: 'created_at'
        },{
            title: '交易时间',
            render:(text,record) => {
                return (
                    record.belongto ===1 ? <div>{record.paid_at}</div>:<div>{record.refund_at}</div>
                )
            }
        },{
            title: '订单编号',
            render:(text,record) => {
                return (
                    record.belongto ===1 ? <div>{record.order_no}</div>:<div>{record.order.no}</div>
                )
            }
        },{
            title: '退款编号',
            render:(text,record) => {
                return (
                    record.belongto ===2 ? <div>{record.no}</div>:'--'
                )
            }
        },{
            title: '金额（￥）',
            dataIndex: 'amount',
            key: 'amount',
            render:(text,record) => {
                return (
                    record.belongto ===1 ? <div className={styles.rise}>+{ `${(record.amount/100).toFixed(2)}`}</div>:<div className={styles.decline}>-{`${(record.amount/100).toFixed(2)}`}</div>
                )
            }
        },{
            title: '操作',
            render:(text,record) => {
                return (
                    <div>
                        <Link to={{pathname:'/mall/order_list/order_detail',query:{id:record.order_id }}}>详情</Link>
                    </div>
                )
            }
        }]
        const { per_page, page} = this.state
        const { accountDetailList,count,loading,amount,time} = this.props.mall_account
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '商城流水',
                        path: '/mall/account'
                    },{
                        name: '账户详情'
                    }]}
                />
                <div className={styles.income}>
                    <span>金额：<i>￥{`${(amount/100).toFixed(2)}`}</i></span>
                    <span>结算日期：{`${time.substr(0,10)}`}</span>
                </div>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={(record,index )=>index}
                    dataSource={accountDetailList}/>
                {accountDetailList.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={page}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ per_page }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.toSelectchange.bind(this)}
                        onChange={this.handleTableChange.bind(this)}
                    />
                ) : (
                    ''
                )}
            </Page>
        )
    }
}
