/**
 **@Description:
 **@author: 吴明
 */

import React, {Component} from 'react'
import {  Divider, Table, Pagination } from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import Page,{ DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from '../../../../components/business/Page'
import {Link} from 'dva/router'
import styles from './index.less'

const DEFAULT_CONDITION = {

}

@connect(({base,mall_account}) => ({
    base,
    mall_account
}))
@documentTitleDecorator({
    title:'商城流水'
})
export default class Index extends Page.ListPureComponent {
    constructor ( props) {
        super(props)
        this.state = {
            totalOpen:true,
            sevenOpen:true,
            condition: {...DEFAULT_CONDITION},
            pager: {...DEFAULT_PAGER},
            loading: false
        }
    }

    initPage = (isSetHistory = false) =>{
        
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)

        this.getPageData(this.state.condition, pager, isSetHistory)
    }

    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }

        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })

        this.props.dispatch({
            type: 'mall_account/accountList',
            payload: {
                //当前页
                page: pager.current -1,
                //每页条数
                per_page: pager.pageSize
            },
            callback:() =>{
                this.setState({
                    loading: false
                })
            }
        })
    }

    componentDidMount () {
        super.componentDidMount()
        this.getSeventIncome()
    }

    // 获取近7日统计
    getSeventIncome () {
        this.props.dispatch({
            type: 'mall_account/sevenIncome',
            payload: {
            },
            callback:() =>{
            }
        })
    }

    handleMonthIncome = () =>{
        var totalOpen = this.state.totalOpen
        this.setState({
            totalOpen:!totalOpen
        })
    }
    handleSevenIncome = () => {
        var sevenOpen = this.state.sevenOpen
        this.setState({
            sevenOpen:!sevenOpen
        })
    }
    render() {
        const columns = [{
            title: '结算日期',
            dataIndex: 'end_at',
            key: 'end_at',
            render:(text,record) => {
                return (
                    <div>{`${text.substr(0,10)}`}</div>
                )
            }

        },{
            title: '金额（￥）',
            dataIndex: 'amount',
            key: 'amount',
            render:(text,record) => {
                return (
                    record.amount>0 ? <div className={styles.rise}>+{ `${(record.amount/100).toFixed(2)}`}</div>:<div className={styles.decline}>{`${(record.amount/100).toFixed(2)}`}</div>
                )
            }
        },{
            title: '操作',
            render:(text,record) => {
                return (
                    <div>
                        <Link to={{pathname:'/mall/account/account_detail',query:{id:record.id }}}>详情</Link>
                    </div>
                )
            }
        }]
        const { totalOpen,sevenOpen, loading } = this.state
        const { accountList,count,sevenIncome, monthIncome} = this.props.mall_account

        
        return (
            <Page className={styles.formSearch}>
                <Page.ContentHeader
                    title="商城流水"
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E8%99%8E%E8%B5%9E%E5%B0%8F%E5%BA%97/%E5%95%86%E5%9F%8E%E6%B5%81%E6%B0%B4.md"
                />
                <div className={styles.income}>
                    <div>
                        <p>
                            <span style={{color:'#333'}}>累计总销售额</span>
                            <i className={ `${totalOpen ? styles.open : styles.close}`} onClick={this.handleMonthIncome}></i>
                        </p>
                        <p>￥{ `${totalOpen?(monthIncome/100).toFixed(2):'******'}`}</p>
                    </div>
                    <div>
                        <p>
                            <span style={{color:'#333'}}>最近7日销售额</span>
                            <i className={ `${ sevenOpen ? styles.open : styles.close}`}   onClick={this.handleSevenIncome}></i>
                        </p>
                        <p>￥{`${sevenOpen?(sevenIncome/100).toFixed(2):'******'}`}</p>
                    </div>
                </div>
                <Table
                    pagination={false}
                    columns={columns}
                    loading= {loading}
                    rowKey={record => record.id}
                    dataSource={accountList}/>
                {accountList.length? (
                    <Pagination
                        className="ant-table-pagination"
                        total={count}
                        current={this.state.pager.current}
                        showQuickJumper={true}
                        showTotal={total => `共${count}条记录`}
                        pageSize={ this.state.pager.pageSize }
                        pageSizeOptions= {['10','20','50','100']}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleListPageChangeSize}
                        onChange={this.handleListPageChange}
                    />
                ) : (
                    ''
                )}
            </Page>
        )
    }
}
