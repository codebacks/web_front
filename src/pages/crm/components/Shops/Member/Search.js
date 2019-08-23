'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React from 'react'
import {Form, Input, Button, Row, Col, Select}  from 'antd'
import styles from './Index.scss'
const FormItem = Form.Item
const Option = Select.Option
class Search extends React.Component {
    constructor(props) {
        super()
        this.state = {}

    }

    handleSearch = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let params = {...this.props.crm_members.params, ...values}
                this.props.dispatch({
                    type: 'crm_members/setParams',
                    payload: params
                })
                setTimeout(() => {
                    this.props.search()
                }, 0)
            }
        })
    };

    componentDidMount() {
    }

    render() {
        const {getFieldDecorator} = this.props.form
        let {initData: config} = this.props.base
        let {params} = this.props.crm_members
        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24},
        }
        const getStoreTypeName = (id) => {
            let _item = config.store_types.filter((item) => {
                return item.id === id
            })
            return _item[0].name

        }
        const getStoreTypeOptions = () => {
            let options = [<Option key="all" value="" label="全部平台">全部平台</Option>]
            let _types = config.store_types || []
            _types.filter((item) => {
                options.push(<Option key={item.id + ''} value={item.id + ''}
                    label={item.name}>{item.name}</Option>)
            })
            return options
        }
        return (
            <div className={styles.searchWrap}>
                <Form className="ant-advanced-search-form"
                    onSubmit={this.handleSearch}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="" colon={false}>
                                {getFieldDecorator('store_type',
                                    {
                                        initialValue: params.store_type + ''
                                    }
                                )(
                                    <Select placeholder="请选择平台"  style={{width: '100%'}}>
                                        {getStoreTypeOptions()}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
                                {getFieldDecorator('query',
                                    {
                                        initialValue: params.query
                                    }
                                )(
                                    <Input className="vam" size="default" placeholder="请输入电话号码或名字搜索"/>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={3}>
                            <Button type="primary" htmlType="submit" icon="search">搜索</Button>
                        </Col>
                    </Row>
                </Form>
            </div>)
    }
}
export default Form.create()(Search)
