/**
 **@Description:
 **@author: wuming
 */

import React, { Component } from "react"
import { Modal} from "antd"
import { connect } from "dva"
import styles from "./index.less"
import router from 'umi/router'


@connect(({base, platform_voicepacket }) => ({
    base,platform_voicepacket
}))

export default class Index extends Component {
    state = {
      
    }
   
    componentDidMount(){
        
    }
    handleCancelActivity = () =>{
        this.props.cancelActivity()
    }
    handleActivityRecharge = () =>{
        this.props.cancelRecharge()
    }
    render() {
        const {activityVisible} = this.props
        return (
            <Modal
                visible={activityVisible}
                onCancel={this.handleCancelActivity}
                width={600}
                centered={true}
                closable={false}
                footer={null}
                className={styles.activityModel}
            >
                <div className={styles.activity}>
                    <img src={require('../../../assets/images/bg1.png')} alt=""  style={{width:'500px'}}/>
                    <img src={require('../../../assets/images/bg3.png')}   className={styles.closeActivity} onClick={this.handleCancelActivity}   alt=""/>
                    <img  className={styles.recharge} onClick={this.handleActivityRecharge}   src={require('../../../assets/images/bg2.png')} alt=""/>
                </div>
            </Modal>
        )
    }
}
