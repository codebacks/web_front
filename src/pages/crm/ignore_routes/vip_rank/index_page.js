import React, { Component } from 'react'
import { connect } from 'dva'
import { Table, Modal, Badge } from 'antd'
import Page from '../../../../components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import EditeModal from './modals/EditeModal'
import {jine} from '../../../../utils/display'
import { getImageAbsoulteUrl } from '@/utils/resource'

// 会员等级状态，1-使用中 2-关闭
const STATUS = {
    open: 1,
    close: 2
}
@connect(({ base, vip_data }) => ({
    base,
    vip_data,
}))
@documentTitleDecorator({
    title:'会员等级'
})
export default class Index extends Component {
    state = {
        visible: false,
        loading: false,
        item: {},
    }
    componentDidMount () { 
        this.getInitData()
    }
    getInitData = () => { 
        this.setState({
            loading: true,
        })
        this.props.dispatch({
            type: 'vip_data/vipRankList',
            payload: {},
            callback: ()=>{
                this.setState({
                    loading: false,
                })
            }
        })
    }
    changeStatus = (item, status) => { 
        this.props.dispatch({
            type: 'vip_data/vipRankUpdate',
            payload: {
                id: item.id,
                name: item.name,
                status: status,
                icon_url: item.icon_url,
                level: item.level&&(item.level + ''),
                min_count: item.min_count,
                min_amount: item.min_amount,
            },
            callback: () => { 
                this.getInitData()
            }
        })
    }
    onClickUpdate = (item)=>{
        this.setState({
            visible: true,
            item: item,
        })
    }
    onChangeCheck = (item) => {
        let _this = this
        let tips, status, title
        if (item.status === STATUS.open) {
            title= '确认禁用'
            tips = '禁用该会员等级后，次日生效。归属该等级的会员均降到下一级，若当前会员等级为最后一级，则降为普通客户'
            status = STATUS.close
        } else { 
            title= '确认启用'
            tips = '启用该会员等级后，次日生效。请及时设置升级条件'
            status = STATUS.open
        }
        Modal.confirm({
            title: title,
            content: tips,
            onOk () { 
                _this.changeStatus(item, status)
            },
            onCancel () {}
        })
    }
    onChangeVisible = (flag) => {
        this.setState({
            visible: flag,
        })
    }
    render () {
        //定义表格顶部字段
        const columns = [
            {
                title: '会员图标',
                dataIndex: 'icon_url',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    return <div className={styles.vipIcon}>{item.icon_url&&(<img src={getImageAbsoulteUrl(item.icon_url)} alt=''/>)}</div>
                }
            },
            {
                title: '会员名称',
                dataIndex: 'name',
                className: 'hz-table-column-width-100'
            },
            {
                title: '会员条件',
                dataIndex: 'condition',
                className: 'hz-table-column-width-120',
                render: (value,item,index) => {
                    let con_one = `购物次数≥${item.min_count}次`
                    let con_two = `购物金额≥${jine(item.min_amount, '', 'Fen')}元`
                    if(item.type === 1){
                        return <span>{con_two}</span>
                    }
                    if(item.type === 2){
                        return <span>{con_one}</span>
                    }
                    if(item.type === 3){
                        return <span>{`${con_one}或${con_two}`}</span>
                    }
                    if(item.type === 4){
                        return <span>{`${con_one}且${con_two}`}</span>
                    } 
                    return <span>--</span>
                }
            },
            {
                title: '会员人数',
                dataIndex: 'count',
                className: 'hz-table-column-width-100',
                align: 'center'
            },
            {
                title: '使用状态',
                dataIndex: 'status',
                className: 'hz-table-column-width-100',
                render: (value,item,index) => {
                    let content
                    if(item.status === STATUS.open){
                        content = (<div>
                            <Badge status="success" />
                            <span>启用</span>
                        </div>)
                    }else{
                        content = (<div>
                            <Badge status="default" />
                            <span>关闭</span>
                        </div>)
                    }
                    return (
                        <div>{content}</div>
                    )
                }
            },
            {
                title: '操作',
                className: 'hz-table-column-width-80',
                render: (value,item,index) => {
                    return (
                        <div className={styles.operate}>
                            <div className={styles.operateChild}>
                                <span onClick={()=>this.onClickUpdate(item)}>编辑</span>
                            </div>
                        </div>
                    )
                }
            }
        ]
        const { vipRankList } = this.props.vip_data
        return (
            <Page>
                <Page.ContentHeader
                    title='会员等级'
                    helpUrl='http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E4%BC%9A%E5%91%98%E8%AE%BE%E7%BD%AE.md'
                />
                <div className={styles.head}>
                    <div className={styles.headTit}>温馨提示</div>
                    <div>
                        <div className={styles.headCon}>1. 购物次数、购物金额数据均为已同步至本系统的交易完成订单数据；</div>
                        <div className={styles.headCon}>2. 各平台的购物账号绑定到会员的同一个微信号下，其相应的订单数据也计于该微信号下；</div>
                        <div className={styles.headCon}>3. 会员条件修改后，将于次日生效，仅作用于新增会员数据，历史会员数据不做更新，不建议频繁修改，请慎重考虑后设置；</div>
                        <div className={styles.headCon}>4. 系统支持设置不同维度的会员条件，若同时满足不同会员条件时，将最优匹配至高等级会员中。</div>
                    </div>
                </div>
                <div className={styles.TableWarp}>
                    <Table
                        columns={columns}
                        dataSource={vipRankList}
                        pagination={false}
                        rowKey='level'
                        loading={this.state.loading}
                    />
                </div>
                <EditeModal
                    visible={this.state.visible}
                    onChange={this.onChangeVisible}
                    item={this.state.item}
                    key={this.state.visible}
                />
            </Page>
        )
    }
}
