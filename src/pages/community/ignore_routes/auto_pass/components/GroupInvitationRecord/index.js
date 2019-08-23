import React from 'react'
import {
    Table,
    Form,
    Input,
    Checkbox,
    Button,
    Row,
    Col,
    Badge,
    message,
} from 'antd'
import {connect} from 'dva'
import config from 'community/common/config'
import documentTitleDecorator from 'hoc/documentTitle'
import RangeDatePicker from 'components/RangeDatePicker'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import styles from './index.less'
import Toggle from 'components/Toggle'
import Member from "./components/Member"
import EllipsisPopover from 'components/EllipsisPopover'
import {hot} from "react-hot-loader"
import moment from "moment"

const FormItem = Form.Item
const Search = Input.Search
const CheckboxGroup = Checkbox.Group

const {pageSizeOptions} = config

@hot(module)
@connect(({community_groupInvitationRecord, loading}) => ({
    community_groupInvitationRecord,
    friendsLoading: loading.effects['community_groupInvitationRecord/list'],
}))
@documentTitleDecorator({
    overrideTitle: '通过记录',
})
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
        }else {
            val = e
        }
        let params = {...this.props.community_groupInvitationRecord.params}
        params[key] = val
        if(key === 'department_id') {
            params['user_id'] = undefined
        }
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setParams',
            payload: {params: params},
        })
    }

    handleCheckAllChange = (e) => {
        let params = {...this.props.community_groupInvitationRecord.params}
        let status = {...params.status}
        let checkedAll = e.target.checked
        if(checkedAll) {
            Object.keys(status).forEach((k) => {
                if(!status[k]) {
                    status[k] = 1
                }
            })
        }else {
            Object.keys(status).forEach((k) => {
                if(status[k]) {
                    status[k] = undefined
                }
            })
        }
        params.status = status
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setProperty',
            payload: {
                params: params,
                checkedAll: checkedAll,
            },
        })
    }

    handleStatusChange = (values) => {
        let params = {...this.props.community_groupInvitationRecord.params}
        let status = {...params.status}
        Object.keys(status).forEach((k) => {
            if(values.includes(k)) {
                status[k] = 1
            }else {
                status[k] = undefined
            }
        })
        params.status = status
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setProperty',
            payload: {
                params: params,
                checkedAll: this.isCheckedAll(status),
            },
        })
    }

    isCheckedAll = (status) => {
        return Object.keys(status).every((k) => {
            return !!status[k]
        })
    }

    getStatusList = (status) => {
        return Object.keys(status).filter((k) => {
            return status[k]
        })
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupInvitationRecord/list',
            payload: {page: page},
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupInvitationRecord.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setParams',
            payload: {params: params},
        })
        this.goPage(1)
    }

    handleSearch = () => {
        this.goPage(1)
    }

    inviteRecordsConfirm = (record) => {
        this.props.dispatch({
            type: 'community_groupInvitationRecord/inviteRecordsConfirm',
            payload: {
                record_id: record.id,
            },
            callback: () => {
                message.success('成功通过')
                this.goPage()
            },
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupInvitationRecord/resetParams',
        })
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setProperty',
            payload: {checkedAll: false, applicationTime: [null, null]},
        })
    }

    resetSearch = () => {
        this.resetParams()
        this.goPage(1)
    }

    rangeTimePickerChange = (value) => {
        this.props.dispatch({
            type: 'community_groupInvitationRecord/setProperty',
            payload: {applicationTime: value.slice()},
        })
    }

    render() {
        const columns = [
            {
                title: '邀请人',
                dataIndex: 'inviter_nickname',
                render: (text, record) => {
                    return text
                },
            },
            {
                title: '被邀请人',
                dataIndex: 'invitees_count',
                render: (text, record) => {
                    return (
                        <Toggle>
                            {(
                                {
                                    setTrue,
                                    status,
                                    setFalse,
                                },
                            ) => (
                                <>
                                    <span
                                        className={styles.number}
                                        onClick={setTrue}
                                    >
                                        {text}
                                    </span>
                                    <Member
                                        record={record}
                                        modalOption={{
                                            visible: status,
                                            onCancel: setFalse,
                                        }}
                                    />
                                </>
                            )}
                        </Toggle>
                    )
                },
            },
            {
                title: '目标群',
                dataIndex: 'username',
                render: (text, record) => {
                    return record.nickname ? record.nickname : record.displayname
                },
            },
            {
                title: '群主',
                dataIndex: 'ownername',
            },
            {
                title: '验证信息',
                dataIndex: 'msg_text',
            },
            {
                title: '执行时间',
                dataIndex: 'update_at',
                render: (text) => {
                    return moment((text || 0) * 1000).format('YYYY-MM-DD HH:mm:ss')
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user_dep',
                render: (text, record) => {
                    if(text) {
                        return (
                            <EllipsisPopover content={text}/>
                        )
                    }
                    return ''
                },
            },
            {
                title: '所属员工',
                dataIndex: 'user_name',
            },
            {
                title: '所属微信',
                dataIndex: 'belong_username',
            },
            {
                title: '状态',
                dataIndex: 'state',
                render: (text, record) => {
                    let status
                    switch(text) {
                        case 0:
                            status = <Badge status="default" text="未通过"/>
                            break
                        case 1:
                            status = <Badge status="success" text="已通过"/>
                            break
                        case 2:
                            status = <Badge status="error" text="已过期"/>
                            break
                        case 3:
                            status = <Badge status="default" text="已忽略"/>
                            break
                        default:
                    }
                    return <div className={styles.status}>{status}<p>{record.state_info}</p></div>
                },
            },
            {
                title: '操作',
                dataIndex: 'option',
                key: 'option',
                render: (text, record, index) => {
                    if(record.status === 1) {
                        return (
                            <div
                                className={`${styles.option} ${styles.operate}`}
                                onClick={() => {
                                    this.inviteRecordsConfirm(record)
                                }}
                            >
                                手动通过
                            </div>
                        )
                    }else {
                        return (
                            <div className={styles.operate}>手动通过</div>
                        )
                    }
                },
            },
        ]

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 16},
        }

        const checkboxFormItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 16},
        }

        const {friendsLoading, community_groupInvitationRecord} = this.props
        const {
            params,
            list,
            total,
            current,
            checkedAll,
            applicationTime,
        } = community_groupInvitationRecord

        return (
            <div>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem
                                {...formItemLayout}
                                label="搜索："
                                colon={false}
                            >
                                <Search
                                    placeholder="输入群名称、群主昵称搜索"
                                    value={params.query}
                                    onChange={(e) => {
                                        this.handleChange('query', e)
                                    }}
                                    onSearch={this.handleSearch}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
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
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value) => {
                                        this.handleChange('uin', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={14} style={{marginLeft: '-3px'}}>
                            <FormItem
                                {...timeFormItemLayout}
                                label="执行时间："
                                colon={false}
                            >
                                <RangeDatePicker
                                    maxToday={true}
                                    value={applicationTime}
                                    onChange={this.rangeTimePickerChange}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <FormItem {...checkboxFormItemLayout} label="状态：" colon={false}>
                            <Checkbox
                                style={{marginLeft: '18px'}}
                                checked={checkedAll}
                                onChange={this.handleCheckAllChange}
                            >
                                全部
                            </Checkbox>
                            <CheckboxGroup
                                value={this.getStatusList(params.status)}
                                onChange={this.handleStatusChange}
                            >
                                <Checkbox value="is_for_unhandled">未处理</Checkbox>
                                <Checkbox value="is_for_confirmed">已通过</Checkbox>
                                <Checkbox value="is_for_overtime">已过期</Checkbox>
                                <Checkbox value="is_for_ignore">已忽略</Checkbox>
                            </CheckboxGroup>
                        </FormItem>
                    </Row>
                    <Row className={styles.operateBtn} gutter={20}>
                        <Col span={7}>
                            <Col offset={8}>
                                <Button
                                    type="primary"
                                    icon="search"
                                    onClick={this.handleSearch}
                                >
                                    搜索
                                </Button>
                                <Button onClick={this.resetSearch}>重置</Button>
                            </Col>
                        </Col>
                    </Row>
                </Form>
                <Table
                    className={styles.table}
                    columns={columns}
                    dataSource={list}
                    size="middle"
                    loading={friendsLoading}
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
        )
    }
}
