import React, {Component} from 'react'
import {Popover, Icon} from 'antd'
import GroupMessages from 'community/components/GroupMessages/Index'
import {hot} from "react-hot-loader"
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"

@hot(module)
@toggleModalWarp({
    title: <span>群聊记录<Popover placement="top" content={<div>群聊记录保存喝可查询时间为90天</div>} title={null}>
        <Icon type="info-circle" style={{marginLeft: 10}}/></Popover></span>,
    width: 1000,
    destroyOnClose: true,
    maskClosable: false,
    footer: null,
})
export default class extends Component {

    static propTypes = {
        record: PropTypes.object
    }

    static defaultProps = {
        record: {}
    }

    render() {
        const {record} = this.props
        return (
            <GroupMessages
                {...this.props}
                hideBind={true}
                last_page={true}
                uin={record.from.uin}
                username={record.target.username}
                contentHeight={650}
            />
        )
    }
}
