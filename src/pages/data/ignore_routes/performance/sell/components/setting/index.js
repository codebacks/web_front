'use strict'

import React from 'react'
import { Form, Row, Col, InputNumber, Icon, Switch, Button, Modal, Checkbox } from 'antd'
import Page, { ContentAdvSearch as PageContentAdvSearch } from 'components/business/Page'
import { connect } from 'dva'
import styles from './index.less'

const DEFAULTE_CHAT_HOUR = 36
@Form.create()
@connect(({ base, data_performance_sell }) => ({
    base, data_performance_sell
}))
// @documentTitleDecorator()
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            chat_interval: DEFAULTE_CHAT_HOUR,
            isSave: false,
            open: false,
            historyOpen: false,
            first_bind_translation: true,
            add_fans_translation: false
        }
    }
    componentDidMount() {
        this.getSetData()
    }
    getSetData = () => {
        this.props.dispatch({
            type: 'data_performance_sell/getTranslateSet',
            payload: {
            },
            callback: (data) => {
                this.setState({
                    open: data.chat_translation,
                    historyOpen: data.first_bind_translation || data.add_fans_translation,
                    first_bind_translation: data.first_bind_translation,
                    add_fans_translation: data.add_fans_translation
                })
                this.props.form.setFieldsValue({
                    chat_interval: data.chat_translation ? data.chat_interval : DEFAULTE_CHAT_HOUR
                })
            }
        })
    }
    handleSwitchChat = (e) => {
        const { open } = this.state
        this.setState({
            open: !open,
            chat_interval: DEFAULTE_CHAT_HOUR
        })
        this.props.form.setFieldsValue({
            chat_interval: DEFAULTE_CHAT_HOUR
        })
    }

    handleSwitchHistory = (e) => {
        this.setState({
            historyOpen: e,
            first_bind_translation: e?true:false,
            add_fans_translation: false
        })
    }
    saveTranslateTime = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    visible: true,
                    chat_interval: values.chat_interval
                })
            }
        })

    }
    resetTranslateTime = () => {
        this.getSetData()
    }
    handleCancel = () => {
        this.setState({
            visible: false
        })
    }
    handleChangeCheckbox = (key, e) => {
        this.setState({
            [key]: e.target.checked
        },()=>{
            if(!this.state.first_bind_translation && !this.state.add_fans_translation){
                this.setState({
                    historyOpen:false
                })
            }
        })
    }
    handleOk = () => {
        const { chat_interval, open, add_fans_translation, first_bind_translation } = this.state
        this.props.dispatch({
            type: 'data_performance_sell/setTranslateSet',
            payload: {
                chat_translation: open,
                chat_interval: chat_interval,
                first_bind_translation: first_bind_translation,
                add_fans_translation: add_fans_translation
            },
            callback: () => {
                this.setState({
                    visible: false
                })
            }
        })
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { open, historyOpen, first_bind_translation, add_fans_translation } = this.state
        return (
            <div>
                <Page.ContentBlock title='牛客服' hasDivider={false} style={{ marginTop: -16 }}>
                    <PageContentAdvSearch>
                        <Form>
                            <Row>
                                <Col>
                                    1.聊天转化启用后，于次日生效；
                                </Col>
                                <Col>
                                    2.修改转化时间，仅作用于新的销售统计报表，历史报表无法重新统计；
                                </Col>
                                <Col>
                                    3.举例说明：假设客服发送聊天消息给客户后，客户一天内在平台下单视为有效绩效，则可设置转化时间为24小时。
                                </Col>
                            </Row>
                        </Form>
                    </PageContentAdvSearch>
                    <Form>
                        <Row>
                            <Col span={2} style={{ width: '80px' }}>
                                聊天转化：
                            </Col>
                            <Col>
                                <Row><Switch checkedChildren="启用" unCheckedChildren="禁用" checked={open} onChange={this.handleSwitchChat} /></Row>
                                <Row style={{ display: open ? 'block' : 'none' }} className={styles.otherRow}>
                                    <Col style={{ lineHeight: '39px', width: '50px' }} span={2}>下单前</Col>
                                    <Col span={3} style={{ width: '100px' }}>
                                        <Form.Item label="">
                                            {getFieldDecorator("chat_interval", {
                                                rules: [{
                                                    required: true, message: '输入的时间需要在1-1080之间'
                                                }]
                                            })(
                                                <InputNumber min={1} max={1080} parser={value => value.replace('.', '')} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col className={styles.line_height39} span={10}>小时内，有发送聊天消息给客户，则此订单视为有效转化</Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentBlock>
                <Page.ContentBlock title='订单' hasDivider={false}>
                    <PageContentAdvSearch>
                        <Form>
                            <Row>
                                <Col>
                                    1. 启用订单转化后，销售统计数据将于次日或手动”更新数据“完成后，自动根据当前配置计算绩效；
                                </Col>
                                <Col>
                                    2. 订单转化，仅作用于新增绑定关系计算，历史已绑定数据不做更新；
                                </Col>
                                <Col>
                                    3. 启用订单转化并勾选绑定订单，通过购物账号或者手机号绑定时，若有多笔订单，则默认计算付款时间最接近绑定时间的1笔订单；
                                </Col>
                                <Col>
                                    4. 为避免数据计算不准确，请勿反复修改配置。
                                </Col>
                            </Row>
                        </Form>
                    </PageContentAdvSearch>
                    <Form>
                        <Row>
                            <Col span={2} style={{ width: '80px' }}>
                                订单转化：
                            </Col>
                            <Col>
                                <Row><Switch checkedChildren="启用" unCheckedChildren="禁用" checked={historyOpen} onChange={this.handleSwitchHistory} /></Row>
                                <Row style={{ display: historyOpen ? 'block' : 'none' }} className={styles.otherRow}>
                                    <Col className={styles.line_height39}> <Checkbox checked={first_bind_translation} onChange={(e) => { this.handleChangeCheckbox('first_bind_translation', e) }}>绑定订单：用于客户绑定的订单计入销售统计中</Checkbox></Col>
                                    <Col className={styles.line_height39}><Checkbox checked={add_fans_translation} onChange={(e) => { this.handleChangeCheckbox('add_fans_translation', e) }}>加粉后交易订单：绑定客户时，将该客户成为微信好友后的所有订单，均计入销售统计中</Checkbox></Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Page.ContentBlock>
                <div className={styles.historyOrder_btn}>
                    {/*<Button onClick={this.saveTranslateTime} style={{ display: historyOpen || open ? 'block' : 'none'}} type="primary">保存</Button> */}
                    <Button onClick={this.saveTranslateTime} type="primary">保存</Button>
                    <Button onClick={this.resetTranslateTime} style={{ marginLeft: 16 }} >取消</Button>
                </div>
                <Modal
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <p><Icon type="exclamation-circle" theme="filled" style={{ color: '#F15043', fontSize: '26px' }} /><span style={{ marginLeft: '8px', fontSize: '26px' }}>提示</span></p>
                    <p>设置条件修改后，于次日生效，历史报表无法重新计算</p>
                </Modal>
            </div>
        )
    }
}
