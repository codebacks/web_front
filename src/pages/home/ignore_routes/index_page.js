import React, { Component } from 'react'
import {connect} from 'dva'
import MyCustomer from '../components/MyCustomer'
import WeChatFriends from "../components/WeChatFriends"
import Guidance from '@/components/Guidance'
import Sales from "../components/Sales"
import Moment from '../components/Moment'
import _ from 'lodash'

@connect(({base, home_index, }) => ({
    base,
    home_index
}))
export default class Index extends Component {

    // 是否免费版
    isFreeVersion = () => {
        const { initData } = this.props.base
        return _.get(initData, 'company.product_version.id') === 0
    }

    // 是否基础班
    isJichuVersion = () => {
        const { initData } = this.props.base
        return _.get(initData, 'company.product_version.id') === 10
    }
    isQiDian = () =>{
        const isQiDian = window.localStorage && window.localStorage.getItem('isQIDIAN')
        return !! isQiDian
    }

    render(){
        const { initData } = this.props.base
    
        return <div>
            {
                initData === undefined ? 
                    '': 
                    (
                        this.isFreeVersion() || this.isJichuVersion() || this.isQiDian() ? <Free />: <Normal />
                    )
            }
            <Guidance />
        </div>
    }
}


const Normal = () => {
    return <div className="hz-padding-large-left-right">
        <MyCustomer className="hz-margin-small-bottom"  />
        <WeChatFriends className="hz-margin-small-bottom"  />
        <Sales className="hz-margin-large-bottom" />
        <footer style={{margin: '28px auto',textAlign: 'center',fontSize: 12,color: '#666'}}>Copyright 2018.All rights reserved. 沪ICP备17005510号-2   客服热线：400-0190-739</footer>
    </div>
}


const Free = () => {
    return <div className="hz-padding-large-left-right">
        <WeChatFriends className="hz-margin-small-bottom"  />
        <Moment className="hz-margin-large-bottom" />
        <footer style={{margin: '28px auto',textAlign: 'center',fontSize: 12,color: '#666'}}>Copyright 2018.All rights reserved. 沪ICP备17005510号-2   客服热线：400-0190-739</footer>
    </div>
}
