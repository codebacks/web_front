/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import { Input, Row, Col, Form, message, } from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"
import _ from "lodash"
import styles from './index.less'

const FormItem = Form.Item

@toggleModalWarp({
    width: 728,
    destroyOnClose: true,
    maskClosable: false,
})

export default class UpdateTemplateModal extends React.Component {
    static propTypes = {
        type: PropTypes.string, // add or edit
        record: PropTypes.object,
        onOk: PropTypes.func.isRequired,
    }

    static defaultProps = {
        type: 'add',
        record: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            inputValue: undefined,
        }
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        const { record } = this.props
        if(record && record?.title) {
            this.setState({inputValue: record?.title})
        }
    }

    handleChange = (e) => {
        const inputValue = e.target.value
        this.setState({inputValue})
    }

    handleOk = () => {
        const { inputValue } = this.state
        const { type, onOk, record } = this.props
        if(!inputValue || !inputValue.trim()) {
            message.warning('请输入模板名称！')
        }else{
            onOk && onOk(type, inputValue, record)
            this.props.onModalCancel()
        }
    }

    render() {

        const { inputValue } = this.state
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }

        return (
            <div className={styles.modalWarp}>
                <Row>
                    <Col span={20}>
                        <FormItem
                            {...formItemLayout}
                            label={<><span style={{color: '#f00'}}>*</span>模板名称：</>}
                            colon={false}
                        >
                            <Input
                                placeholder="20字以内"
                                value={inputValue}
                                onChange={this.handleChange}
                                maxLength={20}
                            />
                        </FormItem>
                    </Col>
                </Row>
            </div>
        )
    }
}
