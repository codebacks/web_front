import React, { Component } from 'react'
import { connect } from 'dva'
import { Modal ,Button} from 'antd'
import {getTokenForStorage} from '@/utils'
import styles from "./index.less"


const Step1 =(props)=>{

    let accessToken = props.location && props.location.query.accessToken
    if(!accessToken) accessToken = getTokenForStorage()
    return <>
        <p>
            <span> 进入管理后台 > 个人号 > 微信号管理 > 点击新增微信号</span>
            <a href={`/wx/wechats${accessToken? `?access_token=${accessToken}`:''}`} target='_blank'><Button type='primary' ghost >快捷入口</Button></a> 
        </p>
        <img src={require('../../assets/icons/img_1@2x.png')}  width='754' height='376' alt=''/>
    </>
}

const Step2 =()=>{
    // 
    return <>
        <p>
            <span>打开手机应用“ <img src={require('../../assets/icons/customer_service@2x.png')} width='24' alt=''/><span style={{color:'#28343E'}}> 牛客服工具箱</span> ”选择扫码</span>
        </p>
        <img src={require('../../assets/icons/img_2@2x.png')}  width='754' height='376' alt=''/>
    </>
}
const Step3 =()=>{
    return <>
        <p>
            <span> 扫码成功后，您就可以使用以下功能啦 </span>
        </p>
        <img src={require('../../assets/icons/img_3@2x.png')}  width='754' height='376' alt=''/>
    </>
}

@connect(({ base, guide }) => ({
    base, guide
}))
export default class Guide extends Component {
    state = {
        guideVisible: false,
        step:1
    }

    componentDidMount() {
        const isGuidance = this.getStorge()
        if(Number(isGuidance) === 1){
            this.setState({
                guideVisible:true,
            })
        }
    }


    handleGuideCancel = () => {
        let isGuidance = this.getStorge()
        if(isGuidance){
            isGuidance = Number(isGuidance)
            this.setStorge(++isGuidance)
            
        }
        this.props.back && this.props.back()
        if(this.props.back){
            setTimeout(_=>{
                this.onCancel()
            },200)
        }else{
            this.onCancel()
        }
        
    }
    onCancel = () =>{
        this.setState({
            guideVisible: false
        })
    }

    guideFlowModal = () => {
        this.setState({
            guideVisible: true,
        })
    }
    getStorge(){
        return window.localStorage.getItem('isGuidance')
    }
    setStorge(value){
        window.localStorage.setItem('isGuidance',value)
    }
    onClick=()=>{
        let {step} = this.state
        if(step === 1){
            this.handleGuideCancel()
        }else if(step > 1){
            this.setState({
                step:--step
            })
        }
    }
    handlClik=()=>{
        let {step} = this.state
        if(step === 3){
            this.handleGuideCancel()
        }else if(step < 3){
            this.setState({
                step:++step
            })
        }
    }
    render() {
        const {step} = this.state
        const stpeTitles =['（1/3）','（2/3）','（3/3）']
        return (
            <div> 
                <Modal
                    wrapClassName={styles.wrapModal}
                    style={{ top: 50 }}
                    title={<div> <img src={require('../../assets/icons/logo_40@2x.png')} width='24' height='24' alt='' /> 新手引导{stpeTitles[step-1]}</div>}
                    visible={this.state.guideVisible}
                    onCancel={this.handleGuideCancel}
                    maskClosable={false}
                    width={806}
                    className={styles.guideModelBtn}
                    footer={null}
                >
                    <div className={styles.guideModal}>
                        {step === 1 ? <Step1 {...this.props} /> : step === 2 ? <Step2 {...this.props} /> : step === 3 ? <Step3 {...this.props} /> : null}
                        <div className={styles.footer}>
                            <Button onClick={this.onClick}>{step === 1 ? '跳过' :'上一步'}</Button>
                            <Button type='primary' onClick={this.handlClik}>{step === 3 ? '完成' :'下一步'}</Button>
                        </div>
                    </div>
                </Modal>
            </div >
        )
    }
}

