'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [吴明]
 */
import React from 'react'
import {connect} from 'dva'
import {Form, Row, Radio,  Col, Input, Button,Popover,message, Select,Icon } from 'antd'
import documentTitleDecorator from 'hoc/documentTitle'
import Page, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from 'components/business/Page'
import styles from './index.less'
import router from 'umi/router'
import  SendMessageModule from '@/pages/crm/components/MessageManage/SendMessageModule'
import { Link } from 'dva/router'
import moment from 'moment'

@connect(({ base, crm_customerPool}) => ({
    base, crm_customerPool
}))
@Form.create()

@documentTitleDecorator({
    title:'发送短信'
})
export default class  SendSms extends React.Component {
    constructor(props) {
        super()
        this.state = {
            type:1,
            value:1,
            data:['一','二'],
            form :{},
            visible:false,
            smsContent:[],
            sendCount:0,
            btnDisabled:false
        }
    }
    componentDidMount () {
        const {query} = this.props.location
        let obj =  window.localStorage.getItem('SMSMESSAGECOUNT') 
       if( obj ){
            obj = JSON.parse(obj) 
            if(obj.date === `${moment().year()}/${moment().month()}/${moment().date()}`){
                this.setState({
                    btnDisabled : true
                })
            }else{
                window.localStorage.removeItem('SMSMESSAGECOUNT')
            }
       }
        this.props.dispatch({
            type:'crm_customerPool/filterUserPool',
            payload:{
                ...query
            },
            callback:()=>{

            }
        })
    }
    onRef = (ref) =>{
        this.child= ref
    }
    sendMessage = ()=>{
        this.child.sendMessage(()=>{})
    }
    goBackHistory =()=>{
        this.child.goBackHistory()
    }
    render() {
        const {UserPoolCount}  = this.props.crm_customerPool
        return (
            <div className={styles.hand_send_sms}>  
                <Page.ContentAdvSearch  >
                    本次共选中<span className={styles.user_num}>{UserPoolCount}</span>位用户
                </Page.ContentAdvSearch>
                <SendMessageModule   {...this.props}  type='send'   onRef={this.onRef}   user_num={UserPoolCount}/>
                <div style={{paddingLeft:80}}>
                    <Button type='primary' onClick={()=>{this.sendMessage()}} disabled={this.state.btnDisabled} >发送</Button>
                    <Button  onClick={this.goBackHistory} style={{'marginLeft':'24px'}}>返回上一步</Button>
                    <p style={{padding:'16px 0',color:'#000'}}>注：短信可发送时间段为 9:00~19：30</p>  
                </div>
            </div>
        )
    }
}
