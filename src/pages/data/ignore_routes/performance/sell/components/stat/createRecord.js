import React, { Fragment } from 'react'
import { Modal, DatePicker, Form, Radio, message,Cascader } from 'antd'
import { connect } from 'dva'
import styles from './index.less'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

const { RangePicker } = DatePicker
const FormItem = Form.Item

@connect(({ base, data_performance_sell }) => ({
    base, data_performance_sell
}))

@Form.create()
export default class modelDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            current: 1,
            limit: 10,
            range: 'day',
            start_at: moment().subtract(1, `days`).format('YYYY-MM-DD'),
            end_at: moment().subtract(1, `days`).format('YYYY-MM-DD')
        }
    }
    componentDidMount() {
        this.props.form.setFieldsValue({
            RangePickers: [moment().subtract(1, `days`), moment().subtract(1, `days`)]
        })
    }

    handleCancel = () => {
        this.props.handleCancelUpdate()
    }
    disabledDate = (current) => {
        const { range } = this.state
        return current && current > moment().subtract(1, `${range}s`).endOf(`${range}`)
    }
    handleOk = () => {
        this.props.form.validateFields(['RangePickers','shop_id'], (err, value) => {
            if (!err) {
                this.props.dispatch({
                    type: 'data_performance_sell/createStatement',
                    payload: {
                        start_at: moment(value['RangePickers'][0]).format('YYYY-MM-DD'),
                        end_at: moment(value['RangePickers'][1]).format('YYYY-MM-DD'),
                        type: this.props.type,
                        shop_id:value['shop_id']?value['shop_id'][1]:'',
                        platform:value['shop_id']?value['shop_id'][0]:''
                    },
                    callback: () => {
                        message.success('生成中，请稍后再操作记录中查看')
                        this.props.handleCancelUpdate()
                    }
                })
            }
        })
    }
    validateDate = (rule, value, callback) => {
        if (moment(value[1]).subtract(31, `days`) >= moment(value[0])) {
            callback('日期最大范围选择不超过31天')
        }
        callback()
    }
    render() {
        const formItemLayout = {
            labelCol: {
                span: 3,
                style: {
                    width: '40px',
                    textAlign: 'right'
                },
            },
            wrapperCol: {
                span: 21,
            },
        }
        const { getFieldDecorator } = this.props.form
        return (
            <Modal
                title={this.props.type === 1 ? '生成统计报表' : "生成订单报表"}
                visible={this.props.visible}
                onOk={this.handleOk}
                width={480}
                onCancel={this.handleCancel}
            >
                <FormItem {...formItemLayout} label="店铺：" colon={false}>
                    {getFieldDecorator('shop_id')(
                        <Cascader placeholder='不限' options={this.props.data}  style={{width:'100%'}}></Cascader>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label="日期：" colon={false}>
                    {getFieldDecorator('RangePickers', {
                        rules: [
                            {
                                validator: this.validateDate
                            }
                        ],
                    })(
                        <RangePicker
                            allowClear={false}
                            style={{width:'100%'}}
                            disabledDate={this.disabledDate}
                        />
                    )}

                </FormItem>
            </Modal>
        )
    }
}