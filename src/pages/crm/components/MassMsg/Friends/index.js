import React from 'react'
import {Table, Pagination, Popover} from 'antd'
import {connect} from 'dva'
import styles from './index.scss'
import config from 'wx/common/config'

const {pageSizeOptions} = config

@connect(({loading, crm_mass_msg_group}) => ({
    crm_mass_msg_group,
    friendsLoading: loading.effects['crm_mass_msg_group/filterFriends']
}))
export default class Friends extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.loadFriends()
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {
                friendsParams: {
                    limit: 10,
                    offset: 0,
                },
                friends: [],
                friendsTotal: 0,
                friendsCurrent: 1,
            }
        })
    }

    loadFriends = () => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/filterFriends',
            payload: {}
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.crm_mass_msg_group.friendsParams}
        params.limit = size
        this.props.dispatch({
            type: 'crm_mass_msg_group/setProperty',
            payload: {friendsParams: params},
        })
        this.goPage(1)
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/filterFriends',
            payload: {page: page}
        })
    }

    render() {
        const columns = [
            {
              title: '客户姓名',
              dataIndex: 'customer.name'
            },
            {
                title: '微信昵称',
                dataIndex: 'target.nickname',
            },
            {
                title: '微信号',
                dataIndex: 'target.alias',
            },
            {
                title: '微信备注',
                dataIndex: 'target.remark_name',
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    if(record.user && record.user.departments){
                        let departments = record.user.departments
                        let content = ''
                        if(departments && departments.length){
                            content = departments.map((item)=>{
                                return item.name
                            }).join('，')
                            return  <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                                <div className={styles.dept}>{content}</div>
                            </Popover>
                        }
                    }
                    return ''
                }
            },
            {
                title: '所属员工',
                dataIndex: 'user.nickname',
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    if (!text) {
                        return record.from.nickname
                    }
                    return text
                }
            },
        ]

        const {friendsLoading} = this.props
        const {friendsParams, friends, friendsCurrent, friendsTotal} = this.props.crm_mass_msg_group

        return (
            <div>
                <Table
                    columns={columns}
                    dataSource={friends}
                    loading={friendsLoading}
                    rowKey={(record, index) => index}
                    pagination={false}
                />
                { friends.length ? <Pagination
                    className="ant-table-pagination"
                    total={friendsTotal}
                    size="small"
                    current={friendsCurrent}
                    showQuickJumper={true}
                    pageSizeOptions={pageSizeOptions}
                    showTotal={total => `共 ${total} 条`}
                    pageSize={friendsParams.limit}
                    showSizeChanger={true}
                    onShowSizeChange={this.handleChangeSize}
                    onChange={this.goPage}
                /> : ''
                }
            </div>
        )
    }
}
