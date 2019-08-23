/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Form, message} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from 'react-hot-loader'
import styles from './index.less'

@hot(module)
@Form.create()
@toggleModalWarp({
    setModalOption: ({highestOption, modalStateOption, modalOption, option, props, state}) => {
        return {
            ...option,
            ...modalOption,
            ...modalStateOption,
            ...highestOption,
            ...{
                title: '检查更新',
                width: 520,
                destroyOnClose: true,
                maskClosable: false,
                confirmLoading: props.notificationsBatchLoading,
            },
        }
    },
})
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
    }

    handleOk = (e) => {
        e.preventDefault()
        const {
            selectedRowKeys = [],
            dispatch,
            list,
        } = this.props
        const uins = []
        const imeis = []

        selectedRowKeys.forEach((key) => {
            const item = list.find(item => item.id === key)
            if(item){
                uins.push(item.uin)
                imeis.push(item.imei)
            }
        })

        const body = {
            uins,
            imeis,
            type: 'update_app',
            body: {}
        }

        this.props.dispatch({
            type: 'risk_control_deviceManagement/notificationsBatch',
            payload: {
                body,
            },
            callback: () => {
                message.success('指令已发送成功')
                dispatch({
                    type: 'risk_control_deviceManagement/clearSelectedRowKeys',
                })
                this.props.goPage()
                this.handleCancel()
            },
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            selectedRowKeys = [],
        } = this.props

        return (
            <div className={styles.main}>
                <div className={styles.title}>{`已选择${selectedRowKeys.length}台设置`}</div>
                <div className={styles.content}>确定要批量通知手机检查更新吗？</div>
            </div>
        )
    }
}
