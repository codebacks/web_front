/**
 **@author: 吴明
 */

import React,{Fragment} from 'react'
import { connect } from 'dva'
import Page  from '../../../../components/business/Page'
import { Modal, Spin,Table } from 'antd'
import styles from './index.less'
import { datetime,jine } from '@/utils/display'

const PAY_TYPE={
    1:"未付款",
    3:'已完成',
    4:'待发货',
    5:'已发货',
    6:'已关闭'
}
const ORDER_TYPE={
    1:"社交零售软件购买",
    2:'社交零售手机购买',
    3:'社交零售短信充值' 
}
@connect(({ setting_service_log }) => ({
    setting_service_log
}))

export default class ActivitiesDetails extends React.Component {
    state = {
        visible: false,
        loading: true,
        type:[]
    }

    componentDidMount() {
        const { data  } = this.props.setting_service_log 
        const {index } = this.props
        if(data.length>0){
            this.setState({
                type:data[index].order_item.map(item=>item.type)
            }) 
        }
    }

    getDetailsModal = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/activitiesDetail',
            payload: {
                activity_id: id,
            },
            callback: () => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    handleCancel = () => {
        this.props.onClose && this.props.onClose()
    }

    belongToOrderNo =()=>{
        const { data  } = this.props.setting_service_log 
        const {index } = this.props
        let bugPhone=data[index].order_item.length>1? data[index].order_item.filter(item=>item.type === 2):[]
        if(bugPhone.length>0){
            return bugPhone[0].no
        }
        return false
    }


    logistic = (record)=>{
        if(record.express_no){
            if(record.express_name === '顺丰速运'){
                return <a href={"http://www.sf-express.com/cn/sc/dynamic_function/waybill/#search/bill-number/" + record.express_no} target="_blank" rel="nofollow noopener noreferrer">{record.express_no}</a>
            }
            return <a href="https://www.ickd.cn" target="_blank" rel="nofollow noopener noreferrer" >{record.express_no}</a>
        }else{
            return '--'
        }
    }
    render() {
        const { data , total } = this.props.setting_service_log 
        const {index, visible } = this.props
        const { type } = this.state
        const baseInfo = new Array(data[index])
        const columnsBase = [{
            title: '订单信息',
            key:'1',
            width:300,
            render:(text,record)=>{
                return <Fragment>
                    <p><strong>订单类型：</strong>{ORDER_TYPE[record.type]}</p>
                    <p><strong>订单编号：</strong>{record.no}</p>
                    {/*
                        this.belongToOrderNo()? <p style={{whiteSpace:'normal', wordBreak:'break-all'}}><strong>从属子订单号：</strong>  {this.belongToOrderNo()}</p>:''
                    */}
                    <p><strong>下单时间：</strong>{record.created_at}</p>
                    <p><strong>付款时间：</strong>{record.paid_at?record.paid_at:'--'}</p>
                    {
                        type.includes(2)?<p><strong>发货时间：</strong>{record.delivery_at?record.delivery_at:'--'}</p>:""
                    }
                    {
                        type.includes(3) || type.includes(1) && type.includes(2) ===false?<p><strong>完成时间：</strong>{record.completed_at?record.completed_at:'--'}</p>:''
                    }
                    <p><strong>订单状态：</strong>{PAY_TYPE[record.status]}</p>
                </Fragment>
            }
        },{
            title: '收货信息',
            key:'2',
            width:350,
            render:(text,record)=>{
                return <Fragment>
                    <p><strong>收货人姓名：</strong>{record.consignee?record.consignee:'--'}</p>
                    <p><strong>收货人手机：</strong>{record.mobile?record.mobile:'--'}</p>
                    <p><strong>收货人地址：</strong>{record.receiver_address?record.receiver_address:'--'}</p>
                </Fragment>
            }
        },{
            title: '物流信息',
            key:'3',
            width:310,
            render:(text,record)=>{
                return <Fragment>
                    <p><strong>物流公司：</strong>{record.express_name?record.express_name:'--'}</p>
                    <p style={{whiteSpace:'normal', wordBreak:'break-all'}}><strong>物流单号：</strong>{this.logistic(record)}
                    </p>
                </Fragment>
            }
        }]

        const columnsCommodity = [{
            title: '商品名称',
            dataIndex: 'name',
            key:'name'
        },{
            title: '数量',
            dataIndex: 'count',
            key:'count',
            align:'center'
        },{
            title: '单价(元)',
            dataIndex: 'price',
            key:'price',
            align:'right',
            render:(text)=>jine(text,'','Fen')
        },{
            title: '金额(元)',
            dataIndex: 'amount',
            key:'amount',
            align:'right',
            render:(text)=>jine(text,'','Fen')
        }]
        return (
            <div>{
                data.length>0?<Modal
                    title="详情"
                    footer={null}
                    width={960}
                    className ={styles.baseInfo}
                    visible={visible}
                    onCancel={this.handleCancel}
                >
                    <Table
                        pagination={false}
                        columns={columnsBase}
                        dataSource={baseInfo}
                       
                        loading={false}
                        bordered={true}
                        rowKey={(record,index)=>index}
                    />
                    <Page.ContentBlock title='商品信息' hasDivider={false}>
                        <Table
                            pagination={false}
                            columns={columnsCommodity}
                            dataSource={data[index]?data[index].order_item:[]}
                            loading={false}                           
                            rowKey={record => record.id}
                        />
                    </Page.ContentBlock>
                    <div  className={styles.totalAmount}>
                        { 
                            data[index].save_amount!=0 ?<span><strong>优惠金额：</strong>-￥{jine(data[index].save_amount,'','Fen')}</span>:''
                        }    
                        <strong style={{marginLeft:16}}>总计金额：</strong><span className={styles.paid_amount}>￥{jine(data[index].pay_amount === 0?1:data[index].pay_amount,'','Fen')}</span>
                    </div>
                </Modal>:""
            }              
            </div>
        )
    }
}
