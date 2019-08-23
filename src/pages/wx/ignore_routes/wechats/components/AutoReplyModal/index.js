/**
 * @Description
 * @author XuMengPeng
 * @date 2019/4/3
*/

import React from 'react'
import { Row, Col, Form, message, Radio, Table, Checkbox, Pagination, Select, Popconfirm, Icon, Button, Spin, } from 'antd'
import {connect} from 'dva'
import {hot} from 'react-hot-loader'
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"
import _ from "lodash"
import config from 'wx/common/config'
import {MsgContentModal} from 'business/FullTypeMessage'
import AddKeyword from './components/AddKeyword'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

const {pageSizeOptions} = config

@hot(module)
@toggleModalWarp({
    title: '智能管理',
    width: 1000,
    destroyOnClose: true,
    maskClosable: false,
})

@connect(({wx_weChatsAutoReplyModal, loading}) => ({
    wx_weChatsAutoReplyModal,
    getSettingLoading: loading.effects['wx_weChatsAutoReplyModal/getSetting'],
    setSettingLoading: loading.effects['wx_weChatsAutoReplyModal/setSetting'],
    queryGlobalLoading: loading.effects['wx_weChatsAutoReplyModal/queryGlobal'],
}))
export default class AutoReplyModal extends React.Component {
    static propTypes = {
        uin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        onOk: PropTypes.func,
    }

    static defaultProps = {
        onOk: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {
            replyContents: [], // 回复内容
        }
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        // 进入组件中，请求数据
        this.getSetting()
        this.getTemplates()
        this.queryGlobal(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/resetState',
        })
    }

    getSetting() {
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/getSetting',
            payload: {
                uin: this.props.uin,
            },
        })
    }

    getTemplates() {
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/getTemplates',
        })
    }

    queryGlobal = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.wx_weChatsAutoReplyModal.globalCurrent
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/queryGlobal',
            payload: {page: page},
        })
    }

    queryCustom = (page) => {
        let { params } = this.props.wx_weChatsAutoReplyModal
        params.current = page
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {params: params,},
        })
    }

    setSetting = (cb = ()=>{}) => {
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setSetting',
            payload: {
                uin: this.props.uin,
            },
            callback: cb
        })
    }

    handleOk = () => {
        const { onOk } = this.props
        const { status, wx_setting_type, list, target_template_id, } = this.props.wx_weChatsAutoReplyModal
        if(status && wx_setting_type === 1 && !list.length) { // 自定义
            message.warning('请先新建关键词！')
            return
        }else if(status && wx_setting_type === 2 && typeof target_template_id === 'undefined') { // 模板选择
            message.warning('请先选择模板！')
            return
        }
        this.setSetting(() => {
            this.props.onModalCancel()
            onOk()
        })
    }

    handleChange = (type, e) => {
        let val = ''
        if(type === 'wx_setting_type') {
            val = e.target.value
        }else if (type === 'status') {
            val = e.target.checked ? 1: 0
        }else{
            val = e
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {
                [type]: val,
            },
        })
    }

    move = (record, preIndex, nextIndex) => {
        let { list } = this.props.wx_weChatsAutoReplyModal
        let ord = 1
        if(nextIndex === 0) {
            ord = list[nextIndex].ord + 0.99
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord - 0.99
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }
        let itemIndex = list.findIndex((item) => {
            return item.id === record.id
        })
        list[itemIndex] = {...list[itemIndex], ord}
        list.sort((a, b) => b.ord - a.ord)
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {list: list,},
        })
        message.success('移动成功!')
    }

    removeKeyword = (record) => {
        let { list } = this.props.wx_weChatsAutoReplyModal
        let index = list.findIndex((item) => item.id === record.id)
        try {
            list.splice(index, 1)
        }catch (err) {
            console.log(err)
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {list: list,},
        })
        message.success('删除成功!')
    }

    handleChangeSize = (current, size) => {
        let globalParams = {...this.props.wx_weChatsAutoReplyModal.globalParams}
        globalParams.limit = size
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {globalParams: globalParams},
        })
        this.queryGlobal(1)
    }

    handleCustomChangeSize = (current, size) => {
        let { params } = this.props.wx_weChatsAutoReplyModal
        params.current = current
        params.limit = size
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {params: params,},
        })
    }

    handleAddkeywordOk = (type, record, values) => {
        let { list } = this.props.wx_weChatsAutoReplyModal
        let item = null
        if(type === 'edit') { // 编辑
            let itemIndex = list.findIndex((item) => {
                return item.id === record.id
            })
            list[itemIndex] = {...list[itemIndex], ...values}
        }else if(type === 'add') { // 新增
            if(list.length) {
                item = {
                    id: list[0].id + 1,
                    ord: list[0].ord + 1,
                    ...values
                }
            }else {
                item = {
                    id: 0,
                    ord: 0,
                    ...values
                }
            }
            list = [item, ...list]
        }
        this.props.dispatch({
            type: 'wx_weChatsAutoReplyModal/setProperty',
            payload: {
                list: list
            },
        })
    }

    getCont = (formItemLayout, globalColumns, customColumns, filterList) => {
        const { getSettingLoading, queryGlobalLoading, } = this.props
        const {
            wx_setting_type, target_template_id, templates,
            list, params,
            globalKeywords, globalParams, globalTotal, globalCurrent,
        } = this.props.wx_weChatsAutoReplyModal

        let cont = ''
        if(wx_setting_type === 0 ) { // 全局
            cont = (
                <div className={styles.tableWrap}>
                    <Table
                        columns={globalColumns}
                        dataSource={globalKeywords}
                        size="middle"
                        rowKey={(record, index) => index}
                        pagination={false}
                        loading={queryGlobalLoading}
                        onChange={this.handleTableChange}
                    />
                    {globalKeywords.length ? <Pagination
                        className="ant-table-pagination"
                        total={globalTotal}
                        current={globalCurrent}
                        showQuickJumper={true}
                        pageSizeOptions={pageSizeOptions}
                        showTotal={total => `共${total}条`}
                        pageSize={globalParams.limit}
                        showSizeChanger={true}
                        onShowSizeChange={this.handleChangeSize}
                        onChange={this.queryGlobal}
                    /> : null}
                </div>
            )
        }else if(wx_setting_type === 1) { // 自定义
            cont = (
                <>
                    <div className={styles.addBtn}>
                        <AddKeyword
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button type='primary' onClick={setTrue}>新建关键词</Button>
                                )
                            }}
                            type={'add'}
                            onOk={this.handleAddkeywordOk}
                            modalOption={{
                                title: '新建关键词',
                            }}
                        />
                    </div>
                    <div className={styles.tableWrap}>
                        <Table
                            columns={customColumns}
                            dataSource={filterList}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={getSettingLoading}
                            onChange={this.handleTableChange}
                        />
                        {filterList.length ? <Pagination
                            className="ant-table-pagination"
                            total={list.length}
                            current={params.current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共${total}条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleCustomChangeSize}
                            onChange={this.queryCustom}
                        /> : null}
                    </div>
                </>
            )
        }else if(wx_setting_type === 2) { // 模板
            cont = (
                <FormItem {...formItemLayout} label={<><span className={styles.require}>*</span>选择模板：</>} colon={false}>
                    <Select
                        style={{width: '40%'}}
                        value={target_template_id}
                        placeholder="请选择模板"
                        allowClear={true}
                        onChange={(e) => this.handleChange('target_template_id', e)}>
                        {
                            templates.map((item) => {
                                return <Option key={item.id} value={item.id}>{item.title}</Option>
                            })
                        }
                    </Select>
                </FormItem>
            )
        }
        return cont
    }

    render() {
        const { getSettingLoading, setSettingLoading, } = this.props
        const { status, wx_setting_type, list, params} = this.props.wx_weChatsAutoReplyModal
        const filterList = list.slice(params.limit * (params.current - 1), params.limit * params.current)

        const formItemLayout = {
            labelCol: {span: 3},
            wrapperCol: {span: 16},
        }
        const globalColumns = [
            {
                title: '关键词',
                dataIndex: 'content',
            },
            {
                title: '回复内容',
                dataIndex: 'knowledge_base_category_item_id',
                render: (text, record) => {
                    return (
                        <MsgContentModal
                            contents={this.state.replyContents}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.canEdit}
                                        onClick={() => {
                                            this.props.dispatch({
                                                type: 'wx_weChatsAutoReplyModal/getReplyContents',
                                                payload: {id: text},
                                                callback: (data) => {
                                                    this.setState({
                                                        replyContents: data.reply_contents,
                                                    })
                                                },
                                            })
                                            setTrue()
                                        }}
                                    >
                                        {record.reply_msg_count || 0}条消息
                                    </span>
                                )
                            }}
                        />
                    )
                }
            },
        ]
        const customColumns = [
            {
                title: '关键词',
                dataIndex: 'content',
            },
            {
                title: '回复内容',
                dataIndex: 'knowledge_base_category_item_id',
                render: (text, record) => {
                    return (
                        <MsgContentModal
                            contents={this.state.replyContents}
                            renderBtn={(setTrue) => {
                                return (
                                    <span
                                        className={styles.canEdit}
                                        onClick={() => {
                                            this.props.dispatch({
                                                type: 'wx_weChatsAutoReplyModal/getReplyContents',
                                                payload: {id: text},
                                                callback: (data) => {
                                                    this.setState({
                                                        replyContents: data.reply_contents,
                                                    })
                                                },
                                            })
                                            setTrue()
                                        }}
                                    >
                                        {record?.reply_msg_count || 0}条消息
                                    </span>
                                )
                            }}
                        />
                    )
                }
            },
            {
                title: '操作',
                key: 'operator',
                className: styles.editColumn,
                render: (text, record, index) => {
                    return <>
                        <AddKeyword
                            {...this.props}
                            renderBtn={(setTrue) => {
                                return (
                                    <span className={styles.canEdit} onClick={setTrue}>编辑</span>
                                )
                            }}
                            type={'edit'}
                            record={record}
                            onOk={this.handleAddkeywordOk}
                            modalOption={{
                                title: '修改关键词',
                            }}
                        />
                        {
                            index === 0 ? <span>上移</span>
                                : <span className={styles.canEdit} onClick={() => {
                                    this.move(record, index - 2, index - 1)
                                }}>上移</span>
                        }
                        {
                            index === filterList.length - 1 ? <span>下移</span>
                                : <span className={styles.canEdit} onClick={() => {
                                    this.move(record, index + 1, index + 2)
                                }}>下移</span>
                        }
                        <Popconfirm
                            placement="top"
                            title="确认删除该规则？"
                            icon={<Icon type="close-circle" style={{color: '#f00'}} />}
                            onConfirm={(e) => this.removeKeyword(record)}
                        >
                            <span className={styles.canEdit}>删除</span>
                        </Popconfirm>

                    </>
                },
            },
        ]

        return (
            <div className={styles.autoReplyModal}>
                <Spin spinning={getSettingLoading}>
                    <FormItem {...formItemLayout} label={'自动回复：'} colon={false}>
                        <RadioGroup
                            value={wx_setting_type}
                            disabled={getSettingLoading || setSettingLoading}
                            onChange={(e) => this.handleChange('wx_setting_type', e)}
                        >
                            <Radio value={0}>全局</Radio>
                            <Radio value={1}>自定义</Radio>
                            <Radio value={2}>其他模板</Radio>
                        </RadioGroup>
                    </FormItem>
                    <Row>
                        <Col offset={3}>
                            <Checkbox
                                checked={!!status}
                                disabled={getSettingLoading || setSettingLoading}
                                onChange={(e) => this.handleChange('status', e)}
                                className={styles.checkbox}
                            >开启此功能</Checkbox>
                            {
                                this.getCont(formItemLayout, globalColumns, customColumns, filterList)
                            }
                        </Col>
                    </Row>
                </Spin>
            </div>
        )
    }
}
