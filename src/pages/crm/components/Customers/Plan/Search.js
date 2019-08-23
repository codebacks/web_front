'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React from 'react'
import {Form, Input, Button, Row, Col, DatePicker}  from 'antd'
import styles from './Index.scss'
import config from 'crm/common/config'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')
const FormItem = Form.Item
const {RangePicker} = DatePicker
const {DateFormat} = config

class Search extends React.Component {
    constructor(props) {
        super()
        this.state = {}

    }

    handleSearch = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let params = {...this.props.crm_plans.params, ...values}
                this.props.dispatch({
                    type: 'crm_plans/setParams',
                    payload: params
                })
                setTimeout(() => {
                    this.props.search()
                }, 0)
            }
        })
    };
    handleChangeDate = (val) => {
        let params = {...this.props.crm_plans.params}
        params.start_time = moment(val[0]).format(DateFormat) + ' 00:00:00'
        params.end_time = moment(val[1]).format(DateFormat) + ' 23:59:59'
        this.props.dispatch({
            type: 'crm_plans/setParams',
            payload: params,
        })
    };

    componentDidMount() {

    }

    render() {
        const {getFieldDecorator} = this.props.form
        const {params} = this.props.crm_plans
        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24},
        }
        return (
            <div className={styles.searchWrap}>
                <Form className="ant-advanced-search-form"
                    onSubmit={this.handleSearch}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator(`query`,
                                    {
                                        initialValue: params.query
                                    }
                                )(
                                    <Input placeholder="请输入计划标题"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                <RangePicker
                                    defaultValue={[moment(params.start_time, DateFormat), moment(params.end_time, DateFormat)]}
                                    style={{width:'100%'}}
                                    onChange={this.handleChangeDate}/>
                            </FormItem>
                        </Col>
                        <Col span={3}>
                            <Button type="primary" htmlType="submit"  icon="search">搜索</Button>
                        </Col>
                    </Row>
                </Form>
            </div>)
    }
}
export default Form.create()(Search)