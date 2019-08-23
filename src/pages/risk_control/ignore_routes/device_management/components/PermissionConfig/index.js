/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {message, Spin, Checkbox, Modal} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {connect} from 'dva'
import {hot} from 'react-hot-loader'
import styles from './index.less'

@hot(module)

@toggleModalWarp({
    title: "权限配置",
    width: 520,
    destroyOnClose: true,
    maskClosable: true,
})
@connect(({risk_control_deviceManagement, loading}) => ({
    risk_control_deviceManagement,
}))
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_deviceManagement/getPermissionConfig',
            payload: {},
        })
    }

    handleOk = (e) => {
        e.preventDefault()

        const { permissionConfig } = this.props.risk_control_deviceManagement
        const checkedIndex =  permissionConfig.findIndex((item) => !!item.status)

        if(checkedIndex === -1) {
            Modal.confirm({
                title: '提示',
                content: '确定要批量关闭设备的所有权限？',
                onOk: () => {
                    this.confirmHandleOk()
                },
            })
        }else{
            this.confirmHandleOk()
        }
    }

    confirmHandleOk = () => {
        const {selectedRowKeys = [], dispatch, risk_control_deviceManagement,} = this.props
        const { permissionConfig } = risk_control_deviceManagement

        let body = {
            device_ids: selectedRowKeys,
        }

        permissionConfig.forEach((item) => {
            body[item.key] = item.status
        })

        this.props.dispatch({
            type: 'risk_control_deviceManagement/setPermissionConfig',
            payload: {
                body: {
                    ...body,
                }
            },
            callback: () => {
                message.success('权限配置设置成功')
                this.props.goPage()
                this.handleCancel()
            },
        })
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    checkboxChange = (index, e) => {
        const { permissionConfig } = this.props.risk_control_deviceManagement, val = e.target.checked ? 1 : 0
        let item = permissionConfig[index]
        item && (item.status = val)
        if(index >= 0) {
            this.props.dispatch({
                type: 'risk_control_deviceManagement/setStateByPath',
                payload: {
                    path: 'permissionConfig[index]',
                    value: item,
                },
            })
        }
    }

    render() {
        const {
            selectedRowKeys = [],
            getLoading,
            risk_control_deviceManagement,
        } = this.props

        const { permissionConfig } = risk_control_deviceManagement

        return (
            <div className={styles.permissionConfig}>
                <Spin spinning={getLoading}>
                    <div className={styles.title}>已选{selectedRowKeys?.length}台设备</div>
                    {
                        permissionConfig && permissionConfig.length ? (
                            <div className={styles.list}>
                                {
                                    permissionConfig.map((item, index) => {
                                        return (
                                            <div className={styles.item} key={item.key}>
                                                <Checkbox
                                                    checked={!!item?.status}
                                                    onChange={(e) => this.checkboxChange(index, e)}
                                                >{item.desc}</Checkbox>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        ) : null
                    }
                </Spin>
            </div>
        )
    }
}
