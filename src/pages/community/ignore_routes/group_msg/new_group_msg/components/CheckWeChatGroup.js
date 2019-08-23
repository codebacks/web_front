import React, {PureComponent} from 'react'
import {
    Form,
    Button,
    Row,
    Col,
    Table,
    Popover,
    Checkbox,
    Popconfirm,
    Input,
    message,
    Select,
} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import styles from "../index.less"
import EllipsisPopover from "components/EllipsisPopover"
import _ from 'lodash'

const Option = Select.Option

@connect(({base, community_automaticNewGroupMsg, loading}) => ({
    base,
    community_automaticNewGroupMsg,
    tableLoading: loading.effects['community_automaticNewGroupMsg/checkWeChatGroupSearch'],
    groupingsSummaryLoading: loading.effects['community_automaticNewGroupMsg/groupingsSummary'],
}))
@documentTitleDecorator({
    title: '核对微信群',
})
@Form.create()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        const checkWeChatGroup = props.community_automaticNewGroupMsg.checkWeChatGroup
        this.state = {
            wxFilterNickname: checkWeChatGroup.wxFilter.nickname,
            wxFilterGroupId: checkWeChatGroup.wxFilter.group_id,
            selectedNickname: checkWeChatGroup.selected.nickname,
            selectedGroupId: checkWeChatGroup.selected.group_id,
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/groupingsSummary',
            payload: {},
        })
    }

    onChange = (e) => {
        const checked = e.target.checked

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: 'checkWeChatGroup.wxFilter.isSync',
                value: checked,
            },
        })

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setWxFilter',
            payload: {},
        })
        this.goPage(1)
    }

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    onInputChange = (e) => {
        this.setState({
            wxFilterNickname: e.target.value,
        })
    }

    handleFilter = () => {
        const {
            wxFilterNickname,
            wxFilterGroupId,
        } = this.state

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/assignStateByPath',
            payload: {
                path: `checkWeChatGroup.wxFilter`,
                value: {
                    nickname: wxFilterNickname,
                    group_id: wxFilterGroupId,
                },
            },
        })

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setWxFilter',
            payload: {},
        })

        this.goPage(1)
    }

    onSelectChange = (value) => {
        this.setState({
            wxFilterGroupId: value,
        })
    }

    onSelectedChange = (e) => {
        this.setState({
            selectedNickname: e.target.value,
        })
    }

    onSelectedSelect = (value) => {
        this.setState({
            selectedGroupId: value,
        })
    }

    handleSelectedFilter = () => {
        const {
            selectedNickname,
            selectedGroupId,
        } = this.state

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/assignStateByPath',
            payload: {
                path: `checkWeChatGroup.selected`,
                value: {
                    nickname: selectedNickname,
                    group_id: selectedGroupId,
                },
            },
        })

        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setSelectedFilter',
            payload: {},
        })
        this.goPage(1, 'selected')
    }

    handleChangeSize = (current, size, name = 'wxFilter') => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/assignStateByPath',
            payload: {
                path: `checkWeChatGroup.${name}`,
                value: {
                    current: 1,
                    limit: size,
                },
            },
        })
    }

    goPage = (page, name = 'wxFilter') => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/setStateByPath',
            payload: {
                path: `checkWeChatGroup.${name}.current`,
                value: page,
            },
        })
    }

    handleSelectedAll = () => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/selectedAll',
        })
    }

    handleRemoveAll = () => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/handleRemoveAll',
        })
    }

    handleSelectChange = (records, keys, checked) => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/selectedRow',
            payload: {
                checked,
                keys,
                records,
            },
        })
    }

    next = () => {
        let table = this.props.community_automaticNewGroupMsg.checkWeChatGroup.selected.table

        if (table.length > 0) {
            this.props.dispatch({
                type: 'community_automaticNewGroupMsg/filterReGroup',
            })
            this.props.next()
        }else {
            message.error('请选择微信群')
        }
    }

    getTagsOptions = () => {
        let groupingsSummary = this.props.community_automaticNewGroupMsg.checkWeChatGroup.groupingsSummary

        return groupingsSummary.map((item, index) => {
            return (
                <Option value={item.id} key={item.id}>{item.title}</Option>
            )
        })
    }

    render() {
        const {
            tableLoading,
            community_automaticNewGroupMsg,
            groupingsSummaryLoading,
        } = this.props
        const {
            exitsCountData,
            wxFilter,
            selected,
        } = community_automaticNewGroupMsg.checkWeChatGroup

        const dataSource = wxFilter.table.slice(wxFilter.limit * (wxFilter.current - 1), wxFilter.limit * wxFilter.current)
        const dataSourceLen = dataSource.length
        const selectedRowKeysMap = wxFilter.selectedRowKeysMap
        let checkedAll = false
        let checkedLen = 0
        const records = []
        const keys = []
        dataSource.forEach((item) => {
            records.push(item)
            keys.push(item.id)
            if (selectedRowKeysMap[item.id]) {
                checkedLen++
            }
        })

        if (dataSourceLen > 0 && (dataSourceLen === checkedLen)) {
            checkedAll = true
        }

        const {
            wxFilterNickname,
            wxFilterGroupId,
            selectedNickname,
            selectedGroupId,
        } = this.state

        const columns = [
            {
                title: (
                    <Checkbox
                        onChange={(e) => this.handleSelectChange(records, keys, e.target.checked)}
                        checked={checkedAll}
                    />
                ),
                dataIndex: 'unid',
                render: (text, record) => {
                    return (
                        <Checkbox
                            onChange={(e) => this.handleSelectChange([record], [record.id], e.target.checked)}
                            checked={selectedRowKeysMap[record.id]}
                        />
                    )
                },
            },
            {
                title: '群名称',
                dataIndex: 'target',
                render: (text, record, index) => {
                    return (
                        <EllipsisPopover
                            lines={1}
                            content={text.nickname || text.display_name || ''}
                        />
                    )
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.nickname',
                render: (text, record, index) => {
                    return (
                        <EllipsisPopover
                            lines={1}
                            content={text}
                        />
                    )
                },
            },
            {
                title: '成员数',
                dataIndex: 'target.member_count',
            },
            {
                title: '群分组',
                dataIndex: 'group',
                render: (text, record, index) => {
                    return _.get(text, 'title', '未分组')
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if (departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={
                                    <p
                                        style={{
                                            'maxWidth': '240px',
                                            'wordBreak': 'break-all',
                                        }}
                                    >
                                        {content}
                                    </p>
                                }
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
                dataIndex: 'user.nickname',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    return text ? text : record.from.nickname
                },
            },
        ]
        const columnsSelected = [
            {
                title: '群名称',
                dataIndex: 'target',
                render: (text, record, index) => {
                    return (
                        <EllipsisPopover
                            lines={1}
                            content={text.nickname || text.display_name || ''}
                        />
                    )
                },
            },
            {
                title: '群主',
                dataIndex: 'target.owner.nickname',
                render: (text, record, index) => {
                    return (
                        <EllipsisPopover
                            lines={1}
                            content={text}
                        />
                    )
                },
            },
            {
                title: '成员数',
                dataIndex: 'target.member_count',
            },
            {
                title: '群分组',
                dataIndex: 'group',
                render: (text, record, index) => {
                    return _.get(text, 'title', '未分组')
                },
            },
            {
                title: '所属部门',
                dataIndex: 'user.departments',
                className: styles.deptColumn,
                render: (text, record, index) => {
                    let departments = text
                    let content = ''
                    if (departments && departments.length) {
                        content = departments.map((item) => {
                            return item.name
                        }).join('，')
                        return (
                            <Popover
                                placement="topLeft"
                                content={
                                    <p
                                        style={{
                                            'maxWidth': '240px',
                                            'wordBreak': 'break-all',
                                        }}
                                    >
                                        {content}
                                    </p>
                                }
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
                dataIndex: 'user.nickname',
                render: (text, record, index) => {
                    return text
                },
            },
            {
                title: '所属微信',
                dataIndex: 'from.remark',
                render: (text, record, index) => {
                    return text ? text : record.from.nickname
                },
            },
            {
                title: '操作',
                width: 60,
                dataIndex: 'option',
                render: (text, record) => {
                    return (
                        <Button
                            size="small"
                            onClick={() => this.handleSelectChange([record], [record.id], false)}
                        >
                            取消
                        </Button>
                    )
                },
            },
        ]

        return (
            <div className={styles.checkWeChatGroup}>
                <Row>
                    <Col span={12} className={styles.left}>
                        <Row>
                            <Col span={24} className={styles.tableSearch}>
                                <div
                                    className={styles.searchLeft}
                                >
                                    已选微信群 {wxFilter.table.length}
                                    {/*<span*/}
                                    {/*className={styles.note}*/}
                                    {/*>*/}
                                    {/*（自动过滤已退出的群{exitsCountData.exit_count}个, 自动过滤员工号非群主的群{exitsCountData.is_not_owner_count}个）*/}
                                    {/*</span>*/}
                                </div>
                                <div className={styles.line}>
                                    为了避免被封号有以下几点建议
                                </div>
                                <div className={styles.line}>
                                    1.尽量使用小号进行群发，不要使用主号群发
                                </div>
                                <div className={styles.line}>
                                    2.每个微信号一次群发的微信群数量尽量不超过5个
                                </div>
                                <div className={styles.line}>
                                    3.每天不要对一个微信群多次群发内容
                                </div>
                            </Col>
                        </Row>
                        <Row className={styles.option}>
                            <Col span={11}>
                                <Input
                                    className={styles.formItem}
                                    placeholder={`搜索群名称`}
                                    disabled={tableLoading}
                                    value={wxFilterNickname}
                                    onPressEnter={this.handleFilter}
                                    onChange={this.onInputChange}
                                />
                            </Col>
                            <Col span={10}>
                                <Select
                                    optionFilterProp="children"
                                    placeholder="群分组"
                                    value={wxFilterGroupId}
                                    className={styles.formItem}
                                    onChange={this.onSelectChange}
                                    loading={groupingsSummaryLoading}
                                >
                                    <Option value={-100} key={-100}>
                                        全部分组
                                    </Option>
                                    {this.getTagsOptions()}
                                </Select>
                            </Col>
                            <Col span={3} className={styles.searchBtn}>
                                <Button
                                    type="primary"
                                    icon="search"
                                    onClick={this.handleFilter}
                                >
                                    搜索
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <div className={styles.filterBar}>
                                    <Checkbox
                                        disabled={tableLoading}
                                        checked={wxFilter.isSync}
                                        onChange={this.onChange}
                                    >
                                        过滤非工作群
                                    </Checkbox>
                                    {/*<span>*/}
                                    {/*为避免被封号建议每个微信号一次群发不超过10个微信群*/}
                                    {/*</span>*/}
                                    {/*<InputNumber*/}
                                    {/*className={styles.input}*/}
                                    {/*min={1}*/}
                                    {/*max={10}*/}
                                    {/*step={1}*/}
                                    {/*defaultValue={1}*/}
                                    {/*onChange={this.onChange}*/}
                                    {/*formatter={this.formatter}*/}
                                    {/*/>*/}
                                    {/*天内发过群发的微信群*/}
                                    <span
                                        className={styles.note}
                                    >
                                    （自动过滤已退出的群{exitsCountData.exit_count}个, 自动过滤员工号非群主的群{exitsCountData.is_not_owner_count}个）
                                    </span>
                                    <Button
                                        className={styles.selectAll}
                                        onClick={this.handleSelectedAll}
                                        loading={tableLoading}
                                    >
                                        {wxFilter.selectedAll ? '全部取消' : '全部选择'}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <div className={styles.table}>
                                    <Table
                                        columns={columns}
                                        dataSource={dataSource}
                                        rowKey={record => record.id}
                                        loading={tableLoading}
                                        pagination={wxFilter.table.length ? {
                                            total: wxFilter.table.length,
                                            current: wxFilter.current,
                                            showQuickJumper: true,
                                            showTotal: total => `共 ${total} 条`,
                                            pageSize: wxFilter.limit,
                                            showSizeChanger: true,
                                            onChange: (page) => {
                                                this.goPage(page)
                                            },
                                            onShowSizeChange: (current, size) => {
                                                this.handleChangeSize(current, size)
                                            },
                                            pageSizeOptions: ['10', '20', '30', '50'],
                                        } : false}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12} className={styles.right}>
                        <div className={styles.selected}>
                            <h4>已选<span className={styles.total}>{selected.data.length}</span>个微信群</h4>
                            <Row className={styles.search}>
                                <Col span={11}>
                                    <Input
                                        className={styles.formItem}
                                        placeholder={`搜索群名称`}
                                        disabled={tableLoading}
                                        value={selectedNickname}
                                        onPressEnter={this.handleSelectedFilter}
                                        onChange={this.onSelectedChange}
                                    />
                                </Col>
                                <Col span={10}>
                                    <Select
                                        optionFilterProp="children"
                                        placeholder="群分组"
                                        value={selectedGroupId}
                                        className={styles.formItem}
                                        onChange={this.onSelectedSelect}
                                        loading={groupingsSummaryLoading}
                                    >
                                        <Option value={-100} key={-100}>
                                            全部分组
                                        </Option>
                                        {this.getTagsOptions()}
                                    </Select>
                                </Col>
                                <Col span={3} className={styles.searchBtn}>
                                    <Button
                                        type="primary"
                                        icon="search"
                                        onClick={this.handleSelectedFilter}
                                    >
                                        搜索
                                    </Button>
                                </Col>
                            </Row>
                            <div className={styles.rightOption}>
                                <Popconfirm
                                    placement="top"
                                    title="确认全部取消?"
                                    onConfirm={this.handleRemoveAll}
                                    okText="确认"
                                    cancelText="取消"
                                >
                                    <Button
                                        className={styles.cancel}
                                        loading={tableLoading}
                                    >
                                        全部取消
                                    </Button>
                                </Popconfirm>
                            </div>
                            <div className={styles.listWrap}>
                                <Table
                                    columns={columnsSelected}
                                    dataSource={selected.table.slice(selected.limit * (selected.current - 1), selected.limit * selected.current)}
                                    rowKey={record => `${record.from.uin}_${record.target.username}`}
                                    loading={tableLoading}
                                    pagination={selected.table.length ? {
                                        total: selected.table.length,
                                        current: selected.current,
                                        showQuickJumper: true,
                                        showTotal: total => `共 ${total} 条`,
                                        pageSize: selected.limit,
                                        showSizeChanger: true,
                                        onChange: (page) => {
                                            this.goPage(page, 'selected')
                                        },
                                        onShowSizeChange: (current, size) => {
                                            this.handleChangeSize(current, size, 'selected')
                                        },
                                        pageSizeOptions: ['10', '20', '30', '50'],
                                    } : false}
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className={styles.footer}>
                    <Button
                        type="primary"
                        className={styles.btn}
                        onClick={this.next}
                    >
                        下一步
                    </Button>
                    <Button
                        className={styles.btn}
                        onClick={this.props.prev}
                    >
                        上一步
                    </Button>
                    <Button onClick={this.props.cancel}>
                        取消
                    </Button>
                </div>
            </div>
        )
    }
}
