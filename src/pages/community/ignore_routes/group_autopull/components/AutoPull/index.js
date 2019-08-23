import React from 'react'
import Link from 'umi/link'
import {connect} from 'dva'
import {Table, Button, Form, Input, Select, Row, Col, Pagination, message, Badge, Popover, Icon, Checkbox, Tag, Alert, Modal,} from 'antd'
import config from 'wx/common/config'
import styles from './index.less'
import moment from "moment/moment"
import _ from 'lodash'
import EllipsisPopover from 'components/EllipsisPopover'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import AutoPullModal from "./components/AutoPullModal"
import AddKeyword from "./components/AddKeyword"
import AddWechat from "./components/AddWechat"
import {hot} from 'react-hot-loader'

const TextArea = Input.TextArea
const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions, DateFormat, DefaultAvatar, DateTimeFormat} = config

@hot(module)
@connect(({ community_autoPull, community_autoPullModal, loading}) => ({
    community_autoPull,
    community_autoPullModal,
    queryLoading: loading.effects['community_autoPull/queryAutoPull'],
    setLoading: loading.effects['community_autoPull/setAutoPull'],
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isAutoPullModal: false, // 是否显示配置群弹窗
            record: null, // 暂存行
            isShowAddKeyword: false,
            isAddWechatModal: false,
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_autoPull/queryAutoPull',
            payload: {},
        })
        this.props.dispatch({
            type: 'community_autoPull/getGroupDivideOptions',
        })
    }
    componentWillUnmount() {}

    handleSearch = () => {
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_autoPull/queryAutoPull',
            payload: {page: page}
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if(key === 'query') {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.community_autoPull.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        }else if(key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'community_autoPull/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_autoPull.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_autoPull/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    resetSearch = () => {
        this.resetParams()
        this.goPage(1)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_autoPull/resetParams',
        })
    }

    // 暗号的相关操作
    handleOkAddKeyword = () => {
        this.handleCancelAddKeyword()
        this.goPage(this.props.community_autoPull.current || 1)
    }
    handleCancelAddKeyword = () => {
        this.setState({isShowAddKeyword: false})
    }
    onChangeAddKeywordVisible = (visible) => {
        this.setState({
            isShowAddKeyword: visible,
        })
    }
    closeTag = (e, keyword, record) => {
        e.preventDefault()
        e.stopPropagation()
        Modal.confirm({
            title: "确定删除该暗号？",
            icon: 'close-circle',
            onOk: () => {
                this.props.dispatch({
                    type: 'community_autoPull/removeKeyword',
                    payload: {
                        uin: record?.uin,
                        body: {
                            keyword: keyword,
                        }
                    },
                    callback: () => {
                        this.goPage(this.props.community_autoPull.current || 1)
                    }
                })
            },
        })
    }
    addKeyword = (record) => {
        this.setState({
            record,
            isShowAddKeyword: true,
        })
    }
    renderKeyword = (record) => {
        const keyword_setting = record?.auto_group_setting?.keyword_setting
        let hasEnptyIndex = keyword_setting.findIndex((item) => {return item?.chatroom_count === 0})
        return (
            <>
                <div>
                    {
                        keyword_setting.length ? keyword_setting.map((item, index) => {
                            return (
                                <Tag
                                    className={styles.keywordTag}
                                    closable
                                    onClose={(e) => this.closeTag(e, item?.keyword, record)}
                                    onClick={() => this.setAutoPullSetting(record, 2, item?.keyword)}
                                    key={index}
                                >
                                    {item?.keyword} ：<span className={styles.canEdit} style={{marginRight: 4}}>{item?.chatroom_count}</span>
                                </Tag>
                            )
                        }) : null
                    }
                </div>
                {
                    keyword_setting.length < 10 ? (
                        <AddKeyword
                            record={record}
                            visible={this.state.isShowAddKeyword && this.state.record.uin === record.uin}
                            onOk={this.handleOkAddKeyword}
                            onCancel={this.handleCancelAddKeyword}
                            onChangeVisible={this.onChangeAddKeywordVisible}
                        >
                            <span className={styles.canEdit} onClick={() => this.addKeyword(record)}>新增</span>
                        </AddKeyword>
                    ) : null
                }
                {
                    hasEnptyIndex > -1 ? (
                        <Popover
                            placement="top"
                            content={<div>有配置群数为0的暗号，请点击数字进行配置</div>}
                            title={null}
                        >
                            <Icon className={styles.infoCircle} type="info-circle"/>
                        </Popover>
                    ) : null
                }
            </>
        )
    }

    autoPullModalOk = () => {
        this.setState({isAutoPullModal: false}, () => {
            this.goPage(this.props.community_autoPull.current || 1)
        })
    }

    handleUpdate = (key, e, record) => {
        let val = e
        if(key === 'enable_newfriend' || key === 'enable_keyword') {
            val = e.target.checked ? 1: 0
        }
        this.props.dispatch({
            type: 'community_autoPull/setAutoPull',
            payload: {
                uin: record?.uin,
                body: {
                    [key]: val
                }
            },
            callback: (res) => {
                this.goPage(this.props.community_autoPull.current || 1)
            }
        })
    }

     setAutoPullSetting = async (record, type = 1, keyword) => {
         let { params } = this.props.community_autoPullModal
         if(type === 1) { // 新好友弹窗
             params.type = type
         }else if(type === 2){ // 关键字弹窗
             if(keyword){
                 params.type = type
                 params.keyword = keyword
             }
         }
         await this.props.dispatch({ // query前先setParams
             type: 'community_autoPullModal/setParams',
             payload: {
                 params: {...params},
             },
         })
         this.setState({
             isAutoPullModal: true,
             record: record,
         }, () => {
             this.props.dispatch({
                 type: 'community_autoPullModal/query',
                 payload: {
                     uin: record.uin,
                 },
             })
         })
     }

    remove = (record) => {
        Modal.confirm({
            title: "确定删除该微信号？",
            icon: 'close-circle',
            onOk: () => {
                this.props.dispatch({
                    type: 'community_autoPull/deteleAutoPull',
                    payload: {
                        body: {
                            uins: record?.uin,
                        }
                    },
                    callback: (res) => {
                        this.goPage(this.props.community_autoPull.current || 1)
                    }
                })
            },
        })
    }

    // 添加微信号弹窗：打开，确定，取消
    addWechat = () => {
        this.setState({
            isAddWechatModal: true,
        }, () => {
            this.props.dispatch({
                type: 'community_autoPull/queryAddWechatModal',
                payload: {},
            })
        })
    }
    handleAddWechatOk = () => {
        const { selectedRows } = this.props.community_autoPull
        if(selectedRows.length) {
            let uins = ''
            selectedRows.forEach((item, index) => {
                if(index !== selectedRows.length - 1) {
                    uins += `${item.uin},`
                }else{
                    uins += `${item.uin}`
                }
            })
            this.props.dispatch({
                type: 'community_autoPull/setAddWechatModal',
                payload: {
                    body: {uins}
                },
                callback: () => {
                    this.handleAddWechatCancel(true)
                }
            })
        }else{
            message.warning('请先选择微信号！')
        }
    }
    handleAddWechatCancel = (fromOk) => {
        this.setState({
            isAddWechatModal: false,
        }, () => {
            this.props.dispatch({
                type: 'community_autoPull/resetAddWechatParams'
            })
            this.props.dispatch({
                type: 'community_autoPull/setProperty',
                payload: {
                    selectedRowKeys: [],
                    selectedRows: []
                }
            })
            fromOk && this.goPage(this.props.community_autoPull.current || 1)
        })
    }

    render() {
        const { params, total, current, list } = this.props.community_autoPull
        const countStatu = _.countBy(list, (item) => item.status)
        const { queryLoading, setLoading } = this.props
        const { isAutoPullModal, isAddWechatModal, } = this.state
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        const columns = [
            {
                title: '微信号信息',
                dataIndex: 'head_img_url',
                className: styles.avatar,
                render: (text, record) => {
                    return <div className={styles.avatarWrap}>
                        <img src={text} alt="" onError={(e) => {e.target.src=DefaultAvatar}} />
                        <div className={styles.avatarRight}>
                            <EllipsisPopover
                                content={record?.nickname}
                                lines={2}
                                style={{marginBottom: 4}}
                            />
                            <div>{record?.remark}</div>
                        </div>
                    </div>
                }
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = text
                    let content = ''
                    if(departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={<p style={{'maxWidth': '240px', 'wordBreak': 'break-all',}}>{content}</p>}
                                title={null}
                                trigger="hover"
                            >
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user',
                className: styles.userColumn,
                render: (text, record) => {
                    return text.nickname
                },
            },
            {
                title: '状态',
                dataIndex: 'im_online_status',
                className: styles.status,
                render: (text, record) => {
                    return text ? <Badge status='success' text='在线'/>: <Badge status='error' text='离线'/>
                },
            },
            {
                title: () => {
                    return (
                        <span>
                            新好友拉群
                            <Popover
                                placement="top"
                                content={<div>点击数字打开配置群窗口，对列表中的可用群进行配置</div>}
                                title={null}
                            ><Icon className={styles.questionCircle} type="question-circle-o"/></Popover>
                        </span>
                    )
                },
                dataIndex: 'auto_group_setting.newfriend_setting',
                className: styles.newFriend,
                render: (text, record) => {
                    return (
                        <div className={styles.newFriendWrap}>
                            <Checkbox
                                checked={record?.auto_group_setting?.enable_newfriend ? true : false}
                                onChange={(e) => this.handleUpdate('enable_newfriend', e, record)}
                            >新好友拉群：</Checkbox>
                            <div className={`${styles.canEdit} ${styles.newFriendCount}`} onClick={() => this.setAutoPullSetting(record, 1)}>{text?.chatroom_count}</div>
                            {
                                text?.chatroom_count === 0 ? (<Popover
                                    placement="top"
                                    content={<div>配置群数为0，请点击数字进行配置</div>}
                                    title={null}
                                >
                                    <Icon className={styles.infoCircle} style={{marginLeft: 2}} type="info-circle"/>
                                </Popover>)
                                    : null
                            }
                        </div>
                    )
                },
            },
            {
                title: () => {
                    return (
                        <span>
                            暗号
                            <Popover
                                placement="top"
                                content={<div>配置暗号后，同微信号私聊发送暗号可自动拉好友进入群聊，<br/>如暗号为空则此功能不生效，限制最多10个暗号</div>}
                                title={null}
                            ><Icon className={styles.questionCircle} type="question-circle-o"/></Popover>
                        </span>
                    )
                },
                dataIndex: 'auto_group_setting.enable_keyword',
                className: styles.enableKeyword,
                align: 'center',
                render: (text, record) => {
                    return this.renderKeyword(record)
                },
            },
            {
                title: '操作',
                dataIndex: 'operate',
                className: styles.operate,
                align: 'center',
                render: (text, record) => {
                    return <div className={styles.canEdit} onClick={() => this.remove(record)}>删除</div>
                },
            },
        ]

        return (
            <div className={styles.autoPullWrap}>
                <Alert
                    message="好友给员工微信号发送暗号，执行暗号拉群最长大约需要1分钟，执行期间请勿重复发送暗号"
                    type="info"
                    style={{marginBottom: 10}}
                    showIcon
                />
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                <Input placeholder="输入微信昵称、备注或微信号搜索"
                                    value={params.query}
                                    onChange={(e)=>{this.handleChange('query', e)}}/>
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value) => {
                                        this.handleChange('user_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={8}>
                            <FormItem {...formItemLayout} label="状态：" colon={false}>
                                <Select
                                    style={{width: '100%'}}
                                    value={params.status}
                                    onChange={(e)=>{this.handleChange('status', e)}}
                                    placeholder='全部'
                                >
                                    <Option value="">全部</Option>
                                    <Option value={0}>离线</Option>
                                    <Option value={1}>在线</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row className={styles.searchBtn} gutter={20}>
                        <Col span={7}>
                            <Col offset={1}>
                                <Button type="primary" icon="search" onClick={this.handleSearch} loading={queryLoading}>搜索</Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </div>
                <div className={styles.addWrap}>
                    <div className={styles.addWrapLeft}>
                        <Button type='primary' onClick={this.addWechat} style={{marginRight: 20}}>添加微信号</Button>
                        <Link to="/community/group_autopull?hztabkey=group_autoPull_record">
                            <Button>查询记录</Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.tableWrap}>
                    <Table columns={columns}
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
                <AutoPullModal
                    {...this.props}
                    visible={isAutoPullModal}
                    onOk={this.autoPullModalOk}
                    onCancel={this.autoPullModalCancel}
                    record={this.state.record}
                />
                <AddWechat
                    visible={isAddWechatModal}
                    onOk={this.handleAddWechatOk}
                    onCancel={this.handleAddWechatCancel}
                />
            </div>
        )
    }
}
