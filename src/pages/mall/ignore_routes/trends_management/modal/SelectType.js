import { Component } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import { Modal, Col, Row, Button } from 'antd'
import styles from './index.less'


@connect(({ base}) => ({
    base,
}))
export default class SelectType extends Component {
    state = {
        type: 'short'
    }
    onOk = ()=> {
        const { type } = this.state
        if(type === 'short'){
            router.push('/mall/trends_management/addShort')
        }else{
            router.push('/mall/trends_management/addLong')
        }
        this.props.closeModal()
    }
    onCancel = ()=> {
        this.props.closeModal()
    }
    changeType = (data)=> {
        this.setState({
            type: data
        })
    }
    render(){
        const { type } = this.state
        const { visible } = this.props
        return (
            <Modal
                title={
                    <div style={{fontSize: 18,fontWeight: 'bold',color: '#303133'}}>发布新动态</div>
                }
                visible={visible}
                onCancel={this.onCancel}
                width={600} 
                footer={
                    <div>
                        <Button type='primary' onClick={this.onOk}>确定</Button>
                        <Button onClick={this.onCancel}>返回</Button>
                    </div>
                }
            >
                <Row>
                    <Col span={16} offset={4}>
                        <Col span={10} className={type==='short'?styles.selectActive:styles.selectItem} onClick={()=>this.changeType('short')}>短动态</Col>
                        <Col span={10}  offset={4} className={type==='long'?styles.selectActive:styles.selectItem}  onClick={()=>this.changeType('long')}>长动态</Col>
                    </Col>
                </Row>
                <Row>
                    <Col className={styles.smallTitle}>什么是短动态？长动态？</Col>
                    <Col className={styles.smallContent}>
                        <div>短动态：类似于微博+朋友圈的结合，最大支持140个字的文字编辑+最多9张配图的动态展示；</div>
                        <div>长动态：更适合发布详细的商品资讯，图文搭配没有最大上限，也可添加微信支持的外部URL链接。</div>
                    </Col>
                </Row>
            </Modal>
        )
    }
}