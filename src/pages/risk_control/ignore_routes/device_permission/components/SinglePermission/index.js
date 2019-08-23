/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {message, Spin, Checkbox, Modal} from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import {hot} from 'react-hot-loader'
import styles from './index.less'

@hot(module)

@toggleModalWarp({
    title: "权限配置",
    width: 520,
    destroyOnClose: true,
    maskClosable: true,
})
@connect(({risk_control_devicePermission, loading}) => ({
    risk_control_devicePermission,
}))
export default class Index extends React.Component {

    static propTypes = {
        id: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ).isRequired,
        getLoading: PropTypes.bool,
        goPage: PropTypes.func,
    }

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'risk_control_devicePermission/getSinglePermission',
            payload: {
                device_id: this.props.id,
            },
        })
    }

    handleOk = (e) => {
        e.preventDefault()
        const { dispatch, risk_control_devicePermission, id } = this.props
        const { singlePermission } = risk_control_devicePermission

        let body = {}

        singlePermission.forEach((item) => {
            body[item.key] = item.status
        })

        this.props.dispatch({
            type: 'risk_control_devicePermission/setSinglePermission',
            payload: {
                device_id: id,
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
        const { singlePermission } = this.props.risk_control_devicePermission, val = e.target.checked ? 1 : 0
        let item = singlePermission[index]
        item && (item.status = val)
        if(index >= 0) {
            this.props.dispatch({
                type: 'risk_control_devicePermission/setStateByPath',
                payload: {
                    path: 'singlePermission[index]',
                    value: item,
                },
            })
        }
    }

    render() {
        const { getLoading, risk_control_devicePermission } = this.props
        const { singlePermission } = risk_control_devicePermission

        return (
            <div className={styles.singlePermission}>
                <Spin spinning={getLoading}>
                    {
                        singlePermission ? (
                            <div className={styles.list}>
                                {
                                    singlePermission && singlePermission.length ? (
                                        <div className={styles.list}>
                                            {
                                                singlePermission.map((item, index) => {
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
                            </div>
                        ) : null
                    }
                </Spin>
            </div>
        )
    }
}
