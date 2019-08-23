/* eslint-disable no-mixed-spaces-and-tabs */
'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React, {PropTypes} from 'react'
import {Form, Input, Icon, Button, Row, Col, Popover, Select} from 'antd'
import styles from './Index.scss'


const FormItem = Form.Item
const Option = Select.Option

class Search extends React.Component {
    constructor(props) {
        super()
        this.state = {
            status: '',

        }
    }

	handleSearch = () => {
	    this.props.search()
	};

	handleChange(key, e) {
	    let val = ''
	    if (key === 'query') {
	        val = e.target.value
	    } else {
	        val = e
	    }
	    let params = {...this.props.friends.params}

	    if (key === 'status') {
	        let values = {}
	        values.is_block = ''
	        values.is_delete = ''
	        if (val === '0') {
	            values.is_block = 0
	            values.is_delete = 0
	        } else if (val === '1') {
	            values.is_delete = 1
	        } else if (val === '2') {
	            values.is_block = 1
	            values.is_delete = 0
	        } else if (val === '3') {
	            values.is_block = 1
	            values.is_delete = 1
	        }
	        params = {...params, ...values}
	    }

	    params[key] = val
	    if (key === 'user_id') {
	        params['uin'] = ''
	    }
	    this.props.dispatch({
	        type: 'friends/setProperty',
	        payload: {params: params},
	    })
	}

	// loadUsers = () => {
	// 	this.props.dispatch({
	// 		type: 'friends/queryUsers',
	// 		payload: {}
	// 	});
	// };
	// loadWechats = () => {
	// 	setTimeout(() => {
	// 		this.props.dispatch({
	// 			type: 'friends/queryWechats',
	// 			payload: {}
	// 		});
	// 	}, 0)
	// };

	componentDidMount() {
	    // this.loadUsers();
	    // this.loadWechats();

	}

	render() {
	    let {params, users, wechats} = this.props.friends
	    const formItemLayout = {
	        labelCol: {span: 0},
	        wrapperCol: {span: 24},
	    }
	    const wechatList = []
	    wechats.map((item) => {
	        if (item.uin) {
	            if (params.user_id) {
	                if (item.user.id === window.parseInt(params.user_id)) {
	                    wechatList.push(item)
	                }
	            } else {
	                wechatList.push(item)
	            }
	        }
	    })
	    return (
	        <div className={styles.searchWrap}>
	            <Form className="ant-advanced-search-form">
	                <Row gutter={20}>
	                    <Col span={6}>
	                        <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
	                            <Input className="vam" onChange={this.handleChange.bind(this, 'query')} size="default"
								       value={params.query}
								       onPressEnter={this.handleSearch}
								       placeholder="请输入用户昵称、备注或微信号"/>
	                        </FormItem>
	                    </Col>
	                    <Col span={5}>
	                        <FormItem {...formItemLayout} label="" colon={false}>
	                            <Select showSearch
	                                optionFilterProp="children"
	                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
	                                placeholder="请选择客服" className="vam" size="default"
								        value={params.user_id + ''}
								        onChange={this.handleChange.bind(this, 'user_id')}>
	                                <Option value="">全部【客服】</Option>
	                                {users.map((item) => {
	                                    return <Option value={item.id + ''} key={item.id}>
	                                        {item.username}{item.nickname ? <span>【{item.nickname}】</span> : ''}
	                                    </Option>
	                                })}
	                            </Select>
	                        </FormItem>
	                    </Col>
	                    <Col span={5}>
	                        <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
	                            <Select
	                                showSearch
	                                optionFilterProp="children"
	                                filterOption={(input, option) => option.props.children && option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 }
									    placeholder="全部【微信号】" size="default"
								        value={params.uin + ''}
								        onChange={this.handleChange.bind(this, 'uin')}
	                            >
	                                <Option value="">全部【微信号】</Option>
	                                {wechatList.map((item) => {
	                                    const val =`${item.nickname}[${item.alias}]`
	                                    return <Option value={item.uin + ''}
										               title={`${item.nickname}[${item.alias}]`}
										               key={item.uin}>{ val }</Option>
	                                })}
	                            </Select>
	                        </FormItem>
	                    </Col>
	                    <Col span={5}>
	                        <FormItem {...formItemLayout} label="" className="resetIpt" colon={false}>
	                            <Select placeholder="全部状态" size="default"
								        value={params.status + ''}
								        onChange={this.handleChange.bind(this, 'status')}>
	                                <Option value="">全部【状态】</Option>
	                                <Option value="0">正常</Option>
	                                <Option value="1">已删除</Option>
	                                <Option value="2">已被对方删除</Option>
	                                <Option value="3">互相删除</Option>
	                            </Select>
	                        </FormItem>
	                    </Col>
	                    <Col span={3} style={{ padding: '0 7.5px', marginTop: '4px' }}><Button type="primary" icon="search" onClick={this.handleSearch}/></Col>
	                </Row>
	            </Form>
	        </div>)
	}
}

export default Form.create()(Search)
