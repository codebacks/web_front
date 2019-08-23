/**
 * @Description 白名单
 * @author XuMengPeng
 * @date 2018/12/13
*/
import React, {Fragment} from 'react'
import {Table, Button, Form, Input, Row, Col, Pagination, Icon, Modal, message, Checkbox, Alert, Popover} from 'antd'
import {connect} from 'dva'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import EllipsisPopover from 'components/EllipsisPopover'
import AddModal from "./components/AddModal"

const FormItem = Form.Item
const TextArea = Input.TextArea
const CheckboxGroup = Checkbox.Group

const {pageSizeOptions, DateFormat, DateTimeFormat, DefaultAvatar} = config

@connect(({base, wx_whitelist, loading}) => ({
    base,
    wx_whitelist,
    queryLoading: loading.effects['wx_whitelist/query'],
    whitelistEditRemarkLoading: loading.effects['wx_whitelist/whitelistEditRemark'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowAddModal: false,
            record: null, // 操作的record
            isShowEditRemark: false,
            isShowPermissions: false,
            indeterminate: false, // 控制CheckBoxd的多选，选中样式方块
            checkAll: false,
            checkedList: [],
            plainOptions: Array.from(Array(11), (i,idx)=>idx),
        }
    }

    componentDidMount() {
        this.goPage(1)
    }

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
	    let params = {...this.props.wx_whitelist.params}
	    params[key] = val
	    this.props.dispatch({
	        type: 'wx_whitelist/setParams',
	        payload: {
	            params: params,
	        },
	    })
	}

	handleChangeSize = (current, size) => {
	    let params = {...this.props.wx_whitelist.params}
	    params.limit = size
	    this.props.dispatch({
	        type: 'wx_whitelist/setProperty',
	        payload: {params: params},
	    })
	    this.goPage(1) // 重置个数时回到首页
	}

	goPage = (page) => {
	    this.props.dispatch({
	        type: 'wx_whitelist/query',
	        payload: {page: page},
	    })
	}

	resetParams = () => {
	    this.props.dispatch({
	        type: 'wx_whitelist/resetParams',
	    })
	}

	resetSearch = () => {
	    this.resetParams()
	    setTimeout(() => {
	        this.goPage(1)
	    }, 0)
	}

	handleChangeExecuteDate = (startValue, endValue) => {
	    let params = {...this.props.wx_whitelist.params}
	    if (startValue) {
	        params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
	    } else {
	        params.start_time = ''
	    }
	    if (endValue) {
	        params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
	    } else {
	        params.end_time = ''
	    }
	    this.props.dispatch({
	        type: 'wx_whitelist/setParams',
	        payload: {params: params}
	    })
	}

	add = () => {
	    this.setState({
	        isShowAddModal: true,
	    })
	}
	handleCancelAddModal = () => {
	    this.setState({
	        isShowAddModal: false,
	    }, () => {
	        this.props.dispatch({
	            type: 'wx_whitelist/resetModalParams'
	        })
	        this.props.dispatch({
	            type: 'wx_whitelist/setProperty',
	            payload: {
	                addModalList: [],
	                addRemark: '',
	                addWxId: '',
	            }
	        })
	        this.goPage(this.props.wx_whitelist.current || 1)
	    })
	}
	handleOkAddModal = () => {
	    const { addRemark, addWxId } = this.props.wx_whitelist
	    if(!addWxId) {
	        message.warn('请选择微信号')
	        return false
	    }
	    this.props.dispatch({
	        type: 'wx_whitelist/whitelistAdd',
	        payload: {
	            body: {
	                wechat_id: addWxId,
	                remark: addRemark,
	            }
	        },
	        callback: () => {
	            this.handleCancelAddModal()
	        }
	    })
	}

	editRemark = (record) => {
	    this.setState({
	        record: record,
	        isShowEditRemark: true,
	    })
	}

	handleEditRemark = (e) => {
	    const { value } = e.target
	    this.props.dispatch({
	        type: 'wx_whitelist/setProperty',
	        payload: {
	            recordRemark: value
	        }
	    })
	}

	editPermissions = (record) => {
	    let checkedList = []
	    record.rules.split('').forEach((item, index) => {
	        item === '1' ? checkedList.push(index): ''
	    })
	    this.setState({
	        record: record,
	        isShowPermissions: true,
	        checkedList: checkedList,
	        checkAll: checkedList.length === this.state.plainOptions.length,
	    })
	}

	handleEditRemarkCancel = () => {
	    this.setState({
	        isShowEditRemark: false,
	        record: null,
	    }, () => {
	        this.props.dispatch({
	            type: 'wx_whitelist/setProperty',
	            payload: {
	                recordRemark: ''
	            }
	        })
	        this.goPage(this.props.wx_whitelist.current || 1)
	    })
	}
	handleEditRemarkOk = () => {
	    const { recordRemark } = this.props.wx_whitelist
	    const { record } = this.state
	    if(!recordRemark) {
	        message.warn('请输入备注')
	    }else{
	        this.props.dispatch({
	            type: 'wx_whitelist/whitelistEditRemark',
	            payload: {
	                id: record.id,
	                body: {
	                    remark: recordRemark
	                }
	            },
	            callback: () => {
	                this.handleEditRemarkCancel()
	            }
	        })
	    }
	}

	removeWhiteList = (record) => {
	    console.log('removeWhiteList')
	    this.props.dispatch({
	        type: 'wx_whitelist/whitelistRemove',
	        payload: {
	            id: record.id
	        },
	        callback: () => {
			    message.success('移出成功')
	            this.goPage(this.props.wx_whitelist.current || 1)
	        }
	    })
	}

	handlePermissionsCancel = () => {
	    this.setState({
	        record: null,
	        isShowPermissions: false,
	        checkedList: [],
	        checkAll: false,
	    })
	}
	handlePermissionsOk = () => {
	    this.handlePermissionsCancel()
	    // this.goPage(this.props.wx_whitelist.current || 1)
	}

	onCheckAllChange = (e) => {
	    this.setState({
	        checkedList: e.target.checked ? this.state.plainOptions : [],
	        indeterminate: false,
	        checkAll: e.target.checked,
	    })
	}

	onCheckBoxChange = (checkedList) => {
	    const {plainOptions} = this.state
	    this.setState({
	        checkedList,
	        indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
	        checkAll: checkedList.length === plainOptions.length,
	    })
	}

	mapOptionsTxt = (index) => {
	    const arr = {
		    0: '不触发重复好友检测',
	        // 1: '不触发重复加群检测',
	        2: '不触发消息敏感词踢人',
	        // 3: '不触发群成员昵称以及群昵称敏感词踢人',
	        4: '不触发发送公众号名片/个人号名片踢人',
	        5: '不触发发送链接分享踢人',
	        6: '不触发发送小程序踢人',
	        7: '不触发发送小视频踢人',
	        // 8: '不触发群成员私加好友监控',
	        9: '不触发防骚扰踢人',
	        10: '不触发锁定群名警告/踢人'
	    }
	    return arr[index]
	}

	getPermissionList = () => {
	    const arr =  [
	        '不触发重复好友检测',
	        '不触发重复加群检测',
	        '不触发消息敏感词检测',
	        '不触发公众号名片/个人号名片分享检测',
	        '不触发链接分享检测',
	        '不触发小程序分享检测',
	        '不触发小视频分享检测',
	        '不触发防骚扰检测',
	        '不触发修改群名检测',
	    ]
	    return <ol className={styles.permissionDesc}>
	        {
	            arr.map((text, index) => {
	                return <li key={index}>{text}</li>
	            })
	        }
	    </ol>
	}

	render() {
	    const {params, total, current, list, recordRemark} = this.props.wx_whitelist
	    const {queryLoading, whitelistEditRemarkLoading} = this.props
	    const {isShowAddModal, isShowEditRemark, isShowPermissions, plainOptions} = this.state

	    const columns = [
	        {
	            title: '头像',
	            dataIndex: 'head_img_url',
	            key: 'head_img_url',
	            className: styles.avatar,
	            align: 'center',
	            render: (text, record) => {
	                return (
	                    <img src={text} alt="" onError={(e) => {e.target.src=DefaultAvatar}} rel="noreferrer"/>
	                )
	            }
	        },
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
	            dataIndex: 'wechat_id',
	            key: 'wechat_id',
	            className: styles.uin,
	            render: (text, record) => {
	                return <span>{text}</span>
	            },
	        },
	        {
	            title: '操作员工',
	            dataIndex: 'operator_username',
	            key: 'operator_username',
	            className: styles.editNickname,
	            render: (text) => {
	                return <span>{text}</span>
	            },
	        },
	        {
	            title: '操作时间',
	            dataIndex: 'update_at',
	            key: 'update_at',
	            className: styles.editTime,
	            render: (text, record) => {
				    return text ? moment(text*1000).format(DateTimeFormat) : '-'
	            }
	        },
	        {
	            title: '白名单备注',
	            dataIndex: 'remark',
	            key: 'remark',
	            className: styles.remark,
	            render: (text, record) => {
	                return <div>
	                    <EllipsisPopover
	                        content={text}
	                        lines={3}
	                    />
	                    <div className={styles.canEdit} onClick={() => this.editRemark(record)}>编辑</div>
	                </div>
	            },
	        },
	        /*{
				title: '已开启权限',
				dataIndex: 'rules',
				key: 'rules',
				align: 'center',
				className: styles.permissionsNum,
				render: (text, record) => {
					let num = 0
					if(text) {
						text.split('').forEach((item, index) => {
							item === '1' ? num++ : ''
						})
					}
					return <span>{num}</span>
				},
			},*/
	        {
	            title: '操作',
	            dataIndex: 'edit',
	            key: 'edit',
	            className: styles.edit,
	            render: (text, record) => {
	                return <div>
	                    {/*<div className={styles.canEdit} onClick={() => this.editPermissions(record)}>权限配置</div>*/}
	                    {
	                        !record.is_uin ? <div className={styles.canEdit} onClick={() => this.removeWhiteList(record)}>移出白名单</div>
	                            : ''
	                    }
	                </div>
	            },
	        },
	    ]
	    const rowSelection = {
	        columnWidth: '8%',
	        selectedRowKeys: this.props.wx_whitelist.selectedRowKeys,
	        onChange: (selectedRowKeys, selectedRows) => {
	            this.props.dispatch({
	                type: 'wx_whitelist/setProperty',
	                payload: {
	                    selectedRows: selectedRows,
	                    selectedRowKeys: selectedRowKeys,
	                }
	            })
	        },
	    }

	    const formItemLayout = {
	        labelCol: {span: 6},
	        wrapperCol: {span: 18},
	    }

	    return (
	        <Fragment>
	            <div className={styles.whitelist}>
	                <Alert
	                    className={styles.alert}
	                    type="info"
	                    showIcon
	                    message={<span id="wxWhiteListAlert">加入白名单中的好友，不受重复好友、重复加群以及微信群的行为管理限制
	                        <Popover title={null}
	                            content={this.getPermissionList()}
	                            getPopupContainer={()=>document.getElementById('wxWhiteListAlert')}>
	                            <Button size="small">查看权限</Button>
	                        </Popover>
	                    </span>}
	                />
	                <div className={styles.searchWrap}>
	                    <Row gutter={20}>
	                        <Col span={8}>
	                            <FormItem {...formItemLayout}
								          label="搜索："
								          colon={false}
	                            >
	                                <Input placeholder="输入昵称、微信号"
									       value={params.key}
									       onChange={(e) => {
										       this.handleChange('key', e)
									       }}
									       onPressEnter={this.handleSearch}/>
	                            </FormItem>
	                        </Col>
	                        <div className={styles.btn}>
	                            <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
	                        </div>
	                    </Row>
	                </div>
	                <div className={styles.addBtn}>
	                    <Button type="primary" onClick={this.add}><Icon type="plus" />添加</Button>
	                </div>
	                <div className={styles.tableWrap}>
	                    <Table columns={columns}
	                        // rowSelection={rowSelection}
							   dataSource={list}
							   size="middle"
							   loading={queryLoading}
							   rowKey={(record, index) => index}
							   pagination={false}
	                    />
	                    {list.length ?
	                        <Pagination
	                            className="ant-table-pagination"
	                            total={total}
	                            current={current}
	                            showQuickJumper={true}
	                            pageSizeOptions={pageSizeOptions}
	                            showTotal={total => `共 ${total} 条`}
	                            pageSize={params.limit}
	                            showSizeChanger={true}
	                            onShowSizeChange={this.handleChangeSize}
	                            onChange={this.goPage}
	                        />
	                        : ''}
	                </div>
	            </div>
	            <AddModal
	                visible={isShowAddModal}
	                onCancel={this.handleCancelAddModal}
	                onOk={this.handleOkAddModal}
	            />
	            <Modal
	                width={600}
	                title="修改备注"
	                visible={isShowEditRemark}
	                onCancel={this.handleEditRemarkCancel}
	                onOk={this.handleEditRemarkOk}
	                okButtonProps={{loading: whitelistEditRemarkLoading}}
	            >
	                <Row>
	                    <Col span={24}>
	                        <FormItem labelCol={{span: 4}} wrapperCol={{span: 18}} label="备注：" colon={false}>
	                            <TextArea
	                                    value={recordRemark}
	                                    placeholder="请输入备注信息（200字以内）"
	                                    rows={4}
	                                    onChange={this.handleEditRemark}
	                                    maxLength={200}
	                            />
	                        </FormItem>
	                    </Col>
	                </Row>
	            </Modal>

	            <Modal
	                width={800}
	                title="权限配置"
	                visible={isShowPermissions}
	                onCancel={this.handlePermissionsCancel}
	                onOk={this.handlePermissionsOk}
	                className={styles.permissionsModal}
	            >
	                <div>
	                    <Checkbox
	                        disabled={true}
	                        indeterminate={this.state.indeterminate}
	                        onChange={this.onCheckAllChange}
	                        checked={this.state.checkAll}
	                    >
							全部开启
	                    </Checkbox>
	                </div>
	                <CheckboxGroup value={this.state.checkedList} onChange={this.onCheckBoxChange}>
	                    {
	                        plainOptions.map((item, index) => {
							    // 这次版本暂时不展示1，3，8
							    if(index !== 1 && index !== 3 && index !== 8) {
	                                return <Checkbox disabled={true} value={index} key={index}>{this.mapOptionsTxt(index)}</Checkbox>
	                            }
	                        })
	                    }
	                </CheckboxGroup>
	            </Modal>
	        </Fragment>
	    )
	}

}
