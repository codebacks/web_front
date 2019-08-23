import React from 'react'
import { Modal, Row, Col } from 'antd'
import { connect } from 'dva'
import Page from "components/business/Page"
import styles from '../index.less'

@connect(({lottery_activity }) => ({ lottery_activity}))
export default class extends React.PureComponent {
    
    onCancelHandler = () =>{
        this.props.onClose && this.props.onClose()
    }
    componentDidUpdate(prevProps){
        if(this.props.visible && !prevProps.visible){
            this.props.dispatch({
                type:'lottery_activity/getActivitiesStat',
                payload:{
                    id:this.props.id
                }
            })
        }
    }

    render(){
        const {visible} = this.props
        const {record} = this.props.lottery_activity
        return <Modal
            title='数据详情'
            visible={visible}
            footer={null}
            width={480}
            onCancel={this.onCancelHandler}
        >
            <div style={{overflow:'auto',marginTop:-12}} className={styles.detail}>
                <Page.ContentBlock title="参与数据" />
                <Row>
                    <Col span={12}><span>浏览次数：</span> {record.page_view}</Col>
                    <Col span={12}><span>抽奖次数：</span> {record.lottery_count}</Col>
                </Row>
                <br />
                <Row>
                    <Col span={12}><span>参与人数：</span> {record.player_number}</Col>
                </Row>
                <Page.ContentBlock title="中奖纪录" />
                <Row>
                    <Col span={12}><span>获奖人数：</span> {record.awarded_number}</Col>
                    <Col span={12}><span>中奖次数：</span> {record.winning_count}</Col>
                </Row>
            </div>
        </Modal>
    }
}





