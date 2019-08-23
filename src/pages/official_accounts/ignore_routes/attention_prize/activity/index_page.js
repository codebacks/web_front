'use strict'

import React from 'react'
import { connect } from 'dva'
import { Button, Form, Input, InputNumber, Icon, message, Radio, DatePicker } from 'antd'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import moment from 'moment'
import Page from '../../../../../components/business/Page'
import styles from './index.less'
const { RangePicker } = DatePicker


const RadioGroup = Radio.Group
const formItemLayout = {
    labelCol: {
        span: 6,
        style: {
            width: '108px',
            textAlign: 'right',
        },
    },
    wrapperCol: {
        span: 18,
        style: {
            width: '416px',
        },
    }
}

@connect(({ base, attention_prize }) => ({
    base,
    attention_prize
}))
@Form.create()
export default class extends React.Component {
    state = {
        limitType: '1',
        loading: false,
        type: '1',
        expired_type: '1',
        expired: '',
    }
    componentDidMount() {
        const query = this.props.location.query
        if (query.id) {
            this.props.dispatch({
                type: 'attention_prize/attentionPrizeDetail',
                payload: { id: query.id }
            })
        }
        this.props.dispatch({
            type: 'attention_prize/subData',
            payload: {},
            callback: (data) => {
                if (data && data[0]) {
                    this.setState({
                        mp_name: data[0].name,
                        app_id: data[0].app_id
                    })
                }
            }
        })
    }
    componentWillUnmount() {
        this.props.dispatch({
            type: 'attention_prize/clearProperty'
        })
    }
    componentDidUpdate(prevProps, prevState) {
        const query = this.props.location.query
        if (!query.id) return
        let { detail } = this.props.attention_prize
        let keys = Object.keys(detail)
        if (keys.length > 0 && !this.isLoad) {
            this.isLoad = true
            let { title, begin_at, end_at, award_type, amount, take_part_limit, limit_follow_begin_at, limit_follow_end_at } = detail
            let date = []
            let attentionDate=[]
            if (begin_at && end_at) {
                date = this.momentToDate([begin_at, end_at].join(','))
            } 

            if(limit_follow_begin_at && limit_follow_end_at){
                attentionDate = this.momentToDate([limit_follow_begin_at, limit_follow_end_at].join(','))
            }
            if(attentionDate.length>0){
                this.setState({
                    limitType:take_part_limit.toString()
                },()=>{
                    this.props.form.setFieldsValue({
                        attentionDate
                    })
                })
               
            }
            this.props.form.setFieldsValue({
                title,
                award_type,
                amount:amount/100,
                take_part_limit:take_part_limit.toString(),
                date
            })
        }

    }
    momentToDate = (value) => {
        value = value.split && value.split(',')
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]),
                moment(value[1])
            ]
        }
        return [,]
    }
    typeChange = (e) => {
        this.setState({
            type: e.target && e.target.value
        })

    }
    radioChange = (e) => {
        let value = e.target && e.target.value
        this.setState({
            limitType: value
        })
    }
    momentToStr = (value) => {
        if (Array.isArray(value) && value.length === 2) {
            return [
                moment(value[0]).format('YYYY-MM-DD'),
                moment(value[1]).format('YYYY-MM-DD')
            ]
        }
        return [,]
    }
    dateOfValidator = (rule, value, callback) => {
        if (value && value[0] && value[1]) {
            let today = (+new Date()) + 1000 * 60
            if (+value[1]._d <= today) {
                callback('活动结束时间不能小于当天')
            } else {
                callback()
            }
        } else {
            callback()
        }
    }
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let date = [], limit_follow = []
                if (values.date && values.date.length === 2) { 
                    date = this.momentToStr(values.date)
                }
                
                if(values.attentionDate && values.attentionDate.length === 2){
                    limit_follow = this.momentToStr(values.attentionDate)
                }
                let payload = {
                    app_id: this.state.app_id,
                    title: values.title,
                    begin_at: date[0],
                    end_at: date[1],
                    award_type: '1',
                    amount: Number(values.amount*100),
                    take_part_limit: values.take_part_limit,
                    limit_follow_begin_at: limit_follow[0],
                    limit_follow_end_at: limit_follow[1]
                }
                const query = this.props.location.query
                let type = 'attention_prize/postAttentionPrize'
                if (query.id) {
                    payload.id = query.id
                    type = 'attention_prize/putAttentionPrize'
                }
                this.setState({
                    loading: true
                })
                this.props.dispatch({
                    type,
                    payload,
                    callback: respones => {
                        this.setState({
                            loading: false
                        })
                        if (respones.data) {
                            // message.success(query.id ? '编辑成功' : '创建成功')
                            router.push(`/official_accounts/attention_prize/success${query.id ? '?id='+ query.id:''}`)
                        }
                    }
                })
            }
        })
    }
    goBack = (e) => {
        e.preventDefault()
        router.push('/official_accounts/attention_prize')
    }
    compareAmount = (rule, value, callback) => {
        if( value && isNaN(value) ){
            callback('请输入正确红包金额')
        }else if(value && value<1 || value>200){
            callback('红包金额1-200元')
        }else if(value && (/^(\d*\.\d{3,})$/.test(value))) {
            callback('最多只能输入2位小数')
        }else{
            callback()
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { limitType } = this.state
        const query = this.props.location.query
        return (
            <DocumentTitle title={query.id ? '编辑活动' : '创建活动'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '关注有礼',
                            path: '/official_accounts/attention_prize'
                        }, {
                            name: query.id ? '编辑活动' : '创建活动'
                        }]}
                    />
                    <div className={styles.qrcode_content}>
                        <Form style={{ width: 614, float: 'left' }}>
                            <Form.Item label="公众号名称：" {...formItemLayout} style={{ marginBottom: 8, marginTop: 16 }}>
                                <span>{this.state.mp_name}</span>
                            </Form.Item>
                            <Form.Item label="活动名称：" {...formItemLayout} >
                                {getFieldDecorator("title", {
                                    rules: [
                                        { required: true, message: '请填写活动名称', transform: (data) => data && data.trim() }
                                    ]
                                })(
                                    <Input style={{ width: 340 }} placeholder='12个字以内' maxLength={12} />
                                )}
                            </Form.Item>
                            <Form.Item  label="活动时间：" {...formItemLayout}>
                                {
                                    getFieldDecorator('date', {
                                        rules: [
                                            { required: true, message: '请选择活动时间' },
                                            { validator: this.dateOfValidator }
                                        ],
                                    })(
                                        <RangePicker
                                            placeholder={ ['开始时间', '结束时间'] }   />
                                    )
                                }
                            </Form.Item>
                        
                            <Form.Item  label="奖品选择：" {...formItemLayout}>
                                {getFieldDecorator("prize", {
                                    rules: [
                                        { required: true, message: '请选择奖品' },
                                        { validator: this.expiredOfValidator }
                                    ],
                                    initialValue: '1'
                                })(
                                    <RadioGroup >
                                        <Radio value='1'>现金红包</Radio>
                                    </RadioGroup>
                                )}
                            </Form.Item>
                            <Form.Item label="红包金额：" {...formItemLayout} >
                                {getFieldDecorator("amount", {
                                    rules: [
                                        { required: true, message: '请输入红包金额' },
                                        {
                                            validator: this.compareAmount,
                                        }
                                    ]
                                })(<InputNumber
                                    style={{ width: 100 }}
                                    min={1}
                                    step={1}
                                    placeholder='1~200元' />
                                )}
                                <span style={{marginLeft:8}}>元</span>
                            </Form.Item>
                            <Form.Item label="参与限制：" {...formItemLayout}>
                                {getFieldDecorator("take_part_limit", {
                                    rules: [
                                        { required: true, message: '请选择参与限制' }
                                    ],
                                    initialValue: '1'
                                })(
                                    <RadioGroup onChange={this.radioChange}>
                                        <Radio value='1'>所有粉丝均可领取一次</Radio>
                                        <Radio value='2'>指定时间内关注粉丝可领取一次</Radio>
                                    </RadioGroup>
                                )}
                            </Form.Item>
                            {
                                limitType === '2'?  <Form.Item     label="粉丝关注时间：" {...formItemLayout}>
                                    {
                                        getFieldDecorator('attentionDate', {
                                            rules: [
                                                { required: true, message: '请选择粉丝关注时间' },
                                            ],
                                        })(
                                            <RangePicker
                                                placeholder={['关注时间', '关注时间']}   />
                                        )
                                    }
                                </Form.Item>:''
                            }
                            <Form.Item label=" " colon={false} {...formItemLayout} >
                                <Button type='primary' onClick={e => { e.preventDefault(); this.handleSubmit() }} loading={this.state.loading} style={{ marginRight: 16 }} htmlType="submit">{query.id ? '保存' : '创建'}</Button>
                                <Button onClick={this.goBack}>取消</Button>
                            </Form.Item>
                        </Form>
                        <div className={styles.right_img}>
                            <section>
                                <img alt='' src={require('../../../assets/preview.png')} />
                                <p>预览效果图</p>
                            </section>
                        </div>
                    </div>
                </Page>

            </DocumentTitle>
        )
    }
}