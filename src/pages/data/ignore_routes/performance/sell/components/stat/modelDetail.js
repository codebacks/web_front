import React, {Fragment} from 'react'
import {Modal,Table,Pagination} from 'antd'
import {jine} from '@/utils/display'
import {connect} from 'dva'
import styles from './modelDetail.less'
const DEFAULT_DATA={
    "1_1":'付款客户数列表',
    "1_2":'付款订单数列表',
    '2_1':'成功交易客户数列表',
    '2_2':'成功交易订单数列表'
}

const  type={
    '2':'（ 按员工查看 ）',
    '1':'（ 按微信号查看 ）'
}
@connect(({ base, data_performance_sell}) => ({
    base, data_performance_sell
}))


export default class modelDetail extends React.Component{
    constructor(props){
        super(props)
        this.state={
            current:1,
            limit:10
        }
    }
    componentDidMount (){
        const {metric_mode,view_mode} = this.props
        if(metric_mode && view_mode){
            this.getData()
        }  
    }
    getData =(current=this.state.current ,page_size = this.state.limit)=>{
        const {user_id,wechat_id,metric_mode,view_mode} = this.props
        const { params } = this.props.data_performance_sell
        this.props.dispatch({
            type:'data_performance_sell/getPerformanceDetail',
            payload:{
                start_at: params.start_at,
                end_at: params.end_at,
                user_id:params.type === '2' ? user_id:'',
                wechat_id:params.type === '1' ? wechat_id:'',
                metric_mode:metric_mode,
                platform:params.platform,
                shop_id:params.shop_id,
                view_mode:view_mode,
                offset:(current-1)*page_size,
                limit:page_size
            },
            callback:()=>{
                this.setState({
                    current:current,
                    limit: page_size
                })
            }
        })
    }
    goToPage = (current,page_size)=>{
        this.getData(current,page_size)
    }

    handleChangeSize = (current,page_size) =>{
        this.getData(1,page_size)
    }

    handleCancel = () =>{
        this.props.handleCancelModel()
    }
    render(){
        const {visible,metric_mode,view_mode} = this.props
        const {current,limit} = this.state
        const {params,detailTotal,detailList,detailLoading} = this.props.data_performance_sell
        const column1=[
            {
                title:'微信昵称',
                width:150,
                dataIndex:'customer_wechat_nickname',
                key:'customer_wechat_nickname',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'微信备注',
                width:150,
                dataIndex:'customer_wechat_remark',
                key:"customer_wechat_remark",
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'微信号',
                width:200,
                dataIndex:'customer_wechat',
                key:'customer_wechat',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'付款订单数',
                dataIndex:'customer_order_count',
                key:'customer_order_count',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            }
        ]
        const column2=[
            {
                title:'付款订单号',
                width:250,
                dataIndex:'order_no',
                key:'order_no',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'商品数量',
                width:100,
                dataIndex:'num',
                key:'num',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'订单金额（元）',
                width:150,
                dataIndex:'payment_amount',
                key:'payment_amount',
                render:(text,record,index)=>{
                    return text? <span>{jine(text,'','Fen')}</span>:<span>--</span>
                }
            },
            {
                title:'店铺名称',
                width:200,
                dataIndex:'shop_name',
                key:"shop_name",
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'平台类型',
                width:200,
                dataIndex:'platform',
                key:'platform',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'所属客户',
                dataIndex:'customer_wechat_nickname',
                key:'customer_wechat_nickname',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            }
        ]
        const column4=[
            {
                title:'成功交易订单号',
                width:250,
                dataIndex:'order_no',
                key:'order_no',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'商品数量',
                width:100,
                dataIndex:'num',
                key:'num',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'订单金额（元）',
                width:150,
                dataIndex:'payment_amount',
                key:'payment_amount',
                render:(text,record,index)=>{
                    return text? <span>{jine(text,'','Fen')}</span>:<span>--</span>
                }
            },
            {
                title:'店铺名称',
                width:200,
                dataIndex:'shop_name',
                key:"shop_name",
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'平台类型',
                width:200,
                dataIndex:'platform',
                key:'platform',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'所属客户',
                dataIndex:'customer_wechat_nickname',
                key:'customer_wechat_nickname',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            }
        ]
        const column3=[
            {
                title:'微信昵称',
                width:150,
                dataIndex:'customer_wechat_nickname',
                key:'customer_wechat_nickname',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'微信备注',
                width:150,
                dataIndex:'customer_wechat_remark',
                key:"customer_wechat_remark",
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'微信号',
                width:200,
                dataIndex:'customer_wechat',
                key:'customer_wechat',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            },
            {
                title:'成功交易订单数',
                dataIndex:'customer_order_count',
                key:'customer_order_count',
                render:(text,record,index)=>{
                    return text? <span>{text}</span>:<span>--</span>
                }
            }
        ]

        const columnData = {
            '1_1':column1,
            '1_2':column2,
            "2_1":column3,
            "2_2":column4,
        }
        return(
            <Modal
                title={DEFAULT_DATA[`${metric_mode}_${view_mode}`]+''+type[params.type]}
                visible={visible}
                footer={null}
                width={1050}
                className={styles.detailModel}
                onCancel={this.handleCancel}
            >
                {   detailList && detailList.length>0?
                    params.type == 2 ?
                        <div className={styles.basicInfo}>
                            <span>员工：{detailList[0].user_nickname}</span>
                            <span>绑定微信数：{detailList[0].user_wechat_count}</span>
                        </div>:
                        <div className={styles.basicInfo}>
                            <span>微信：{detailList[0].wechat_nickname}</span>
                            <span>备注：{detailList[0].wechat_remark}</span>
                            <span>所属员工：{detailList[0].user_nickname}</span>    
                        </div>  
                    :''                   
                }
                <Table columns={columnData[`${metric_mode}_${view_mode}`]}     dataSource={detailList}  rowKey={(record, index) => index} pagination={false}  scroll={{ y: 600}}   loading={detailLoading}/>
                {
                    detailList && detailList.length>0?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={detailTotal}
                            showTotal={(detailTotal) => `共 ${detailTotal} 条`} 
                            showQuickJumper={true} 
                            showSizeChanger={true}  
                            pageSize={limit} 
                            pageSizeOptions= {['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goToPage} />
                        : ''
                }
            </Modal>
        )
    }
}