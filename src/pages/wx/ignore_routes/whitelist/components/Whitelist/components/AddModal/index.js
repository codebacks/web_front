/**
 * @Description 白名单弹窗
 * @author XuMengPeng
 * @date 2018/12/13
*/
import React, { Fragment } from 'react'
import {Table, Button, Form, Input, Row, Col, Pagination, Modal, message} from 'antd'
import {connect} from 'dva'
import styles from './index.less'

const FormItem = Form.Item
const TextArea = Input.TextArea


@connect(({base, wx_whitelist, loading}) => ({
    base,
    wx_whitelist,
    queryLoading: loading.effects['wx_whitelist/whitelistSearchWx'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {};

    componentWillUnmount() {
        this.resetParams()
    }

	handleSearch = () => {
	    this.goPage(1)
	}

	handleChange = (key, e) => {
	    let val = ''
	    if (key === 'key') {
	        val = e.target.value
	    } else {
	        val = e
	    }
	    let addModalParams = {...this.props.wx_whitelist.addModalParams}
	    addModalParams[key] = val
	    this.props.dispatch({
	        type: 'wx_whitelist/setProperty',
	        payload: {
	            addModalParams: addModalParams,
	        },
	    })
	}

	handleRemarkChange = (e) => {
	    const { value } = e.target
	    this.props.dispatch({
	        type: 'wx_whitelist/setProperty',
	        payload: {
	            addRemark: value,
	        },
	    })
	}

	goPage = (page) => {
	    this.props.dispatch({
	        type: 'wx_whitelist/whitelistSearchWx',
	        // payload: {page: page},
	    })
	}

	resetParams = () => {
	    this.props.dispatch({
	        type: 'wx_whitelist/resetModalParams',
	    })
	}

	onCancel = () => {
	    this.props.onCancel()
	}

	onOk = () => {
	    this.props.onOk()
	}

	render() {
	    const { addModalParams, addModalList, addRemark } = this.props.wx_whitelist
	    const { queryLoading, visible } = this.props

	    const columns = [
	        {
	            title: '微信昵称',
	            dataIndex: 'nickname',
	            key: 'nickname',
	            className: styles.nickname,
	            render: (text, record) => {
	                return <span>{text}</span>
	            },
	        },
	        {
	            title: '微信号',
	            dataIndex: 'username',
	            key: 'username',
	            className: styles.uin,
	            render: (text, record) => {
	                return <span>{text}</span>
	            },
	        },
	    ]
	    const rowSelection = {
	        columnWidth: '8%',
	        type: 'radio',
	        onChange: (selectedRowKeys, selectedRows) => {
	            this.props.dispatch({
	                type: 'wx_whitelist/setProperty',
	                payload: {
	                    addWxId: selectedRows[0]?.username,
	                }
	            })
	        },
	    }

	    const formItemLayout = {
	        labelCol: {span: 4},
	        wrapperCol: {span: 20},
	    }

	    return (
	        <Modal
	            title="添加白名单"
	            width={800}
                maskClosable={false}
	            className={styles.whiteList}
	            visible={visible}
	            onCancel={this.onCancel}
	            onOk={this.onOk}
	        >
	            <Row gutter={20}>
	                <Col span={20}>
	                    <FormItem {...formItemLayout} label="备注：" colon={false}>
	                        <TextArea
	                                    value={addRemark}
	                                    placeholder="请输入本次添加白名单备注信息（200字以内）"
	                                    onChange={this.handleRemarkChange}
	                                    maxLength={200}
	                        />
	                    </FormItem>
	                </Col>
	                <Col span={10}>

	                </Col>
	            </Row>
	            <Row gutter={20}>
	                <Col span={20}>
	                    <FormItem {...formItemLayout} label="搜索：" colon={false}>
	                        <Input
	                            placeholder="搜索微信昵称、微信号"
	                            value={addModalParams.key}
	                            onChange={(e) => {
	                                this.handleChange('key', e)
	                            }}
	                            onPressEnter={this.handleSearch}
	                        />
	                    </FormItem>
	                </Col>
	                <Col span={4} style={{marginTop: '3px'}}>
	                    <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
	                </Col>
	            </Row>
	            <div className={styles.tableWrap}>
	                {
	                    addModalList.length ?
	                        <Table columns={columns}
							       rowSelection={rowSelection}
							       dataSource={addModalList}
							       size="middle"
							       loading={queryLoading}
							       rowKey={(record, index) => index}
							       pagination={false}
	                        />: ''
	                }
	            </div>
	        </Modal>
	    )
	}
}