import React, {Component, Fragment} from 'react'
import { Modal, Spin, Form } from 'antd'
import styles from '../index.less'
import {connect} from 'dva'
import DownLoad from '../downLoad'

@connect(({setting_developer, base}) => ({
    setting_developer,
    base,
}))
export default class Developer extends Component{
    state = {
        loading: false,
        app_key: '',
        app_secret: '',
        isSecret: false,
        isShow: false
    }
    componentDidMount(){
        this.getInitData()
    }
    encryptData = (text)=>{
        if(!text){
            return
        }else{
            let len = text.length
            let arr = text.split('')
            let str = ''
            arr.forEach((item,index)=>{
                if(index>1 && index<len-2){
                    str = str + "*"
                }else{
                    str = str + item
                }
            })
            return str
        }
    }
    getInitData = ()=>{
        this.setState({loading: true})
        this.props.dispatch({
            type: 'setting_developer/getDevelopInfo',
            payload: {},
            callback: ()=>{
                const {app_key, app_secret} = this.props.setting_developer
                this.setState({
                    app_key: app_key, 
                    app_secret: this.encryptData(app_secret),
                    isSecret: true,
                    isShow: true
                })
                this.setState({loading: false})
            }
        })
    }
    newDevelopInfo = ()=>{
        this.setState({loading: true})
        this.props.dispatch({
            type: 'setting_developer/newDevelopInfo',
            payload: {},
            callback: ()=>{
                const {app_key, app_secret} = this.props.setting_developer
                this.setState({
                    app_key: app_key, 
                    app_secret: this.encryptData(app_secret),
                    isSecret: true
                })
                this.setState({loading: false})
            }
        })
    }
    showDevelopInfo = ()=>{
        this.setState({loading: true})
        const {app_key, app_secret} = this.props.setting_developer
        this.setState({
            app_key: app_key, 
            app_secret: app_secret,
            isSecret: false
        },()=>{
            this.setState({loading: false}) 
        })
    }
    resetDevelopInfo = ()=>{
        this.setState({loading: true})
        this.props.dispatch({
            type: 'setting_developer/resetDevelopInfo',
            payload: {},
            callback: ()=>{
                const {app_key, app_secret} = this.props.setting_developer
                this.setState({
                    app_key: app_key, 
                    app_secret: this.encryptData(app_secret),
                    isSecret: true
                })
                this.setState({loading: false})
            }
        })
    }
    downLoadDoc = ()=>{
        // 设置，防止谷歌浏览器自动打开pdf文件
        // var xmlHttp = null
        // xmlHttp = new XMLHttpRequest() 
        // xmlHttp.open("GET", "https://document.51zan.com/2019/01/14/Fk8EXbmbXyWzLVw-5jc9u3rNhPFy.docx", true)
        // xmlHttp.responseType = 'blob'
        // xmlHttp.onload=function(e){
        //     DownLoad(xmlHttp.response, "API订单接入.doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" )
        // }
        // xmlHttp.send()
        window.open('http://newhelp.51zan.cn/manual/content/API%E8%AE%A2%E5%8D%95%E6%8E%A5%E5%8F%A3%E5%BC%80%E5%8F%91%E6%8C%87%E5%8D%97.md')
    }
    onCancel = ()=>{
        this.props.onChange()
    }
    render(){
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '90px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        return (
            <Modal 
                title = 'API订单接入'
                visible={this.props.visible}
                footer={null}
                onCancel = {this.onCancel}
                width={600}
            >
                <div>
                    <div className={styles.head}>
                        <div className={styles.headTit}>功能说明</div>
                        <div className={styles.headConWarp}>
                            <div className={styles.headCon}>为保障具有开发能力的商家导入其本身订单库系统，系统支持第三方API订单开发导入。商家端接口调用后，进行订单参数传输，保存成功后的订单数据在 系统设置-店铺订单-店铺订单 中查看。详细开发说明见 <span className={styles.clickDown} onClick={this.downLoadDoc}>API订单接口开发指南</span> 。</div>
                        </div>
                    </div>
                    <Spin spinning={this.state.loading}>
                        {
                            this.state.isShow && (
                                <Form>
                                    <Form.Item label='app_key' {...formItemLayout} style={{marginBottom: 0}}>
                                        <Fragment>
                                            <span>{this.state.app_key}</span>
                                            {
                                                !this.state.app_key&&(<span className={styles.clickBtn} onClick={this.newDevelopInfo}>生成</span>)
                                            }
                                        </Fragment>
                                    </Form.Item>
                                    <Form.Item label='app_secret' {...formItemLayout}>
                                        <Fragment>
                                            <span>{this.state.app_secret}</span>
                                            {
                                                !!this.state.app_secret&&(
                                                    <Fragment>
                                                        {this.state.isSecret && (<span className={styles.clickBtn} onClick={this.showDevelopInfo}>查看</span>)}
                                                        <span className={styles.clickBtn} onClick={this.resetDevelopInfo}>重置</span>
                                                    </Fragment>
                                                )
                                            }
                                        </Fragment>
                                    </Form.Item>
                                </Form>
                            )
                        }
                    </Spin>
                </div>
            </Modal>
        )
    }
}
