import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import router from 'umi/router'
import { connect } from 'dva'
import { Form, Radio, Row, Button, InputNumber, message, Switch } from 'antd'
import WeBox from '../../../home/components/WeBox'
import TextAreaCount from 'components/TextAreaCount'
import styles from './index.less'
import classnames from 'classnames'
import { STATUS, CONDITIONS_TYPE, SETTLEMENT_TYPE } from '../../services/distributor/distributor_center'

@Form.create({})
@connect(({ base, distributor_center }) => ({
    base, distributor_center
}))
export default class Set extends React.PureComponent {
    state = {
        conditionsValue: 1,
        isOpenSetSwitch: false,
        conditions: 1,
        isEdit: false,
        settlement_type: 1,
        recruitment_plan: '',
        mobile: ''
    }

    mobile = this.props.base.initData.company.mobile

    recruitment_plan = `小伙伴，欢迎加入我们\n我们有专业的运营团队，竭诚为您的销售工作提供完善的支持\n我们诚挚邀请您加入我们的分销员推广计划，成为我们商城的分销员，一起分享收获的喜悦\n您只需要将高品质的商品分享推荐给别人，收获他人的感谢的同时，挣得属于自己的利润\n\n业绩说明：\n1.买家第一次购买分销员推广的商品，即与分销员绑定客户关系，后续该买家在店铺购买的所有商品，都算作该分销员的业绩\n2.佣金结算时间前，买家退货退款，分销员业绩会相应扣除，该部分业绩不会进入结算\n3.当与分销员绑定关系的买家成为分销员后，其购买消费不再计算为上级分销员的业绩\n4.分销员通过自己的分享链接购买商品不计入业绩\n\n结算说明：\n1.分销员的每笔佣金的结算时间：${this.state.settlement_type === SETTLEMENT_TYPE.orderEnd ? '订单完成后结算' : '订单完成后7天结算'}\n2.分销员可以随时对已结算的佣金发起提现申请\n3.提现佣金在审核通过后，会直接存入微信零钱\n\n其他说明：\n1.已售出商品的任何问题，由本商家负责\n2.不传播或扩散有关于政治、色情等任何违法的信息，如果触犯任何法律相关的问题，商家不负任何责任\n3.以上内容解释权归本商家所有\n4.提现问题可直接联系商家：手机 ${this.mobile ? this.mobile : ''}`

    componentDidMount() {
        this.getCenterList()
    }

    getCenterList = () => {
        this.props.dispatch({
            type: 'distributor_center/centerList',
            payload: {},
            callback: (data) => {
                if (data.created_at && data.status === STATUS.isStatus) {
                    this.setState({
                        isEdit: true,
                        isOpenSetSwitch: true,
                    }, () => {
                        this.props.form.setFieldsValue({
                            commission_rate: data.commission_rate,
                            settlement_type: data.settlement_type,
                            audit_type: data.audit_type,
                            recruitment_plan: data.recruitment_plan
                        })
                        this.setState({
                            conditionsValue: data.conditions.type
                        })

                        if (data.conditions.type === CONDITIONS_TYPE.orderQuantity) {
                            this.props.form.setFieldsValue({
                                order_quantity: data.conditions.value,
                            })
                        } else if (data.conditions.type === CONDITIONS_TYPE.orderAmount) {
                            this.props.form.setFieldsValue({
                                order_amount: Number((data.conditions.value / 100).toFixed(2)),
                            })
                        }
                    })
                } else if (data.created_at && data.status === STATUS.unStatus) {
                    this.setState({
                        isEdit: true,
                        isOpenSetSwitch: false,
                    })
                }
            }
        })
    }

    // 保存
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let data = {
                    conditions: {
                        type: '',
                        value: ''
                    }
                }

                if (this.state.conditionsValue === CONDITIONS_TYPE.orderQuantity) {
                    data.conditions.type = this.state.conditionsValue
                    data.conditions.value = values.order_quantity
                } else if (this.state.conditionsValue === CONDITIONS_TYPE.orderAmount) {
                    data.conditions.type = this.state.conditionsValue
                    data.conditions.value = Number((values.order_amount * 100).toFixed(2))
                } else if (this.state.conditionsValue === CONDITIONS_TYPE.noRestriction) {
                    data.conditions.type = this.state.conditionsValue
                    data.conditions.value = null
                }

                this.state.isOpenSetSwitch ? values.status = STATUS.isStatus : values.status = STATUS.unStatus

                data = {
                    ...data,
                    ...values,
                }

                if (this.state.isEdit) {
                    this.getUpdateData(data)
                } else {
                    this.getCreateData(data)
                }
            }
        })
    }

    getCreateData = (data) => {
        this.props.dispatch({
            type: 'distributor_center/create',
            payload: {
                data: data
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success('设置分销员成功！')
                    router.replace(`/mall/distributor_center`)
                }
            }
        })
    }

    getUpdateData = (data) => {
        this.props.dispatch({
            type: 'distributor_center/update',
            payload: {
                data: { ...data, id: this.state.id }
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    message.success('编辑分销员成功!')
                    router.replace(`/mall/distributor_center`)
                }
            }
        })
    }

    // 分销功能开启、关闭
    handleOpenSetChange = (checked) => {
        this.setState({
            isOpenSetSwitch: checked
        }, () => {
            const { centerList } = this.props.distributor_center
            if (centerList.created_at) {
                this.props.dispatch({
                    type: 'distributor_center/update',
                    payload: {
                        data: {
                            status: checked === true ? STATUS.isStatus : STATUS.unStatus
                        }
                    },
                    callback: () => {
                        checked === true ? message.success('启用分销功能') : message.success('关闭分销功能')
                        if (checked === true) {
                            this.getCenterList()
                        }
                    }
                })
            }

        })

    }

    // 招募条件
    handleConditionsChange = (e) => {
        this.setState({
            conditionsValue: e.target.value
        }, () => {
            this.props.form.validateFields(['order_quantity', 'order_amount'], { force: true })
        })
    }

    // 订单完成结算
    handleSettlementChange = (e) => {
        this.setState({
            settlement_type: e.target.value
        }, () => {
            const recruitment_plan = `小伙伴，欢迎加入我们\n我们有专业的运营团队，竭诚为您的销售工作提供完善的支持\n我们诚挚邀请您加入我们的分销员推广计划，成为我们商城的分销员，一起分享收获的喜悦\n您只需要将高品质的商品分享推荐给别人，收获他人的感谢的同时，挣得属于自己的利润\n\n业绩说明：\n1.买家第一次购买分销员推广的商品，即与分销员绑定客户关系，后续该买家在店铺购买的所有商品，都算作该分销员的业绩\n2.佣金结算时间前，买家退货退款，分销员业绩会相应扣除，该部分业绩不会进入结算\n3.当与分销员绑定关系的买家成为分销员后，其购买消费不再计算为上级分销员的业绩\n4.分销员通过自己的分享链接购买商品不计入业绩\n\n结算说明：\n1.分销员的每笔佣金的结算时间：${this.state.settlement_type === SETTLEMENT_TYPE.orderEnd ? '订单完成后结算' : '订单完成后7天结算'}\n2.分销员可以随时对已结算的佣金发起提现申请\n3.提现佣金在审核通过后，会直接存入微信零钱\n\n其他说明：\n1.已售出商品的任何问题，由本商家负责\n2.不传播或扩散有关于政治、色情等任何违法的信息，如果触犯任何法律相关的问题，商家不负任何责任\n3.以上内容解释权归本商家所有\n4.提现问题可直接联系商家：手机 ${this.mobile ? this.mobile : ''}`
            this.props.form.setFieldsValue({
                recruitment_plan: recruitment_plan
            })
            this.recruitment_plan = recruitment_plan
        })

    }

    validateSingleValue = (rule, value, callback) => {
        if (this.state.conditionsValue === CONDITIONS_TYPE.orderQuantity && !value) {
            callback('请输入数量')
            return
        }
        callback()
    }

    validateYuanValue = (rule, value, callback) => {
        if (this.state.conditionsValue === CONDITIONS_TYPE.orderAmount && !value) {
            callback('请输入消费金额')
            return
        }
        callback()
    }

    // 输入限制购买单数
    formatterSingle = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 10000)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 10000)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    // 输入消费满的金额
    formatterYuan = (value) => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 1000000)) {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number' && (Number(value) >= 1 && Number(value) <= 1000000)) {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    // 输入佣金比例
    formatterInteger = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) > 0 && Number(value) <= 100)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value > 0 && Number(value) <= 100)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    // 取消
    handleCreateCancel = () => {
        router.push(`/mall/distributor_center`)
    }

    // 跳转到商品管理页面
    goodsManagementChange = () => {
        router.push(`/mall/goods_management`)
    }

    // 载入示例
    handleTextChange = (recruitment_plan) => {
        this.props.form.setFieldsValue({
            recruitment_plan: recruitment_plan
        })
        this.recruitment_plan = recruitment_plan
    }

    render() {
        const FormItem = Form.Item
        const RadioGroup = Radio.Group
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '134px' }
            },
            wrapperCol: {
                span: 12
            }
        }
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        }

        const formSetLayout = {
            labelCol: {
                span: 6,
                style: { width: '80px' }
            },
            wrapperCol: {
                span: 12
            }
        }

        return (
            <DocumentTitle title="设置分销员">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '分销员中心',
                            path: '/mall/distributor_center'
                        }, {
                            name: '设置分销员'
                        }]}
                    />
                    <Row>
                        <Form className='hz-margin-base-top'>
                            <FormItem {...formSetLayout} label="分销功能" style={{ marginBottom: 0 }}>
                                {getFieldDecorator('status', {
                                })(
                                    <Switch
                                        checkedChildren="开启"
                                        unCheckedChildren="关闭"
                                        onChange={this.handleOpenSetChange}
                                        checked={this.state.isOpenSetSwitch}
                                    />
                                )}

                                {
                                    this.state.isOpenSetSwitch ?
                                        <p className={classnames(styles.textColorSecondary, styles.mgTp)} >
                                            关闭该功能则小程序商城“我的”页面将不再显示该功能入口
                                        </p> :
                                        <p className={classnames(styles.textColorSecondary, styles.mgTp)}>
                                            开启该功能即可进行相关设置，小程序商城“我的”页面同时会显示“分销中心”入口
                                        </p>
                                }
                            </FormItem>
                            {
                                this.state.isOpenSetSwitch ?
                                    <WeBox {...this.props} title="分销员设置" style={{ marginBottom: 0 }}>
                                        <FormItem {...formItemLayout}
                                            label="分销商品招募条件"
                                            style={{ marginTop: -20 }}>
                                            {getFieldDecorator('conditions_type', {
                                                rules: [{ required: true }],
                                                initialValue: this.state.conditionsValue
                                            })(
                                                <RadioGroup onChange={this.handleConditionsChange}>
                                                    <Radio
                                                        value={1}
                                                        style={radioStyle}
                                                        className={classnames("hz-margin-base-bottom", styles.radiolineformitem)}
                                                    >
                                                        <span className={styles.radiolineformitemcontain}>
                                                            <span>成功购买过</span>
                                                            <span className={styles.radiolineformitemformitem}>
                                                                <FormItem>
                                                                    {getFieldDecorator('order_quantity', {
                                                                        rules: [{ validator: this.validateSingleValue }]
                                                                    })(
                                                                        <InputNumber
                                                                            formatter={this.formatterSingle}
                                                                            parser={this.formatterSingle}
                                                                            min={1} max={10000}
                                                                            placeholder='请输入'
                                                                        />
                                                                    )}
                                                                </FormItem>
                                                            </span>
                                                            <span>单</span>
                                                        </span>
                                                    </Radio>
                                                    <Radio value={2}
                                                        style={radioStyle}
                                                        className={classnames("hz-margin-base-bottom", styles.radiolineformitem)}
                                                    >
                                                        <span className={styles.radiolineformitemcontain}>
                                                            <span>店铺消费满</span>
                                                            <span className={styles.radiolineformitemformitem}>
                                                                <FormItem>
                                                                    {getFieldDecorator('order_amount', {
                                                                        rules: [{ validator: this.validateYuanValue }],
                                                                    })(
                                                                        <InputNumber
                                                                            formatter={this.formatterYuan}
                                                                            parser={this.formatterYuan}
                                                                            min={1} max={1000000}
                                                                            placeholder='请输入'
                                                                        />
                                                                    )}
                                                                </FormItem>
                                                            </span>
                                                            <span>元</span>
                                                        </span>
                                                    </Radio>
                                                    <Radio value={3} style={radioStyle}>不过滤</Radio>
                                                </RadioGroup>
                                            )}
                                            <div className={classnames(styles.textColorSecondary, styles.mgTp)}>满足条件的客户通过后自动成为分销员</div>
                                        </FormItem>
                                        <FormItem {...formItemLayout} label="店铺佣金比例">
                                            {getFieldDecorator('commission_rate', {
                                                rules: [
                                                    { required: true, message: '请输入店铺提佣比例' }]
                                            })(
                                                <InputNumber
                                                    min={0} max={100}
                                                    formatter={this.formatterInteger}
                                                    parser={this.formatterInteger}
                                                    placeholder="建议设置1%-4%"
                                                    style={{ width: 140 }}
                                                />
                                            )}
                                            <span className='hz-margin-small-left-right'>%</span>
                                            <span className={classnames(styles.textColorSecondary, styles.mgTp)}>该比例为全店铺所有商品默认抽佣比例，可以去
                                                <a href="javascript:;" onClick={() => this.goodsManagementChange()}>“商品管理”</a>设置单个商品抽佣比例
                                            </span>
                                        </FormItem>
                                        <FormItem {...formItemLayout} label="佣金结算时间">
                                            {getFieldDecorator('settlement_type', {
                                                initialValue: this.state.settlement_type
                                            })(
                                                <RadioGroup onChange={this.handleSettlementChange}>
                                                    <Radio value={1}>订单完成后结算</Radio>
                                                    <Radio value={2}>订单完成后7天结算</Radio>
                                                </RadioGroup>
                                            )}
                                            <div className={classnames(styles.textColorSecondary, styles.mgTp)} style={{ lineHeight: '24px' }}>
                                                佣金结算时间即当分销员推广的订单满足设置条件时结算佣金的时间，佣金结算后发生的售后行为风险由商家自行承担
                                            </div>
                                        </FormItem>
                                        <FormItem {...formItemLayout} label="提现审核方式">
                                            {getFieldDecorator('audit_type', {
                                                initialValue: 1
                                            })(
                                                <RadioGroup>
                                                    <Radio value={1}>人工审核</Radio>
                                                    <Radio value={2}>自动审核</Radio>
                                                </RadioGroup>
                                            )}
                                        </FormItem>
                                        <FormItem {...formItemLayout} label="招募计划" style={{ marginBottom: 0 }}>
                                            {getFieldDecorator('recruitment_plan', {
                                                initialValue: this.recruitment_plan,
                                                rules: [
                                                    { required: true, message: '请输入招募计划!' },
                                                    { max: 600, message: '不能超过600个字' }
                                                ],
                                            })(
                                                <TextAreaCount
                                                    style={{ width: 480 }}
                                                    rows={8}
                                                    limitSize={600}
                                                    onChange={this.textAreaChange}
                                                />
                                            )}
                                        </FormItem>
                                        <FormItem >
                                            <a href="javascript:;"
                                                onClick={() => this.handleTextChange(this.recruitment_plan)}
                                                style={{ display: 'block', marginLeft: 134 }}>
                                                载入示例
                                            </a>
                                        </FormItem>
                                        <div className='hz-margin-base-top-bottom' style={{ marginLeft: 134 }}>
                                            <Button type="primary" htmlType="submit" onClick={() => this.handleSubmit()}>保存</Button>
                                            <Button style={{ marginLeft: 16 }} onClick={() => this.handleCreateCancel()}>取消</Button>
                                        </div>
                                    </WeBox> : ''
                            }
                        </Form>
                    </Row>
                </Page>
            </DocumentTitle >
        )
    }
}