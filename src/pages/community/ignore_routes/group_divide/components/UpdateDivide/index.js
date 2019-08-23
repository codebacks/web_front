import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from "react-hot-loader"
import { Form, Row, Col, Input } from 'antd'
import {connect} from 'dva'
import PropTypes from 'prop-types'
import _ from "lodash"

const FormItem = Form.Item
const { TextArea } = Input

@hot(module)
@connect(
    ({community_groupDivide, loading,},) => ({
        community_groupDivide,
        updateLoading: loading.effects['community_groupDivide/update'],
    }),
)
@toggleModalWarp({
    width: 640,
    destroyOnClose: true,
    maskClosable: false,
})
export default class UpdateDivide extends PureComponent {
    static propTypes = {
        record: PropTypes.object,
        type: PropTypes.string.isRequired, // 'add' or 'update'
        onOk: PropTypes.func,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.state = {
            record: undefined,
            type: undefined,
            title: undefined,
            remark: undefined,
        }
        props.setModalOkFn(this.handleOnOk)
    }

    componentDidMount() {
        const { record, type } = this.props
        this.setState({
            record,
            type,
            title: record?.title,
            remark: record?.remark,
        })
    }

    handleOnOk = () => {
        const { onOk, onModalCancel } = this.props
        if(onOk) {
            const isCancelModal = onOk({...this.state})
            if(isCancelModal) {
                onModalCancel()
            }
        }else{
            onModalCancel()
        }

    }

    handleChange = (key, e) => {
        let val = e.target.value
        this.setState({
            [key]: val
        })
    }

    render() {

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 16},
        }
        const { title, remark } = this.state

        return (
            <>
                <Row>
                    <Col>
                        <FormItem {...formItemLayout} label={<><span style={{color: '#f00'}}>*</span>分组名称：</>} colon={false}>
                            <Input
                                placeholder="10个字以内"
                                value={title}
                                onChange={(e) => {
                                    this.handleChange('title', e)
                                }}
                                maxLength={10}
                            />
                        </FormItem>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormItem {...formItemLayout} label="分组备注：" colon={false}>
                            <TextArea
                                placeholder="40个字以内"
                                value={remark}
                                onChange={(e) => {
                                    this.handleChange('remark', e)
                                }}
                                maxLength={40}
                            />
                        </FormItem>
                    </Col>
                </Row>
            </>
        )
    }
}
