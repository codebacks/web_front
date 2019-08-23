/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {connect} from "dva/index"
// import styles from './index.less'
import PropTypes from "prop-types"
import FullTypeMessage from 'business/FullTypeMessage'
import _ from "lodash"
import {message} from "antd"

@connect(({media}) => ({
    media,
}))
@toggleModalWarp({
    title: "全类型消息",
    width: 1050,
    destroyOnClose: true,
    maskClosable: false,
})
export default class MsgContentModal extends PureComponent {
    static propTypes = {
        contents: PropTypes.array,
        handleOk: PropTypes.func,
        renderContentFn: PropTypes.func,
        handleError: PropTypes.func,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.fullTypeMessageRef = React.createRef()
    }

    handleOk = async () => {
        try {
            const current = _.get(this, 'fullTypeMessageRef.current')
            const {handleOk, setModalOptionState} = this.props
            if(current && handleOk) {
                setModalOptionState({confirmLoading: true})
                const data = await current.getData()
                setModalOptionState({confirmLoading: false})

                handleOk({data, handleCancel: this.handleCancel})

                const values = data.values
                if(values && (values.saveLib === true)) {
                    this.props.dispatch({
                        type: 'media/batchAdd',
                        payload: [data],
                        callback: () => {
                            message.success('保存素材库成功！')
                        },
                    })
                }
            }
        }catch(e) {
            const {handleError, setModalOptionState} = this.props
            setModalOptionState({confirmLoading: false})
            if(handleError) {
                handleError(e)
            }else {
                message.error(e.msg)
            }
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    renderFullTypeMessage = () => {
        return (
            <FullTypeMessage
                // showTabs={[1, 2, 3, 4, 5, 6, 7]}
                {...this.props}
                ref={this.fullTypeMessageRef}
            />
        )
    }

    render() {
        const {renderContentFn} = this.props

        if(renderContentFn) {
            return renderContentFn({renderFullTypeMessage: this.renderFullTypeMessage, props: this.props})
        }else {
            return this.renderFullTypeMessage()
        }
    }
}
