/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import {
    Form,
    message,
} from 'antd'
import modalWarp from 'hoc/modalWarp'
import styles from './index.less'
import FullTypeMessage from 'business/FullTypeMessage'
import _ from "lodash"

@modalWarp({
    width: 1024,
})
@Form.create()
export default class Index extends React.PureComponent {
    static defaultProps = {
        record: {
            common_msg_content: {},
        },
    }

    constructor(props) {
        super(props)
        props.setModalOkFn(this.handleOk)
        this.fullTypeMessageRef = React.createRef()
    }

    handleOk = async (e) => {
        try {
            const current = _.get(this, 'fullTypeMessageRef.current')
            if(current) {
                const common_msg_content = await current.getData()
                const {id} = this.props.record
                const formData = {
                    common_msg_content,
                }

                if(typeof id !== 'undefined') {
                    formData.id = id
                    this.props.dispatch({
                        type: 'wx_Rules/editReply',
                        payload: formData,
                    })
                    message.success('更新成功！')
                }else {
                    this.props.dispatch({
                        type: 'wx_Rules/addReply',
                        payload: formData,
                    })
                    message.success('创建成功！')
                }
                this.handleCancel()
            }
        }catch(e) {
            message.error(e.msg)
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    render() {
        const {
            record: {
                common_msg_content = {},
            } = {},
        } = this.props

        return (
            <FullTypeMessage
                className={styles.fullTypeMessage}
                ref={this.fullTypeMessageRef}
                loading={false}
                // showTabs={[1, 2]}
                tabsActiveKey={common_msg_content.type}
                typeValue={{
                    type: common_msg_content.type,
                    values: common_msg_content.values,
                }}
            />
        )
    }
}

