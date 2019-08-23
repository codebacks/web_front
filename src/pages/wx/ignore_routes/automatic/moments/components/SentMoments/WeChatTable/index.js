import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {Table, Popover} from 'antd'
import config from 'wx/common/config'
import styles from './index.scss'

const {pageSizeOptions} = config

export default class WeChatTable extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            current: 1,
            limit: 10,
        }
    }

    static propTypes = {
        list: PropTypes.array,
        onRemove: PropTypes.func,
    }

    static defaultProps = {
        list: [],
        onRemove: () => {},
    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handleChangeSize = (current, size) => {
        this.setState({
            current: 1,
            limit: size,
        })
        this.goPage(1)
    }

    handleChangePage = (page) => {
        this.goPage(page)
    }

    goPage = (page) => {
        this.setState({
            current: page
        })
    }

    handleRemove = (uin) => {
        this.props.onRemove(uin, (list) => {
            if(this._isMounted) {
                const {limit} = this.state
                this.goPage(Math.ceil(list.length / limit))
            }
        })
    }

    render() {
        const {list} = this.props
        const {limit, current} = this.state

        const columns = [
            {
                title: '微信昵称',
                dataIndex: 'nickname',
            },
            {
                title: '微信号',
                dataIndex: 'alias',
                render: (text, record) => {
                    return record.alias || record.username
                }
            },
            {
                title: '备注',
                dataIndex: 'remark',
                className: styles.remark
            },
            {
                title: '所属账号',
                dataIndex: 'user',
                render: (text) => {
                    return text.nickname
                }
            },
            {
                title: '所属部门',
                dataIndex: 'department',
                className: styles.deptColumn,
                render: (text, record) => {
                    let departments = record.user.departments
                    let content = ''
                    if(departments && departments.length){
                        content = departments.map((item)=>{
                            return item.name
                        }).join('，')
                        return <Popover placement="topLeft" content={<p className={styles.wholeDept}>{content}</p>} title={null} trigger="hover">
                            <div className={styles.dept}>{content}</div>
                        </Popover>
                    }
                    return ''
                }
            },
            {
                title: '操作',
                dataIndex: 'operation',
                render: (text, record) => {
                    return <span className={styles.delete} onClick={()=>{this.handleRemove(record.uin)}}>删除</span>
                }
            }
        ]

        return (
            <Table columns={columns}
                dataSource={list.slice(limit * (current - 1), limit * current)}
                size="small"
                rowKey={(record, index) => index}
                pagination={{
                    size: "small",
                    total: list.length,
                    current: current,
                    showQuickJumper: true,
                    pageSizeOptions: pageSizeOptions,
                    showTotal: total => `共 ${total} 条`,
                    pageSize: limit,
                    showSizeChanger: true,
                    onShowSizeChange: this.handleChangeSize,
                    onChange: this.handleChangePage,
                }}
            />
        )
    }
}
