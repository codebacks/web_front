import React from 'react'
import { connect } from 'dva'
import { Form, Row, Col, Popover,DatePicker,Icon} from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page from 'components/business/Page'
import { SHOP_TYPE,getMappingDecByType } from '@/common/shopConf'
import MessageView from '@/pages/crm/components/MessageManage/MessageView'
import { datetime,jine } from 'utils/display'
import moment from 'moment'
import styles from './index.less'
const FormItem = Form.Item;


const USER_POOL ={
    2:'未加粉',
    1:'已加粉'
}
const  MESSAGE_TYPE={
    1:'营销',
    2:'加粉'
}
const { RangePicker } = DatePicker

const unsubscribe = '回复0屏蔽'
const unsubscribeYX = '回T退订'
@connect(({ atuo_send_message, crm_customerPool }) => ({
    atuo_send_message, crm_customerPool
}))
@Form.create()
@documentTitleDecorator({
    title: '自动发送'
})

export default class extends React.Component {
    state ={
        send_count:0,
        textLength:0,
        text:'',
        unsubscribe:''
    }
    componentDidMount(){
        this.getAutoDetail()
        this.getShops()
    }
    getShops = () => {
        this.props.dispatch({
            type: 'crm_customerPool/getShops'
        })
    }
    getAutoDetail=()=>{
        const query = this.props.location.query
        this.props.dispatch({
            type: 'atuo_send_message/getAutoSend',
            payload: {id:query.id},
            callback:()=>{
                this.onChangeTextArea()
            }
        })
    }
    onChangeTextArea = () => {
        const {  detail } =this.props.atuo_send_message
        let value =`【${detail.template_configs.sms_sign}】${detail.template_configs.sms_content}`
        let unsubscribes = detail.template_type ===1?unsubscribeYX:unsubscribe
        let  text =`${value}${unsubscribes}`

        let send_count=   text.length>70?Math.ceil(text.length/67):1

        
        this.setState({
            send_count,
            text,
            textLength: text.length
        })
    }
    render() {
        const content = <div>
                <p>单条70个字,超出70个字将按照67个字每条计算</p>
                <p>一个汉字,数字,字母,空格都算一个字 </p>
                <p>带标签的短信按实际发出的长度计算</p>
            </div>   
        const formItemLayout = {
            labelCol: {
                span: 3,
                style: {
                    width: '80px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 18,
                style: {
                    width: '320px',
                },
            },
        }

        const {  detail } =this.props.atuo_send_message
        let shop_name = detail.shop_name?detail.shop_name:'不限'
        let platform = detail.platform_type?`${getMappingDecByType(detail.type)}/${shop_name}`:'不限'
        return <Page>
            <Page.ContentHeader
                breadcrumbData={[{
                    name: '自动发送',
                    path: '/crm/automatic_send/'
                }, {
                    name: '任务详情'
                }]}
            />
            <Page.ContentBlock title='基础规则' hasDivider={false}>
                <Form layout="horizontal">
                    <Row>
                        
                        <FormItem label="任务名称：" {...formItemLayout} >
                            {detail.name}
                        </FormItem>
                        
                    </Row>
                    <Row>
                        <FormItem {...formItemLayout} label="每日发送：" >
                            {detail.limit_every_day_count? `限发${detail.limit_every_day_count}条`:'不限'}
                        </FormItem>
                    </Row> 
                    <Row>
                    <FormItem {...formItemLayout} label="发送过滤：" >
                        {detail.filter_repeated_days?`过滤${detail.filter_repeated_days}天内发送过的客户`:'不限'}
                    </FormItem>
                    <FormItem {...formItemLayout} label="发送时间段：" >
                        {detail.min_send_hour?`${detail.min_send_hour}至${detail.max_send_hour}`:''}
                    </FormItem>
                </Row> 
                </Form>
            </Page.ContentBlock>

            <Page.ContentBlock title='发送人群' hasDivider={false}>
                <Form layout="horizontal">
                    <Row>                        
                        <FormItem label="所属店铺：" {...formItemLayout}>
                            {platform}
                        </FormItem>                        
                    </Row>
                    <Row>                        
                        <FormItem label="是否加粉：" {...formItemLayout}>
                           {detail.is_wechat_binded?USER_POOL[detail.is_wechat_binded]:'不限'}
                        </FormItem>                        
                    </Row>
                    <Row>                    
                        <FormItem label="创建时间：" {...formItemLayout}>
                            {detail.created_at_end&&detail.created_at_begin?`${datetime(detail.created_at_begin,'YYYY-MM-DD')}~${datetime(detail.created_at_end,'YYYY-MM-DD')}`:'不限'}              
                        </FormItem>
                    </Row>
                    <Row>                        
                        <FormItem label="订单总额：" {...formItemLayout}>
                            {detail.amount_max?`${jine(detail.amount_min,'','Fen')}~${jine(detail.amount_max,'','Fen')}`:'不限'}
                        </FormItem>                       
                    </Row>
                    <Row>                       
                        <FormItem label="平均单价：" {...formItemLayout}>
                        {detail.average_amount_max?`${jine(detail.average_amount_min,'','Fen')}~${jine(detail.average_amount_max,'','Fen')}`:'不限'}
                        </FormItem>
                        
                    </Row>
                </Form> 
            </Page.ContentBlock>
            <Page.ContentBlock title='短信内容' hasDivider={false}>
                <Row style={{position:'relative'}}>
                    <Col>
                        <Form layout="horizontal">
                            <Row>                        
                                <FormItem label="短信类型：" {...formItemLayout}>
                                    {MESSAGE_TYPE[detail.template_type]}
                                </FormItem>                        
                            </Row>
                            <Row>                        
                                <FormItem label="短信内容：" {...formItemLayout}>
                                {this.state.text}
                                </FormItem>                        
                            </Row>
                            <Row>                    
                                <FormItem label="短信字数：" {...formItemLayout}>
                                    <div className={styles.area_title}>
                                        <p>已输入<span>{this.state.textLength}</span>个字   预估计费为<span>{this.state.send_count} </span> 条</p>
                                        <p className={styles.charge_rule}>
                                            计费规则
                                            <Popover placement="bottomLeft" content={content} arrowPointAtCenter>
                                                <Icon
                                                    type="question-circle"
                                                    style={{ marginLeft: 8 }}
                                                />
                                            </Popover>
                                        </p>
                                    </div>            
                                </FormItem>
                            </Row>
                        </Form>
                    </Col> 
                    <Col style={{width:268,position:'absolute',bottom:40,left:600}} >
                        <MessageView  content={this.state.text}/>
                    </Col>
                </Row>
            </Page.ContentBlock>
        </Page>
    }


}