import React from 'react'
import DocumentTitle from 'react-document-title'
import Page from 'components/business/Page'
import router from 'umi/router'
import { connect } from 'dva'
import { Form, Input, DatePicker, Radio, Row, Col, Button, InputNumber, Icon, Popover, message } from 'antd'
import moment from 'moment'
import styles from './index.less'
import { ACTIVIT_STATUS } from '../../services/first_binding'
import HzInput from '@/components/HzInput'
import TextAreaCount from 'components/TextAreaCount'
@Form.create({})
@connect(({ base, platform_first_binding }) => ({
    base, platform_first_binding
}))
export default class Create extends React.PureComponent {
    state = {
        type: '创建活动',
        activity_rules: '1.参与该活动需要在该店铺至少有一单成功交易\n2.该活动每个平台ID仅可参与一次\n3.活动结束后奖品未领取，则视为自动放弃领取',
        id: "",
        isEdit: false,
        award_type: 1,
        loading: true,
        startValue: null,
        endValue: null,
        begin_at_status: '',
        begin_at_help: '',
        end_at_status: '',
        end_at_help: '',
        isClickButton: false
    }

    componentDidMount() {
        let { id } = this.props.location.query
        if (id) {
            this.setState({
                type: '编辑活动',
                id,
                isEdit: true,
            }, () => {
                this.getEditData(id)
            })
        }
    }


    getEditData = (id) => {
        this.props.dispatch({
            type: 'platform_first_binding/activitiesDetail',
            payload: {
                activity_id: id
            }, callback: (detailData) => {
                let data = detailData.data
                this.props.form.setFieldsValue({
                    name: data.name,
                    title: data.title,
                    award_type: data.award_type,
                    price_type: data.price_type,
                    price: Number((data.price / 100).toFixed(2)),
                    reward_coin_count: data.reward_coin_count,
                    activity_rules: data.activity_rules
                })

                if (data.begin_at) {
                    this.setState({
                        startValue: moment(data.begin_at)
                    })
                }
                if (data.end_at) {
                    this.setState({
                        endValue: moment(data.end_at)
                    })
                }

                if (data.price_type === 2) {
                    setTimeout(() => {
                        this.props.form.setFieldsValue({
                            min_price: Number((data.min_price / 100).toFixed(2)),
                            max_price: Number((data.max_price / 100).toFixed(2)),
                        })
                    }, 100)
                }
                this.setState({
                    activity_rules: data.activity_rules,
                })
            }
        })
    }

    // 奖品类型
    handleAwardTypeChange = (e) => {
        this.setState({
            award_type: e.target.value,
        })
    }

    //金额类型
    handlePriceTypeChange = (e) => {
        this.setState({
            price_type: e.target.value,
        })
    }

    // 保存
    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!this.state.startValue) {
                this.setState({
                    begin_at_status: 'error',
                    begin_at_help: '请选择活动开始时间'
                })
            }
            if (!this.state.endValue) {
                this.setState({
                    end_at_status: 'error',
                    end_at_help: '请选择活动结束时间'
                })
            }

            if (!err && (this.state.endValue && this.state.startValue)) {
                if (this.state.startValue) {
                    values.begin_at = this.state.startValue.format('YYYY-MM-DD HH:mm:ss')
                }
                if (this.state.endValue) {
                    values.end_at = this.state.endValue.format('YYYY-MM-DD HH:mm:ss')
                }

                if (values.price_type === 2) {
                    values.min_price = Number((values.min_price * 100).toFixed(2))
                    values.max_price = Number((values.max_price * 100).toFixed(2))
                } else if (values.price_type === 1) {
                    values.price = Number((values.price * 100).toFixed(2))
                }

                let data = {
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
            type: 'platform_first_binding/create',
            payload: {
                data: data
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    this.setState({
                        isClickButton: true
                    }, () => {
                        message.success('创建活动成功！')
                        router.replace(`/platform/first_binding`)
                    })
                }

            }
        })
    }

    getUpdateData = (data) => {
        this.props.dispatch({
            type: 'platform_first_binding/update',
            payload: {
                data: { ...data, id: this.state.id }
            },
            callback: (meta) => {
                if (meta && meta.code === 200) {
                    this.setState({
                        isClickButton: true
                    }, () => {
                        message.success('编辑活动成功!')
                        router.replace(`/platform/first_binding`)
                    })
                }
            }
        })
    }

    // 取消
    handleCreateCancel = () => {
        router.replace(`/platform/first_binding`)
    }

    // 活动名称-限制12位
    validateName = (rule, value, callback) => {
        if (!value) {
            callback('请输入活动名称')
            return
        } else if (value.length > 12) {
            callback('活动名称限12字以内')
            return
        }
        callback()
    }

    // 活动标题-限制8位
    validateTitle = (rule, value, callback) => {
        if (!value) {
            callback('请输入活动标题')
            return
        } else if (value.length > 8) {
            callback('活动标题限8字以内')
            return
        }
        callback()
    }

    // 红包金额限制1~200
    formatterPoint = (value) => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 200)) {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number' && (Number(value) >= 1 && Number(value) <= 200)) {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    // 活动说明
    handleTextChange = () => {
        const value = '1.参与该活动需要在该店铺至少有一单成功交易\n2.该活动每个平台ID仅可参与一次\n3.活动结束后奖品未领取，则视为自动放弃领取'
        this.props.form.setFieldsValue({
            activity_rules: value
        })
        this.setState({
            activity_rules: value
        })
    }

    textAreaChange = (e) => {
        this.setState({
            activity_rules: e.target.value,
        })
    }

    // 限制可以选择的时间(不能选择今天以前的日期)
    disabledDate = (current) => {
        return current && current < moment().subtract(1, 'days')
    }

    // 活动时间
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue
        if (endValue) {
            return (startValue < moment().subtract(1, 'days')) || (moment(startValue).subtract(1, 'days') > endValue)
        }
        return startValue < moment().subtract(1, 'days')
    }

    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue
        if (startValue) {
            return (endValue < moment().subtract(1, 'days')) || (moment(endValue).subtract(-1, 'days') < startValue)
        }
        return endValue < moment().subtract(1, 'days')
    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        })
    }

    onStartChange = (value) => {
        if (value) {
            this.setState({
                begin_at_status: '',
                begin_at_help: ''
            })
        }
        this.onChange('startValue', value)
    }

    onEndChange = (value) => {
        if (value) {
            this.setState({
                end_at_status: '',
                end_at_help: ''
            })
        }
        this.onChange('endValue', value)
    }

    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true })
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open })
    }

    render() {
        const { type } = this.state
        const FormItem = Form.Item
        const RadioGroup = Radio.Group
        const { getFieldDecorator, getFieldValue } = this.props.form
        const { TextArea } = Input
        const { startValue, endValue, endOpen } = this.state
        const { activitiesDetailData } = this.props.platform_first_binding

        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '80px' }
            },
            wrapperCol: {
                span: 12
            }
        }
        return (
            <DocumentTitle title="创建活动">
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '活动列表',
                            path: '/platform/first_binding'
                        }, {
                            name: type
                        }]}
                    />
                    <Row>
                        <Col span={15} style={{ width: 780 }}>
                            <Form className='hz-margin-base-top'>
                                <FormItem {...formItemLayout} label="活动名称">
                                    {getFieldDecorator('name', {
                                        rules: [
                                            { required: true, validator: this.validateName }]
                                    })(
                                        <HzInput placeholder="12字以内" maxLength={12} />
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="活动标题" wrapperCol={{ span: 13 }}>
                                    <Row>
                                        <Col span={22}>
                                            <span style={{ position: 'relative' }}>
                                                {getFieldDecorator('title', {
                                                    rules: [
                                                        { required: true, validator: this.validateTitle }]
                                                })(
                                                    <HzInput placeholder="8个字以内" maxLength={8} />
                                                )}
                                            </span>
                                        </Col>
                                        <Col span={2}>
                                            <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>活动标题将展示在页面的导航栏上</div>}>
                                                <Icon className={styles.questionCircle} type="question-circle" />
                                            </Popover>
                                        </Col>
                                    </Row>
                                </FormItem>
                                <FormItem {...formItemLayout}
                                    label="活动时间"
                                    wrapperCol={{ span: 12 }}
                                    required={true}
                                    style={{ marginBottom: 0 }}
                                >
                                    <div style={{ display: 'flex' }}>
                                        <FormItem
                                            validateStatus={this.state.begin_at_status}
                                            help={this.state.begin_at_help}
                                        >
                                            {
                                                this.state.isEdit && activitiesDetailData.status === ACTIVIT_STATUS[1].value ?
                                                    <DatePicker
                                                        disabled
                                                        showTime={{ defaultValue: moment('00:00', 'HH:mm'), format: 'HH:mm' }}
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={startValue}
                                                    /> :
                                                    <DatePicker
                                                        disabledDate={this.disabledStartDate}
                                                        // showTime={{ defaultValue: moment('00:00', 'HH:mm') }}
                                                        showTime={{ defaultValue: moment('00:00', 'HH:mm'), format: 'HH:mm' }}
                                                        format="YYYY-MM-DD HH:mm"
                                                        value={startValue}
                                                        placeholder="开始时间"
                                                        onChange={this.onStartChange}
                                                        onOpenChange={this.handleStartOpenChange}
                                                    />
                                            }
                                        </FormItem>
                                        <span className="hz-margin-small-left-right">~</span>
                                        <FormItem
                                            validateStatus={this.state.end_at_status}
                                            help={this.state.end_at_help}
                                        >
                                            <DatePicker
                                                disabledDate={this.disabledEndDate}
                                                showTime={{ defaultValue: moment('00:00', 'HH:mm'), format: 'HH:mm' }}
                                                format="YYYY-MM-DD HH:mm"
                                                value={endValue}
                                                placeholder="结束时间"
                                                onChange={this.onEndChange}
                                                open={endOpen}
                                                onOpenChange={this.handleEndOpenChange}
                                            />
                                        </FormItem>
                                    </div>
                                </FormItem>
                                <FormItem {...formItemLayout} label="奖品类型">
                                    {getFieldDecorator('award_type', {
                                        initialValue: this.state.award_type
                                    })(
                                        <RadioGroup onChange={this.handleAwardTypeChange}>
                                            <Radio value={1}>现金红包</Radio>
                                            {/* <Radio value={2}>抓娃娃游戏币</Radio> */}
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                {
                                    getFieldValue('award_type') === 1 && (
                                        <div>
                                            <FormItem {...formItemLayout} label="红包类型">
                                                {getFieldDecorator('price_type', {
                                                    initialValue: this.state.award_type
                                                })(
                                                    <RadioGroup onChange={this.handlePriceTypeChange}>
                                                        <Radio value={1}>固定金额</Radio>
                                                        <Radio value={2}>随机金额</Radio>
                                                    </RadioGroup>
                                                )}
                                            </FormItem>
                                            <FormItem {...formItemLayout} label="红包金额">
                                                {
                                                    getFieldValue('price_type') === 1 && (
                                                        <div>
                                                            {getFieldDecorator('price', {
                                                                rules: [{ required: true, message: '请输入金额!' }],
                                                            })(
                                                                <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" style={{ width: 160 }} />
                                                            )}
                                                            <span className="hz-margin-small-left">元</span>
                                                        </div>
                                                    )
                                                }
                                                {
                                                    getFieldValue('price_type') === 2 && (
                                                        <div style={{ display: 'flex' }}>
                                                            <FormItem style={{ marginBottom: '0' }}>
                                                                {getFieldDecorator('min_price', {
                                                                    rules: [{ required: true, message: '请输入金额!' }],
                                                                })(
                                                                    <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" style={{ width: 160 }} />
                                                                )}
                                                            </FormItem>
                                                            <span className='hz-margin-small-left-right' style={{ marginBottom: '0' }}>~</span>
                                                            <FormItem style={{ marginBottom: '0' }}>
                                                                {getFieldDecorator('max_price', {
                                                                    rules: [{ required: true, message: '请输入金额!' }],
                                                                })(
                                                                    <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" style={{ width: 160 }} />
                                                                )}
                                                            </FormItem>
                                                            <span className="hz-margin-small-left">元</span>
                                                        </div>
                                                    )
                                                }
                                            </FormItem>
                                        </div>
                                    )
                                }
                                {
                                    getFieldValue('award_type') === 2 && (
                                        <FormItem {...formItemLayout} label="输入币数">
                                            <span className="hz-margin-small-right">赠送</span>
                                            {getFieldDecorator('reward_coin_count', {
                                                rules: [{ required: true, message: '请输入币数!' }],
                                            })(
                                                <InputNumber min={1} placeholder="输入大于1的整数币" style={{ width: 160 }} />
                                            )}
                                            <span className="hz-margin-small-left">个抓娃娃游戏币</span>
                                        </FormItem>
                                    )
                                }
                                <FormItem {...formItemLayout} label="活动规则" style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('activity_rules', {
                                        rules: [{ required: true, message: '请输入活动规则!' }],
                                        initialValue: this.state.activity_rules
                                    })(
                                        <TextAreaCount
                                            placeholder="请输入或粘贴客户需要了解的活动规则，文字可换行"
                                            style={{ height: 130, width: 390 }}
                                            limitSize={300}
                                            rows={5}
                                            onChange={this.textAreaChange}
                                        />
                                    )}
                                </FormItem>
                                <FormItem>
                                    <a href="javascript:;" style={{ float: "left", marginLeft: 80 }} onClick={this.handleTextChange}>示例文字</a>
                                </FormItem>
                                <div className='hz-margin-base-top-bottom'>
                                    <Button type="primary" htmlType="submit" onClick={() => this.handleSubmit()} disabled={this.state.isClickButton}>保存</Button>
                                    <Button style={{ marginLeft: 16 }} onClick={() => this.handleCreateCancel()}>取消</Button>
                                </div>
                            </Form>
                        </Col>
                        <Col span={6}>
                            <div className={styles.phoneWrap}>
                                <div className={styles.phoneTitle}>
                                    <div className={styles.phoneTitleText}>{this.props.form.getFieldValue('title')}</div>
                                </div>
                                <div className={styles.phoneContent}>
                                    <img src={require('../../assets/images/firstBindingBg.png')} alt="" className={styles.phoneBanner} />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Page>
            </DocumentTitle >
        )
    }
}

