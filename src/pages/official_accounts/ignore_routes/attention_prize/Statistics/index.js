import React from "react"
import { Modal } from "antd"
import { connect } from "dva"
import {Link} from 'dva/router'
import numeral from 'numeral'
import {jine} from '../../../../../utils/display'
import styles from './index.less'

@connect(({attention_prize }) => ({attention_prize}))
export default class extends React.Component {
    onCancel =()=>{
        this.props.onCancel && this.props.onCancel()
    }
    numeral = (number,format='0,0')=>{
        if(typeof number !== 'undefined'){
            return numeral(number).format(format)
        }
        return '0'
    }
    render() {
        
        const { visible } = this.props
        const {view_count,follow_count,red_packet_amount} = this.props.attention_prize.recordAttentionPrize
        return (
            <Modal
                visible={visible}
                title="活动统计"
                okText="提交"
                cancelText="返回"
                destroyOnClose
                onCancel={this.onCancel}
                width={600}
                footer={null}
            >
                <div className={styles.statistics}>
                    <span> <b>点击次数(PV)</b>：{this.numeral(view_count)}次</span>
                    <span><b>关注人数：</b>{this.numeral(follow_count)}人</span>
                    <span><b>成功领取红包 </b>：<Link to='/platform/red_packets'>{jine(red_packet_amount,'','Fen')}元</Link></span>
                    <br/>
                </div>
            </Modal>
        )
    }
}