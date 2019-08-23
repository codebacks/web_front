import React, { Fragment } from 'react'
import { Modal, DatePicker, Form, Radio, message } from 'antd'
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
            RangePicker:[moment().subtract(1, `days`),moment().subtract(1, `days`)]
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
        this.props.form.validateFields(['RangePicker'],(err, value) => {
            if (!err) {
                this.props.dispatch({
                    type: 'data_performance_sell/updateData',
                    payload: {
                        start_at: moment(value['RangePicker'][0]).format('YYYY-MM-DD'),
                        end_at: moment(value['RangePicker'][1]).format('YYYY-MM-DD')
                    },
                    callback: () => {
                        message.success('数据更新中，请稍后在操作记录中查看')
                        this.props.handleCancelUpdate('success')
                    }
                })
            }
        })
    }
    validateDate=(rule, value, callback)=>{
        if(moment(value[1]).subtract(31, `days`)>=moment(value[0])){
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
                title='更新数据'
                visible={this.props.visible}
                onOk={this.handleOk}
                width={480}
                onCancel={this.handleCancel}
            >
                <FormItem {...formItemLayout} label="日期：" colon={false}>
                    {getFieldDecorator('RangePicker', {
                        rules: [
                            {
                                validator: this.validateDate
                            }
                        ],
                    })(
                        <RangePicker
                            allowClear={false}
                            disabledDate={this.disabledDate}
                        />
                    )}

                </FormItem>
            </Modal>
        )
    }
}