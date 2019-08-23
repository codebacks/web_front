/**
 * @Description
 * @author XuMengPeng
 * @date 2019/5/5
*/

import React, {PureComponent} from 'react'
import {InputNumber, message, Table, Radio, Pagination, Popconfirm, Icon, Form, Select,} from 'antd'
import {connect} from "dva/index"
import toggleModalWarp from 'hoc/toggleModalWarp'
import {MsgContentModal} from 'business/FullTypeMessage'
import {hot} from "react-hot-loader"
import styles from './index.less'
import moment from "moment"
import _ from "lodash"
import PropTypes from "prop-types"
import config from 'community/common/config'

const RadioGroup = Radio.Group
const FormItem = Form.Item
const Option = Select.Option
const {pageSizeOptions} = config
// const pageSizeOptions = ['1', '20', '50', '100']

@hot(module)
@toggleModalWarp({
    title: '批量配置-自动回复',
    width: 1000,
    destroyOnClose: true,
    maskClosable: false,
})
@connect(({base, community_group_management_autoReplyModal, loading}) => ({
    base,
    community_group_management_autoReplyModal,
    queryGlobalLoading: loading.effects['community_group_management_autoReplyModal/queryGlobal'],
    getSettingLoading: loading.effects['community_group_management_autoReplyModal/getSetting'],
    setSettingLoading: loading.effects['community_group_management_autoReplyModal/setSetting'],
    getTemplateDetailLoading: loading.effects['community_group_management_autoReplyModal/getTemplateDetail'],
}))
export default class AutoReplyModal extends PureComponent {
    static propTypes = {
        onOk: PropTypes.func,
    }

    static defaultProps = {
        onOk: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {
            replyContents: [],
        }
        props.setModalOkFn(this.handleOnOk)
    }

    componentDidMount() {
        this.getSetting()
        this.getTemplates()
        this.queryGlobal(1)
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/resetState',
        })
    }

    getSetting = () => {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/getSetting',
            payload: {},
        })
    }

    getTemplates = () => {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/getTemplates',
        })
    }

    queryGlobal = (page) => {
        if(typeof page === 'undefined') {
            page = this.props.community_group_management_autoReplyModal.globalCurrent
        }
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/queryGlobal',
            payload: {page: page},
        })
    }

    getTemplateDetail = (templateId, cb) => {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/getTemplateDetail',
            payload: {
                template_id: templateId,
            },
            callback: cb && cb(),
        })
    }

    handleOnOk = () => {
        const { onOk, community_group_management_autoReplyModal } = this.props
        const { status, reply_duration, need_at, need_ated_trigger, wx_setting_type, target_template_id, } = community_group_management_autoReplyModal

        if(typeof status === 'undefined') {
            message.warning('请先设置“启用”或“禁用”！')
            return false
        }

        if(wx_setting_type === 2 && typeof target_template_id === 'undefined') {
            message.warning('请选择模板！')
            return false
        }

        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/setSetting',
            payload: {
                body: {
                    status: status,
                    reply_duration: Number(reply_duration)*60,
                    need_at,
                    need_ated_trigger,
                    wx_setting_type,
                    template_id: wx_setting_type === 2 ? target_template_id : undefined,
                }
            },
            callback: () => {
                message.warning('设置成功！')
                this.props.onModalCancel()
                onOk && onOk()
            },
        })
    }

    handleChangeSize = (current, size) => {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/queryGlobal',
            payload: {
                page: 1,
                limit: size,
            },
        })
    }

    formatter = (value) => {
        return String(value).replace('.', '')
    }

    onInputNumberChange = (e) => {
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/setProperty',
            payload: {
                reply_duration: e,
            },
        })
    }

    onAtChange = (key, e) => {
        const val = e.target.value
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/setProperty',
            payload: {
                [key]: val
            },
        })
    }

    handleChange = (type, e) => {
        let val = ''
        if(type === 'wx_setting_type' || type === 'status') {
            val = e.target.value
        }else{
            val = e
        }
        this.props.dispatch({
            type: 'community_group_management_autoReplyModal/setProperty',
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

    // 获取“全局”/“自定义”/“模板”的内容
    getCont = (formItemLayout, globalColumns) => {
        const { queryGlobalLoading, getTemplateDetailLoading, } = this.props
        const {
            wx_setting_type, target_template_id, templates,
            globalKeywords, globalParams, globalTotal, globalCurrent,
            templateKeywords,
        } = this.props.community_group_management_autoReplyModal

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
        } else if(wx_setting_type === 2) { // 模板
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
            community_group_management_autoReplyModal,
            getSettingLoading,
            setSettingLoading,
            dispatch,
        } = this.props
        const {
            status,
            reply_categories,
            reply_duration,
            need_at,
            need_ated_trigger,
            wx_setting_type,
        } = community_group_management_autoReplyModal

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
                                                type: 'community_group_management_autoReplyModal/getReplyContents',
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

        return (
            <div className={styles.autoReplyModal}>

                <div className={styles.statusWrap}>
                    <div className={styles.statusWrapLeft}>自动回复设置</div>
                    <div className={styles.statusWrapRight}>
                        <RadioGroup
                            disabled={getSettingLoading || setSettingLoading}
                            onChange={(e) => this.handleChange('status', e)}
                            value={status}
                        >
                            <Radio value={1}>启用</Radio>
                            <Radio value={0}>禁用</Radio>
                        </RadioGroup>
                        <div>当前已选中<span className={styles.themeColor}>60</span>个群，自动过滤<span className={styles.redColor}>35</span>个已加入群活动，<span className={styles.redColor}>10</span>个未开启工作群，<span className={styles.redColor}>5</span>个退出群</div>
                    </div>
                </div>

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
                        <Radio value={2}>其他模板</Radio>
                    </RadioGroup>
                </div>
                <div className={styles.content}>
                    {
                        this.getCont(formItemLayout, globalColumns)
                    }
                </div>

            </div>
        )
    }
}
