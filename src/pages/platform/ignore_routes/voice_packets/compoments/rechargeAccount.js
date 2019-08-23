/**
 **@Description:
 **@author: wuming
 */

import React, { Component } from "react"
import { Modal,Input ,Form,Col,Row} from "antd"
import { connect } from "dva"
import styles from "./index.less"
import router from 'umi/router'
import {jine} from '../../../../../utils/display'


@connect(({base, platform_voicepacket }) => ({
    base,platform_voicepacket
}))
@Form.create()
export default class Index extends Component {
    state = {
        money:'',
        isShow:false,
        isDisabled:false,
        activityRate:''
    }
    FIRST_RECHARGE = 0.06

    DEFAULT_DATE=[
        {
            money:5000,
            rate: 0.06
        },
        {
            money:10000,
            rate:0.04
        }
    ]
    componentDidMount(){
        this.props.dispatch({
            type:'platform_voicepacket/checkFirstRecharge',
            payload:{},
            callback:(value)=>{
                const { rate ,checkFirstRecharge } = this.props.platform_voicepacket
                let reallyRate = rate
                if(checkFirstRecharge === 1 ){
                    reallyRate = this.FIRST_RECHARGE
                }
                if(reallyRate > rate){
                    reallyRate = rate
                }
                this.setState({
                    activityRate:reallyRate
                })
            }
        })
    }
    handleCancel = () => {
        this.props.onCancel && this.props.onCancel('1')
        this.props.form.setFieldsValue({
            money:''
        })
        this.setState({
            isShow:false,
            money:'',
            isDisabled:false
        })
    }
    validatorLimit =(rule, value, callback) => {
        const { rate ,checkFirstRecharge } = this.props.platform_voicepacket
        let activity_rate = ''
        if(!isNaN(value)){
            this.setState({
                money:value-0
            })  
        }
        if( checkFirstRecharge  === 1){
            activity_rate = this.FIRST_RECHARGE
            if(value>=this.DEFAULT_DATE[1].money){
                activity_rate = this.DEFAULT_DATE[1].rate
            } 
        }else{
            if(value>=this.DEFAULT_DATE[1].money){
                activity_rate = this.DEFAULT_DATE[1].rate
            }else if( value>=this.DEFAULT_DATE[0].money){
                activity_rate = this.DEFAULT_DATE[0].rate
            }else{
                activity_rate = rate
            } 
            
        }
        if(activity_rate > rate){
            activity_rate = rate
        }
        this.setState({activityRate:activity_rate})


        if(!(/^\d+(\.\d{1,2})?$/.test(value)) && value){
            this.setState({
                isShow:false
            })
            callback('请正确输入充值金额（最多2位小数）')
        }else if(value>20000 || value<100 || !value){
            this.setState({
                isShow:false
            })
            callback('请输入充值金额（100.00 - 20000.00）')
        }else{
            this.setState({
                isShow:true
            })
            callback()
        } 
    }
    rateMoney = (value) =>{
        // const { rate } = this.props.platform_voicepacket
        const { activityRate } = this.state
        return (value*(1-activityRate)).toFixed(2)
    }
    handleOk = (e) =>{
        e.preventDefault() 
        this.props.form.validateFields((err, values) => {
            if(!err){
                const {money} = this.state
                this.setState({
                    isDisabled:true
                })
                this.props.dispatch({
                    type:'platform_voicepacket/recharge',
                    payload:{
                        amount: Number(money*100)
                    },
                    callback:(data)=>{
                        this.props.onCancel()
                        this.props.form.setFieldsValue({
                            money:''
                        })
                        this.setState({
                            isShow:false,
                            money:'',
                            isDisabled:false
                        })
                        window.open('/platform/voice_packets/wechatPay?no='+data.no,'_blank')
                    }
                })
            }
        }) 
    }
    handleChooseMoney =(value)=>{
        const {money} = this.state
        const { rate ,checkFirstRecharge } = this.props.platform_voicepacket
        if(value === money ){
            this.props.form.setFieldsValue({
                money:''
            })
            this.setState({
                money:'',
                isShow:false
            })
        }else{
            this.props.form.setFieldsValue({
                money:value
            })
            this.setState({
                money:value,
                isShow:true,
            })
        }

        let activity_rate = rate
        if( checkFirstRecharge  === 1){
            activity_rate = this.FIRST_RECHARGE
            
        }

        if(activity_rate > rate){
            activity_rate = rate
        }
        
        this.setState({
            activityRate:activity_rate
        })
        
    }
    render() {
        const formItemLayoutModel= {
            labelCol: {
                span: 4,
                style: {
                    // width: '80px',
                    textAlign: 'left'
                },
            },
            wrapperCol: {
                span: 20,
            },
        }
        const { getFieldDecorator } = this.props.form
        const { money,isShow,isDisabled}  = this.state
        const { rate  } = this.props.platform_voicepacket
        const { activityRate  } = this.state
        return (
            <Modal
                title="金额充值"
                visible={this.props.visible}
                className={styles.recharge}
                onOk={this.handleOk}
                maskClosable={false}
                okButtonProps={{ disabled: isDisabled }}
                width={600}
                okText="确定"
                cancelText="取消"
                onCancel={this.handleCancel}
            >
                <Form layout="horizontal" className="hz-from-search">
                    <Row>
                        <Col>
                            <Form.Item label="充值金额：" {...formItemLayoutModel}>
                                {getFieldDecorator('money', {
                                    rules: [
                                        { validator:this.validatorLimit}
                                    ],
                                })(
                                    <Input  placeholder="请输入充值金额"/>
                                )}  
                                <span style={{marginLeft:8,marginRight:8}}>元</span>
                                
                            </Form.Item>
                        </Col>
                        <Col>
                            <span  className={isShow ? styles.receive : styles.none  }>到账<span style={{color:'#000'}}>{this.rateMoney(money)}</span>元（含{(activityRate*100).toFixed(2)}%服务费）</span>
                        </Col>
                        <Col>
                            <Form.Item label="选择金额：" {...formItemLayoutModel}>
                                <Row>
                                    <Col span={11} className={ money ===100 ?styles.active:''}  onClick={()=>{this.handleChooseMoney(100)}}>
                                        <div><span  className={styles.rechargeMoney}>100</span>元</div>
                                        <div className={styles.intoAccount}>到账<span>{(100*(1-rate)).toFixed(2)}</span>元（含{(rate*100).toFixed(2)}%服务费）</div>
                                        <span className={styles.radic}>&radic;</span>
                                    </Col>
                                    <Col span={11} offset={1}  className={ money ===200 ?styles.active:''}  onClick={()=>{this.handleChooseMoney(200)}}>
                                        <div><span  className={styles.rechargeMoney}>200</span>元</div>
                                        <div className={styles.intoAccount}>到账<span>{(200*(1-rate)).toFixed(2)}</span>元（含{(rate*100).toFixed(2)}%服务费）</div>
                                        <span className={styles.radic}>&radic;</span>
                                    </Col>
                                    <Col span={11} style={{marginTop:16}} className={ money ===500 ?styles.active:''}  onClick={()=>{this.handleChooseMoney(500)}}>
                                        <div><span  className={styles.rechargeMoney}>500</span>元</div>
                                        <div className={styles.intoAccount}>到账<span>{(500*(1-rate)).toFixed(2)}</span>元（含{(rate*100).toFixed(2)}%服务费）</div>
                                        <span className={styles.radic}>&radic;</span>
                                    </Col>
                                    <Col span={11}  offset={1} style={{marginTop:16}} className={ money ===1000 ?styles.active:''} onClick={()=>{this.handleChooseMoney(1000)}}>
                                        <div><span  className={styles.rechargeMoney}>1000</span>元</div>
                                        <div className={styles.intoAccount}>到账<span>{(1000*(1-rate)).toFixed(2)}</span>元（含{(rate*100).toFixed(2)}%服务费）</div>
                                        <span className={styles.radic}>&radic;</span>
                                    </Col>
                                </Row>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}
