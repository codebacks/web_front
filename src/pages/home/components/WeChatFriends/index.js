import React from 'react'
import { Card, Row, Col, Radio } from 'antd'
import WeBox from "../WeBox"
import Friend from './Friend'
import FriendMessageStatics from './FriendMessageStatics'
import styles from "./index.less"
import {getFriendStatictics, getGroupStatictics} from '../../services/wechat'
import moment from 'moment'


export default class WeChatFriends extends React.PureComponent{

    state = {
        active: 'friend',
        friendDebugMode: false,
        friend: {
            loading: false,
            data: null
        },
        groupDebugMode: false,
        group: {
            loading: false,
            data: null,

        }
    }

    getDataDelegate = {
        friend: getFriendStatictics,
        group: getGroupStatictics
    }

    initedTabs = { [this.state.active]: true}


    componentDidMount(){
        this.getTypeStaticticsData(this.state.active)
    }


    onTabChange = (e) => {
        const type = e.target.value
        this.initedTabs[type] = true
        this.setState({
            active: type
        })
        
        this.getTypeStaticticsData(type)
    }

    getTypeStaticticsData = (type) => {
        const stateData = this.state[type]

        if(stateData.data){

        }else {
            var delegate = this.getDataDelegate[type]

            this.setState({
                [type]:{
                    loading: true
                }
            })

            delegate(moment(), 7).then(data => {
                this.setState({
                    [type]:{
                        loading: false,
                        data: data
                    }
                })
            }, error => {
                this.setState({
                    [type]:{
                        loading: false
                    }
                })
            })
        }
    }

    render(){      
      
        return (
            <WeBox {...this.props} title="个人号统计" description="近7天数据">
                <Card>
                    <div className={styles.action}>
                        <Radio.Group defaultValue={this.state.active} onChange={this.onTabChange}>
                            <Radio.Button value="friend" style={{width: '90px', textAlign: 'center'}}>微信好友</Radio.Button>
                            <Radio.Button value="group" style={{width: '90px', textAlign: 'center'}}>微信群</Radio.Button>
                        </Radio.Group>
                    </div>
                    <div className={styles.friend} style={{display: this.state.active ==='friend'?'block':'none'}}>
                        <Row>
                            <Col span={12} className={styles.divider + ' ' + styles.friendCol}>
                                <Friend isDebugMode={this.state.friendDebugMode} data={this.state.friend.data} loading={this.state.friend.loading} name="净增好友（人）" />
                            </Col>
                            <Col span={12} className={styles.friendMessageCol}>
                                <FriendMessageStatics isDebugMode={this.state.friendDebugMode} data={this.state.friend.data} loading={this.state.friend.loading} name="收发消息（条）" />
                            </Col>
                        </Row>
                    </div>
                    {
                        this.initedTabs['group'] && 
                        <div className={styles.friend} style={{display: this.state.active ==='group'?'block':'none'}}>
                            <Row>
                                <Col span={12} className={styles.divider + ' ' + styles.friendCol}>
                                    <Friend isDebugMode={this.state.groupDebugMode} data={this.state.group.data} loading={this.state.group.loading} name="净增群（个）" />
                                </Col>
                                <Col span={12} className={styles.friendMessageCol}>
                                    <FriendMessageStatics isDebugMode={this.state.groupDebugMode} data={this.state.group.data} loading={this.state.group.loading} name="收发消息（条）" />
                                </Col>
                            </Row>
                        </div>
                    }
                </Card>
            </WeBox>
        )
    }
}