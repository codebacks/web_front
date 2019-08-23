//解除淘宝天猫店铺授权
import React , {Component} from 'react'
import {connect} from 'dva'
import { Modal, message } from 'antd'

@connect(({setting_shopManagement, base}) => ({
    setting_shopManagement,
    base,
}))
export default class DeleteOauthTao extends Component {
    constructor(){
        super()
        this.state = {
            lessThan24: false
        }
    }
    closeShopOauth = ()=>{
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload:{ shopDeleteTaoVisible: false }
        })  
    }
    saveShopOauth = ()=>{
        const { auth_at } = this.props.setting_shopManagement.currentShop
        let timeOauth = parseInt(new Date().getTime(),10) - parseInt(new Date(auth_at).getTime(),10)
        //判断授权时候是否超过24小时
        if(timeOauth < 24*60*60*1000){
            this.setState({
                lessThan24: true
            })
        }else{
            const id = this.props.setting_shopManagement.currentShop.id
            this.props.dispatch({
                type: 'setting_shopManagement/deleteOauthTao',
                payload:{ 
                    id:  id
                },
                callback: (data) => {
                    this.props.dispatch({
                        type: 'setting_shopManagement/setProperty',
                        payload:{ shopDeleteTaoVisible: false }
                    })
                    if(!data.error){
                        message.success('解除授权成功')
                        this.props.dispatch({
                            type: 'setting_shopManagement/getShopList',
                            payload:{}
                        })
                    }
                }
            })
        }
    }
    changeStateFun = () => {
        this.setState({
            lessThan24: false
        })
    }
    render(){
        const { shopDeleteTaoVisible } = this.props.setting_shopManagement
        return (<div>
            <Modal
                closable={false}
                visible={shopDeleteTaoVisible}
                onCancel={this.closeShopOauth}
                onOk={this.saveShopOauth}
                width={400}
            > 
                <div style={{fontSize: 14,fontWeight: 'bold',marginBottom: 10}}>是否确定解除？</div>
                <div>解除后客户、订单数据不再同步</div>  
            </Modal> 
            <OauthTip
                key={new Date()}
                lessThan24={this.state.lessThan24}
                changeStateFun={this.changeStateFun}
                auth_at={this.props.setting_shopManagement.currentShop.auth_at}
            ></OauthTip>
        </div>)
    }
}

class OauthTip extends Component {
    constructor(){
        super()
        this.state={
            visible: false,
            hourTime: '',
            minutesTime: '',
            secondsTime: '',
        }
    }
    componentDidMount(){
        if(this.props.lessThan24){
            this.setState({
                visible: true
            })
            this.showIntervalTime(this.props.auth_at)
        }
    }
    componentWillUnmount(){
        if(this.timer){
            clearInterval(this.timer)
        }
    }
    setTwoStr = (str)=>{
        return str.toString().length===1? `0${str.toString()}` : str.toString()
    }
    showIntervalTime = (data)=> {
        this.timer = setInterval(()=>{
            let timeOauth = parseInt(new Date().getTime(),10) - parseInt(new Date(data).getTime(),10)
            let hourTime = parseInt(timeOauth/(3600*1000),10)
            let minutesTime = parseInt((timeOauth-hourTime*3600*1000)/(60*1000),10)
            let secondsTime = parseInt((timeOauth-hourTime*3600*1000-minutesTime*60*1000)/(1000),10)
            if(secondsTime === 0 && minutesTime === 0){
                hourTime = this.setTwoStr(24 - hourTime)
            }else{
                hourTime = this.setTwoStr(23 - hourTime)
            }
            if(secondsTime === 0){
                minutesTime = this.setTwoStr(60 - minutesTime)
            }else{
                minutesTime = this.setTwoStr(59 - minutesTime)
            }
            secondsTime = this.setTwoStr(60 - secondsTime)
            this.setState({
                hourTime: hourTime,
                minutesTime: minutesTime,
                secondsTime: secondsTime, 
            })
        },1000)
    }
    closeOauthTip = ()=> {
        if(this.timer){
            clearInterval(this.timer)
        }
        this.props.changeStateFun()
    }
    render(){
        const { hourTime, minutesTime, secondsTime} = this.state
        return (
            <Modal
                title='提示'
                visible={this.state.visible}
                onCancel={this.closeOauthTip}
                footer={null}
                width={400}
            > 
                <div style={{ fontSize: 14, textAlign: 'center' ,marginBottom: 10 }}>为保证同步数据准确，24小时候后才能解除授权!</div>
                <div style={{ fontSize: 30, fontWeight: 'bold', textAlign: 'center',height: 45 }}>{hourTime?`${hourTime}:${minutesTime}:${secondsTime}`:''}</div>  
            </Modal>    
        )
    }
}