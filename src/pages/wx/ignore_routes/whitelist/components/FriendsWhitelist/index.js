/**
 * 文件说明: 重复好友白名单
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/11/13
 */
import React from 'react'
import {Table, Form, Input, Button, Icon, Row, Col, Popconfirm, message, Alert} from 'antd'
import {connect} from 'dva'
import documentTitleDecorator from 'hoc/documentTitle'
import config from 'wx/common/config'
import Page from 'wx/components/Page'
import Helper from 'wx/utils/helper'
import EllipsisPopover from 'components/EllipsisPopover'
import styles from './index.less'

const FormItem = Form.Item
const Search = Input.Search

const {pageSizeOptions, DefaultAvatar} = config

@connect(({ base, wx_friendsWhitelist, loading}) => ({
	base, wx_friendsWhitelist,
	whitelistLoading: loading.effects['wx_friendsWhitelist/list'],
	removeLoading: loading.effects['wx_friendsWhitelist/remove']
}))
@documentTitleDecorator()
export default class extends React.Component {
	constructor(props) {
		super(props)
		this.state = {}
	}

	componentDidMount() {
		this.handleSearch()
	}

	handleChange = (key, e) => {
		let val = ''
		if(e && e.target) {
			val = e.target.value
		} else {
			val = e
		}
		let params = {...this.props.wx_friendsWhitelist.params}
		params[key] = val
		this.props.dispatch({
			type: 'wx_friendsWhitelist/setParams',
			payload: {
				params: params
			}
		})
	}

	handleRemove = (username) => {
		this.props.dispatch({
			type: 'wx_friendsWhitelist/remove',
			payload: {
				username: username
			},
			callback: () => {
				message.success('移出成功', 1, () => {
					const {params, total, current} = this.props.wx_friendsWhitelist
					const limit = params.limit
					if (total - 1 > limit * current) {
						this.goPage(current)
					} else {
						this.goPage(current -1)
					}
				})
			}
		})
	}

	goPage = (page) => {
		this.props.dispatch({
			type: 'wx_friendsWhitelist/list',
			payload: {page: page}
		})
	}

	handleChangeSize = (current, size) => {
		let params = {...this.props.wx_friendsWhitelist.params}
		params.limit = size
		this.props.dispatch({
			type: 'wx_friendsWhitelist/setParams',
			payload: {params: params},
		})
		this.goPage(1)
	}


	handleSearch = () => {
		this.goPage(1)
	}

	render() {
		const {params, list, total, current} = this.props.wx_friendsWhitelist
		const {whitelistLoading, removeLoading} = this.props

		const columns = [
			{
				title: '头像',
				dataIndex: 'head_img_url',
				className: `${styles.firstColumn}`,
				render: (text, record) => {
					return <img src={Helper.getWxThumb(text)} className={styles.avatar}
					            onError={(e) => {e.target.src = DefaultAvatar}}
					            rel="noreferrer"
					            alt=""
					/>
				}
			},
			{
				title: '微信昵称',
				dataIndex: 'nickname',
				render: (text) => {
					return <span style={{whiteSpace: 'pre-wrap'}}>{text}</span>
				}
			},
			{
				title: '微信号',
				dataIndex: 'alias',
				render: (text, record) => {
					return text || record.username
				}
			},
			{
				title: '重复数量',
				dataIndex: 'repeat_times',
			},
			{
				title: '重复情况',
				dataIndex: 'remark_name',
				render: (text, record) => {
					const remarks = text.split(',').filter((item)=>{return !!item})
					return <EllipsisPopover
						content={remarks.map((item, index)=>{
						    let str = ``
                            if(index < remarks.length-1) {
						        str = `${item} / `
                            }else{
                                str = `${item}`
                            }
                            return str
						})}
						lines={3}
					/>
				}
			},
			{
				title: '操作',
				dataIndex: 'operation',
				render: (text, record) => {
					return <Popconfirm placement="top"
					                   title="确定移出白名单？"
					                   icon={removeLoading ? <Icon type="loading"/> : <Icon type="exclamation-circle"/>}
					                   onConfirm={()=>{this.handleRemove(record.username)}} okText="确定" cancelText="取消">
						<span  className={styles.stress}>移出白名单</span>
					</Popconfirm>
				}
			}
		]

		const formItemLayout = {
			labelCol: {span: 8},
			wrapperCol: {span: 16},
		}

		return (
			<div className={styles.friendsWhitelist}>
				<Alert style={{marginBottom: '16px'}} message="加入白名单中的好友，允许重复添加至多个员工微信号" type="info" showIcon />
				<div className={styles.searchWrap}>
					<Row gutter={20}>
						<Col span={7}>
							<FormItem {...formItemLayout}
							          label="搜索："
							          colon={false}
							>
								<Search
									placeholder="输入昵称、微信号"
									value={params.query}
									onChange={(e)=>{this.handleChange('query', e)}}
									onSearch={this.handleSearch}
								/>
							</FormItem>
						</Col>
						<Button type="primary"
						        icon="search"
						        className={styles.searchBtn}
						        onClick={this.handleSearch}
						>搜索</Button>
					</Row>
				</div>
				<div className={styles.tableWrap}>
					<Table
						columns={columns}
						dataSource={list}
						size="middle"
						loading={whitelistLoading}
						rowKey={(record, index) => index}
						pagination={
							list.length ? {
								size: 'middle',
								total: total,
								current: current,
								showQuickJumper: true,
								pageSizeOptions: pageSizeOptions,
								showTotal: total => `共${total}条`,
								pageSize: params.limit,
								showSizeChanger: true,
								onShowSizeChange: this.handleChangeSize,
								onChange: this.goPage,
							} : false
						}
					/>
				</div>
			</div>
		)
	}
}
