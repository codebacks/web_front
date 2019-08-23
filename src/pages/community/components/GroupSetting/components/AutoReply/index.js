/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {Button, InputNumber, message, Table, Radio, Pagination, Popconfirm, Icon, Form, Select,} from 'antd'
import {connect} from "dva/index"
import {MsgContentModal} from 'business/FullTypeMessage'
import AddKeyword from './components/AddKeyword'
import styles from './index.less'
import moment from "moment"
import _ from "lodash"
import PropTypes from "prop-types"
import config from 'community/common/config'

const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions} = config


@connect(({base, community_groupSetting_autoReply, loading}) => ({
    base,
    community_groupSetting_autoReply,
    queryGlobalLoading: loading.effects['community_groupSetting_autoReply/queryGlobal'],
    getSettingLoading: loading.effects['community_groupSetting_autoReply/getSetting'],
    setSettingLoading: loading.effects['community_groupSetting_autoReply/setSetting'],
    getTemplateDetailLoading: loading.effects['community_groupSetting_autoReply/getTemplateDetail'],
}))
export default class Index extends PureComponent {
    static propTypes = {
        autoReplyFetchOption: PropTypes.object.isRequired,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.state = {
            replyContents: [],
        }
    }

    componentDidMount() {
        this.getSetting()
        this.getTemplates()
        this.queryGlobal(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/resetState',
        })
    }

    getSetting = () => {
        const {autoReplyFetchOption} = this.props
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/getSetting',
            payload: {
                ...autoReplyFetchOption,
            },
            callback: (data) => { // 当 wx_setting_type === 2 为其他模板的情况，获取模板详情
                if(data?.wx_setting_type === 2) {
                    this.getTemplateDetail(data?.target_template_id)
                }
            }
        })
    }

    getTemplates = () => {
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/getTemplates',
        })
    }

    queryGlobal = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_groupSetting_autoReply.globalCurrent
        }
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/queryGlobal',
            payload: {page: page},
        })
    }

    getTemplateDetail = (templateId, cb) => {
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/getTemplateDetail',
            payload: {
                template_id: templateId,
            },
            callback: cb && cb(),
        })
    }

    handleOk = () => {
        const { autoReplyFetchOption, disabledSettings } = this.props
        const { reply_duration, need_at, need_ated_trigger, wx_setting_type, target_template_id, customKeywords, } = this.props.community_groupSetting_autoReply

        if(wx_setting_type === 1 && !customKeywords.length) {
            message.warning('请添加关键词！')
            return false
        }
        if(wx_setting_type === 2 && typeof target_template_id === 'undefined') {
            message.warning('请选择模板！')
            return false
        }

        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setSetting',
            payload: {
                body: {
                    ...autoReplyFetchOption,
                    reply_duration: Number(reply_duration)*60,
                    need_at,
                    need_ated_trigger,
                    status: !disabledSettings ? 1 : 0,
                    wx_setting_type,
                    template_id: wx_setting_type === 2 ? target_template_id : undefined,
                    keywords: wx_setting_type === 1 ? customKeywords : undefined,
                }
            },
            callback: () => {
                message.warning(
                    `群自动回复设置更新覆盖成功，本次设置由 ${_.get(this, 'props.base.initData.user.nickname', ' ')} 修改保存`,
                )
            },
        })
    }

    handleChangeSize = (current, size) => {
        let globalParams = {...this.props.community_groupSetting_autoReply.globalParams}
        globalParams.limit = size
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {globalParams: globalParams},
        })
        this.queryGlobal(1)
    }

    queryCustom = (page) => {
        const { customParams } = this.props.community_groupSetting_autoReply
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                customParams: {
                    ...customParams,
                    current: page,
                }
            },
        })
    }

    handleCustomChangeSize = (current, size) => {
        const { customParams } = this.props.community_groupSetting_autoReply
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                customParams: {
                    ...customParams,
                    current: 1,
                    limit: size,
                }
            },
        })
    }

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    onInputNumberChange = (e) => {
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                reply_duration: e,
            },
        })
    }

    renderSettingLevel() {
        const {
            autoReplyFetchOption: {
                setting_level,
            } = {},
        } = this.props

        switch(setting_level) {
            case 0:
                return null
            case 500:
                return (
                    <div className={styles.changBar}>
                        <span className={styles.label}>
                            配置类型：
                        </span>
                        <span className={styles.changBarRight}>活动配置</span>
                    </div>
                )
            default:
                return null
        }
    }

    onAtChange = (key, e) => {
        const val = e.target.value
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                [key]: val
            },
        })
    }

    handleChange = (type, e) => {
        let val = ''
        if(type === 'wx_setting_type') {
            val = e.target.value
        }else{
            val = e
        }
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                [type]: val,
            },
        })
        if(type === 'target_template_id') { // 获取模板详情列表
            setTimeout(() => {
                this.getTemplateDetail(val)
            }, 500)
        }
    }

    handleAddkeywordOk = (type, record, values) => {
        let { customKeywords } = this.props.community_groupSetting_autoReply
        let item = null
        if(type === 'edit') { // 编辑
            let itemIndex = customKeywords.findIndex((item) => {
                return item.id === record.id
            })
            customKeywords[itemIndex] = {...customKeywords[itemIndex], ...values}
        }else if(type === 'add') { // 新增
            if(customKeywords.length) {
                item = {
                    id: customKeywords[0].id + 1,
                    ord: customKeywords[0].ord + 1,
                    ...values
                }
            }else {
                item = {
                    id: 0,
                    ord: 0,
                    ...values
                }
            }
            customKeywords = [item, ...customKeywords]
        }
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {
                customKeywords: customKeywords
            },
        })
    }

    removeKeyword = (record) => {
        let { customKeywords } = this.props.community_groupSetting_autoReply
        let index = customKeywords.findIndex((item) => item.id === record.id)
        try {
            customKeywords.splice(index, 1)
        }catch (err) {
            console.log(err)
        }
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {customKeywords: customKeywords,},
        })
        message.success('删除成功!')
    }

    move = (record, preIndex, nextIndex) => {
        let { customKeywords } = this.props.community_groupSetting_autoReply
        let ord = 1
        if(nextIndex === 0) {
            ord = customKeywords[nextIndex].ord + 0.99
        }else if(preIndex === (customKeywords.length - 1)) {
            ord = customKeywords[preIndex].ord - 0.99
        }else {
            ord = (customKeywords[preIndex].ord + customKeywords[nextIndex].ord) / 2
        }
        let itemIndex = customKeywords.findIndex((item) => {
            return item.id === record.id
        })
        customKeywords[itemIndex] = {...customKeywords[itemIndex], ord}
        customKeywords.sort((a, b) => b.ord - a.ord)
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {customKeywords: customKeywords,},
        })
        message.success('移动成功!')
    }

    // 获取“全局”/“自定义”/“模板”的内容
    getCont = (formItemLayout, globalColumns, customColumns, filterCustomKeywords) => {
        const { getSettingLoading, queryGlobalLoading, getTemplateDetailLoading, } = this.props
        const {
            wx_setting_type, target_template_id, templates,
            customKeywords, customParams,
            globalKeywords, globalParams, globalTotal, globalCurrent,
            templateKeywords,
        } = this.props.community_groupSetting_autoReply

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
                            dataSource={filterCustomKeywords}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={getSettingLoading}
                        />
                        {filterCustomKeywords.length ? <Pagination
                            className="ant-table-pagination"
                            total={customKeywords.length}
                            current={customParams.current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共${total}条`}
                            pageSize={customParams.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleCustomChangeSize}
                            onChange={this.queryCustom}
                        /> : null}
                    </div>
                </>
            )
        }else if(wx_setting_type === 2) { // 模板
            cont = (
                <>
                    <FormItem {...formItemLayout} label={<><span className={styles.require}>*</span>选择模板：</>} colon={false}>
                        <Select
                            style={{width: '40%'}}
                            value={target_template_id}
                            placeholder="请选择模板"
                            onChange={(e) => this.handleChange('target_template_id', e)}>
                            {
                                templates.map((item) => {
                                    return <Option key={item.id} value={item.id}>{item.title}</Option>
                                })
                            }
                        </Select>
                    </FormItem>
                    {
                        typeof target_template_id !== 'undefined' ? (
                            <div className={styles.tableWrap}>
                                <Table
                                    columns={globalColumns}
                                    dataSource={templateKeywords}
                                    size="middle"
                                    rowKey={(record, index) => index}
                                    pagination={false}
                                    loading={getTemplateDetailLoading}
                                />
                            </div>
                        ) : null
                    }
                </>
            )
        }
        return cont
    }

    render() {
        const {
            queryGlobalLoading,
            community_groupSetting_autoReply,
            getSettingLoading,
            setSettingLoading,
            dispatch,
            disabledSettings,
        } = this.props
        const {
            reply_duration,
            need_at,
            need_ated_trigger,
            wx_setting_type,
            customKeywords,
            customParams,
        } = community_groupSetting_autoReply

        // 自定义回复关键词列表：本地维护
        const filterCustomKeywords = customKeywords.slice(customParams.limit * (customParams.current - 1), customParams.limit * customParams.current)

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
                                                type: 'community_groupSetting_autoReply/getReplyContents',
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
                                                type: 'community_groupSetting_autoReply/getReplyContents',
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
                            index === filterCustomKeywords.length - 1 ? <span>下移</span>
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
            <div className={styles.autoReply}>
                {
                    this.renderSettingLevel()
                }
                <div className={styles.atReplier}>
                    <span className={styles.atTitle}>触发是否要@回复者：</span>
                    <RadioGroup
                        disabled={getSettingLoading || setSettingLoading}
                        onChange={(e) => this.onAtChange('need_ated_trigger', e)}
                        value={need_ated_trigger}
                        className={styles.atRadioGroup}
                    >
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                    </RadioGroup>
                    <span className={styles.atDesc}>该选项启用后，群成员发送问题中的关键内容，需要在前面加上@回复者</span>
                </div>
                <div className={styles.atMember}>
                    <span className={styles.atTitle}>回复是否要@群成员：</span>
                    <RadioGroup
                        disabled={getSettingLoading || setSettingLoading}
                        onChange={(e) => this.onAtChange('need_at', e)}
                        value={need_at}
                        className={styles.atRadioGroup}
                    >
                        <Radio value={1}>是</Radio>
                        <Radio value={0}>否</Radio>
                    </RadioGroup>
                    <span className={styles.atDesc}>该选项启用后，每条关键内容触发的回复，回复者回复时将@群成员</span>
                </div>
                <div className={styles.duration}>
                    <span className={styles.label}>
                        设置间隔时间：
                    </span>
                    <InputNumber
                        disabled={getSettingLoading}
                        className={styles.inputNumber}
                        min={5}
                        max={1440}
                        step={1}
                        value={reply_duration}
                        onChange={this.onInputNumberChange}
                        formatter={this.formatter}
                    />
                    分钟
                    <span className={styles.durationMark}>
                        设置间隔时间：30分钟 间隔时间设置是用于避免在同一时间段重复发送多次相同的自动回复，每条规则将按此设置判断间隔时间，默认30分钟，最少5分钟，最大1440分钟
                    </span>
                </div>
                <div className={styles.changBar}>
                    <span className={styles.label}>
                        模板选择：
                    </span>
                    <RadioGroup
                        value={wx_setting_type}
                        disabled={getSettingLoading || setSettingLoading}
                        onChange={(e) => this.handleChange('wx_setting_type', e)}
                    >
                        <Radio value={0}>全局</Radio>
                        <Radio value={1}>自定义</Radio>
                        <Radio value={2}>其他模板</Radio>
                    </RadioGroup>
                </div>
                <div className={styles.content}>
                    {
                        this.getCont(formItemLayout, globalColumns, customColumns, filterCustomKeywords)
                    }
                </div>

                <div>
                    <Button
                        type="primary"
                        onClick={this.handleOk}
                        loading={queryGlobalLoading || getSettingLoading || setSettingLoading}
                        className={styles.saveBtn}
                    >
                        保存
                    </Button>
                </div>
                {
                    disabledSettings && <div className={styles.contentMask}/>
                }
            </div>
        )
    }
}
