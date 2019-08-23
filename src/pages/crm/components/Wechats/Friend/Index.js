/* eslint-disable no-mixed-spaces-and-tabs */
'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/27
 */
import React from 'react'
import {Table, Pagination, Button} from 'antd'
import moment from 'moment'
import styles from './Index.scss'
import config from 'crm/common/config'
import Search from './Search'
import Profile from './Profile'

const {pageSizeOptions, Sex, DateTimeFormat, DefaultAvatar} = config

export default class extends React.Component {
    constructor(props) {
        super()
        this.state = {
            visibleHistory: false,
            visibleCreatePlan: false
        }
    }

    componentDidMount() {
        this.loadUsers()
        this.loadWechats()
        this.goPage(1)
    }

	loadUsers = () => {
	    this.props.dispatch({
	        type: 'friends/queryUsers',
	        payload: {}
	    })
	};

	loadWechats = () => {
	    setTimeout(() => {
	        this.props.dispatch({
	            type: 'friends/queryWechats',
	            payload: {}
	        })
	    }, 0)
	};


	goPage = (page) => {
	    this.props.dispatch({
	        type: 'friends/query',
	        payload: {page: page}
	    })
	};

	handleDetail = (record) => {
	    this.props.dispatch({
	        type: 'friends/setProperty',
	        payload: {profileModal: true, record: record}
	    })
	};

	handleReload = () => {
	    this.goPage(1)
	};

	handleChangeSize = (current, size) => {
	    let params = {...this.props.friends.params}
	    params.limit = size
	    this.props.dispatch({
	        type: 'friends/setProperty',
	        payload: {params: params},
	    })
	    this.goPage(1) //重置个数时回到首页
	};

	render() {
	    const {initData: config, pageHeight} = this.props.base
	    const {params, list, loading, total, current, loadingFriend, profileModal} = this.props.friends
	    const getStoreTypeName = (id) => {
	        let _item = config.store_types.filter((item) => {
	            return item.id === id
	        })
	        return _item[0].name

	    }
	    const columns = [
	        {
	            title: '头橡',
	            dataIndex: 'target.head_img_url',
	            width: 65,
	            render: (text, record) => {
	                return <img src={text} className={styles.avatar}
					            onError={(e) => {
						            e.target.src = DefaultAvatar
					            }} alt=""/>
	            }
	        }, {
	            //     title: '好友微信ID',
	            //     dataIndex: 'target.username'
	            // }, {
	            title: '好友昵称',
	            dataIndex: 'target.nickname',
	            render: (text) => {
	                return <span style={{whiteSpace: 'pre'}}>{text}</span>
	            }
	        }, {
	            title: '好友微信号',
	            dataIndex: 'target.username',
	            render: (text, record) => {
	                return record.target.alias || record.target.username
	            }
	        }, {
	            title: '好友备注',
	            dataIndex: 'target.remark_name'
	        }, {
	            title: '客服账号',
	            dataIndex: 'from.user.username'
	        }, {
	            title: '归属微信',
	            dataIndex: 'from.nickname'
	        }, {
	            title: '来源',
	            dataIndex: 'target.source',
	            render: (text, record) => {
	                switch (record.target.source) {
	                case 1:
	                    return `通过搜索QQ号添加`
	                case 1000001:
	                    return `对方通过搜索QQ号添加`
	                case 3:
	                    return `通过搜索微信号添加`
	                case 1000003:
	                    return `对方通过搜索微信号添加`
	                case 10:
	                case 13:
	                    return `通过手机通讯录添加`
	                case 1000010:
	                case 1000013:
	                    return `对方通过手机通讯录添加`
	                case 8:
	                case 14:
	                    return `通过群聊添加`
	                case 1000014:
	                    return `对方通过群聊添加`
	                case 15:
	                    return `通过搜索手机号添加`
	                case 1000015:
	                    return `对方通过搜索手机号添加`
	                case 17:
	                    return `通过名片分享添加`
	                case 1000017:
                        	return `对方通过名片分享添加`
	                case 18:
	                    return `通过附近的人添加`
	                case 1000018:
	                    return `对方通过附近的人添加`
	                case 25:
	                    return `通过漂流瓶添加`
	                case 1000025:
	                    return `对方通过漂流瓶添加`
	                case 29:
	                    return `通过摇一摇添加`
	                case 1000029:
	                    return `对方通过摇一摇添加`
	                case 30:
	                    return `通过扫一扫添加`
	                case 1000030:
	                    return `对方通过扫一扫添加`
	                case 4:
	                case 12:
	                    return `来自QQ好友`
	                case 48:
	                    return `雷达`
	                default:
	                    return `其他`
	                }
	            }
	        },{
	            title: '加好友时间',
	            dataIndex: 'target.add_time',
	            render: (text, record) => {
	                if (record.target.add_time) {
	                    return moment(record.target.add_time * 1000).format(DateTimeFormat)
	                } else {
	                    return '未知'
	                }
	            }
	        }, {
	            title: '性别',
	            dataIndex: 'name',
	            render: (text, record) => {
	                return Sex[record.target.sex]
	            }
	        }, {
	            title: '地区',
	            dataIndex: 'address',
	            render: (text, record) => {
	                if (record.target.province || record.target.city) {
	                    return record.target.province + record.target.city
	                } else {
	                    return '未知'
	                }
	            }
	        }, {
	            title: '状态',
	            dataIndex: 'status',
	            render: (text, record) => {
	                if (!record.target.is_block && !record.target.is_delete) {
	                    return '正常'
	                }
	                let txt = []
	                if (record.target.is_delete) {
	                    txt.push('已删除')
	                }
	                if (record.target.is_block) {
	                    txt.push('已被对方删除')
	                }
	                return <span>{txt.join(',')}</span>
	            }

	        }, {
	            title: '操作',
	            dataIndex: 'option',
	            render: (text, record) => {
	                return (<Button onClick={this.handleDetail.bind(this, record)}>查看</Button>)
	            }
	        }]

	    return ( <div>
	        <Search {...this.props} search={this.handleReload}/>
	        <div className="textCenter" style={{marginTop: 4}}>
	            <Table
	                columns={columns}
	                dataSource={list}
	                size="middle"
	                loading={loadingFriend}
	                rowKey={record => record.target.id}
	                pagination={false}
                />
	        </div>
	        <Pagination
	            className="ant-table-pagination"
	            total={total}
	            current={current}
	            showQuickJumper={true}
                pageSizeOptions={pageSizeOptions}
	            showTotal={total => `共${total}条`}
	            pageSize={params.limit}
	            showSizeChanger={true}
	            onShowSizeChange={this.handleChangeSize}
	            onChange={this.goPage}
	        />
	        {profileModal ? <Profile {...this.props} /> : ''}
	    </div>)
	}
}
