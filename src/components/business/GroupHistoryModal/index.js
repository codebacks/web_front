import React, {Component} from 'react'
import {Popover, Icon} from 'antd'
import GroupMessages from 'components/business/HistoryMessages/GroupMessages'
import {hot} from "react-hot-loader"
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"

@hot(module)
@toggleModalWarp({
    title: <span>群聊记录<Popover placement="top" content={<div>群聊记录保存可查询时间为90天</div>} title={null}>
        <Icon type="info-circle" style={{marginLeft: 10, color: '#4391FF'}}/></Popover></span>,
    width: 910,
    destroyOnClose: true,
    maskClosable: false,
    footer: null,
})
export default class extends Component {

    static propTypes = {
        record: PropTypes.object,
        fromUin: PropTypes.string.isRequired,
        toUsername: PropTypes.string.isRequired,
    }

    static defaultProps = {
        record: {},
        fromUin: '',
        toUsername: '',
    }

    render() {
        const { record, fromUin, toUsername } = this.props
        const {winHeight} = this.props.base
        const contentHeight = winHeight - 140
        return (
            <GroupMessages
                {...this.props}
                activeSession={record}
                fromUin={fromUin}
                toUsername={toUsername}
                contentHeight={contentHeight}
            />
        )
    }
}
