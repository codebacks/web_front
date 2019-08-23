'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/29
 */

import React from 'react'
import { Icon, Form, Input, Modal, Button, message, notification } from 'antd'
import { connect } from 'dva'

const FormItem = Form.Item
const _state = {
	collapse: false,
	value: '',
	loading: false,
	priority: 0
}

@connect(({loading}) => ({
	loading: loading.effects['wx_replyCategories/create'],
}))
@Form.create()
class CategoryForm extends React.Component {
	constructor (props) {
		super()
		const data = {..._state}
		if (props.record.id) {
			data.id = props.record.id
			data.value = props.record.name
		}
		this.state = {...data}
	}

	handleOk = (e) => {
		e.preventDefault()

		this.props.form.validateFields((err, values) => {
			if (!err) {
				if (values.name.length > 10) {
					notification.error({
						message: '错误提示',
						description: '快捷分组长度不能超过10个字符!'
					})
					return false
				}
				if (this.state.id) {
					this.props.dispatch({
						type: 'wx_replyCategories/modify',
						payload: {name: values.name, id: this.state.id, type: 1},
						callback: () => {
							this.props.reload()
							this.handleCancel()
							message.success('创建成功！')
						}
					})

				} else {
					this.props.dispatch({
						type: 'wx_replyCategories/create',
						payload: {name: values.name, type: 1},
						callback: () => {
							this.props.reload()
							this.handleCancel()
							message.success('创建成功！')
						}
					})
				}
			}
		})
	}

	handleCancel = () => {
		this.props.onCancel()
	}

	render () {
		const {getFieldDecorator, getFieldValue} = this.props.form
		const {record} = this.props
		const formItemLayout = {
			labelCol: {span: 8},
			wrapperCol: {span: 16},
		}
		return (
			<div>
				<Modal title={this.state.id ? '编辑分组' : '新增分组'} visible={this.props.visible}
				       onCancel={this.handleCancel.bind(this)}
				       maskClosable={false}
				       footer={[
					       <Button key="cancel" type="ghost" onClick={this.handleCancel}>取消</Button>,
					       <Button key="submit" type="primary" loading={this.props.loading}
					               onClick={this.handleOk.bind(this)}>确认</Button>
				       ]}>
					<Form layout="horizontal"
					      key="edit"
					      style={{width: 400}}
					      className="ant-advanced-search-form">
						<FormItem {...formItemLayout} label={'分组名称'} required={true}>
							{getFieldDecorator('name', {
								initialValue: record.name || '',
								rules: [{
									max: 10,
									required: true,
									message: '请输入分组名称，10个字以内',
								}],
							})(
								<Input placeholder="请输入分组名称，10个字以内" />
							)}
						</FormItem>
					</Form>
				</Modal>
			</div>
		)
	}
}

CategoryForm.propTypes = {}

export default CategoryForm