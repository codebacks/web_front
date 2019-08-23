import React, {PureComponent} from 'react'
import {
    Checkbox,
    message,
} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import {hot} from "react-hot-loader"

@hot(module)
@connect(({community_groupAutoPass, loading}) => ({
    community_groupAutoPass,
    updateGroupAutoPassLoading: loading.effects['community_groupAutoPass/updateGroupAutoPass'],
}))
@documentTitleDecorator({
    overrideTitle: '自动通过',
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_groupAutoPass/groupAutoPass',
            payload: {},
        })
    }

    changeStatus = (key, value) => {
        this.props.dispatch({
            type: 'community_groupAutoPass/updateGroupAutoPass',
            payload: {
                [key]: value,
            },
            callback: () => {
                if(key === 'status') {
                    if(value) {
                        message.success('启用成功')
                    }else {
                        message.warning('禁用成功')
                    }
                }
            },
        })
    }

    render() {
        const {
            status,
            white_list_limit,
        } = this.props.community_groupAutoPass

        return (
            <div className={styles.autoPass}>
                <div>
                    <Checkbox
                        disabled={this.props.updateGroupAutoPassLoading}
                        checked={status}
                        onChange={(e) => {
                            this.changeStatus('status', e.target.checked)
                        }}
                    >
                        开启此功能
                    </Checkbox>
                    <span className={styles.mark}>此功能生效条件：（1）开启群消息同步的群（2）所管理的微信号为群主</span>
                </div>
                <div
                    className={styles.content}
                    style={{'display': status ? 'block' : 'none'}}
                >
                    <div>
                        <span className={styles.title}>相关限制</span>
                    </div>
                    <div className={styles.rules}>
                        <div className={styles.rulesLine}>
                            <Checkbox
                                disabled={this.props.updateGroupAutoPassLoading}
                                checked={white_list_limit}
                                onChange={(e) => {
                                    this.changeStatus('white_list_limit', e.target.checked)
                                }}
                            >
                                开启白名单自动通过
                            </Checkbox>
                        </div>
                        <div
                            className={`${styles.rulesLine} ${styles.subItems}`}
                        >
                            开启后，群主自动通过功能仅针对员工微信号生效，群内非员工微信号的邀请将不会自动通过
                        </div>
                        {/*<div className={styles.rulesLine}>*/}
                        {/*<Checkbox*/}
                        {/*disabled={this.props.updateGroupAutoPassLoading}*/}
                        {/*checked={forbid_repeat_group}*/}
                        {/*onChange={(e) => {*/}
                        {/*this.changeStatus('forbid_repeat_group', e.target.checked)*/}
                        {/*}}*/}
                        {/*>*/}
                        {/*禁止重复添加*/}
                        {/*</Checkbox>*/}
                        {/*<span className={styles.mark}>开启后，已经添加商家其他群的，群主不会自动通过</span>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>
        )
    }
}
