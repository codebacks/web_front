/**
 * @Description
 * @author XuMengPeng
 * @date 2019/4/17
 */
import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from "react-hot-loader"
import { Form, Row, Col, message, Radio, Spin } from 'antd'
import {connect} from 'dva'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@hot(module)
@toggleModalWarp({
    title: '设置工作群',
    width: 640,
    destroyOnClose: true,
    maskClosable: false,
})
export default class SetDivideModal extends PureComponent {
    static propTypes = {
        onOk: PropTypes.func,
    }

    static defaultProps = {
        onOk: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {
        }
        props.setModalOkFn(this.handlOnOk)
    }

    componentDidMount() {}

    componentWillUnmount() {
        this.props.dispatch({
            type: 'community_group_management/resetWorkGroupInfo',
        })
    }

    handlOnOk = () => {
        const { onOk, onModalCancel } = this.props
        const { workGroupInfo: { isSetWorkGroup } } = this.props.community_group_management
        if(typeof isSetWorkGroup === 'undefined') {
            message.warning('请选择批量工作群设置操作！')
            return
        }
        onOk && onOk()
        onModalCancel()
    }

    handleChange = (e) => {
        const { workGroupInfo } = this.props.community_group_management
        this.props.dispatch({
            type: 'community_group_management/setProperty',
            payload: {
                workGroupInfo: {
                    ...workGroupInfo,
                    isSetWorkGroup: e.target.value ? 1 : 0,
                }
            },
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 14},
        }

        const { workGroupInfo } = this.props.community_group_management
        const { isSetWorkGroup, checkWorkGroupInfo } = workGroupInfo

        return (
            <div className={styles.workGroupModal}>
                <Spin spinning={this.props.checkWorkGroupLoading}>
                    <div className={styles.txt}>已选择 {checkWorkGroupInfo?.count_selected} 个群，自动过滤 {checkWorkGroupInfo?.count_quit} 个退出群</div>
                    <div className={styles.txt}>当前已开启工作群 {checkWorkGroupInfo?.count_setted} 个，剩余工作群授权数 {checkWorkGroupInfo?.count_rest} 个</div>
                    <Row>
                        <Col>
                            <FormItem
                                {...formItemLayout}
                                label={<><span className={styles.required}>*</span>请选择批量工作群设置操作：</>}
                                colon={false}
                            >
                                <RadioGroup onChange={(e) => this.handleChange(e)} value={isSetWorkGroup}>
                                    <Radio value={1}>开启</Radio>
                                    <Radio value={0}>关闭</Radio>
                                </RadioGroup>
                            </FormItem>
                        </Col>
                    </Row>
                </Spin>
            </div>
        )
    }
}
