/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/29
*/

import React from 'react'
import { Input, Row, Col, Form, message, Radio, Table, Button, } from 'antd'
import toggleModalWarp from 'hoc/toggleModalWarp'
import PropTypes from "prop-types"
import { hot } from 'react-hot-loader'
import _ from "lodash"
import {getTabName, MsgContent} from 'business/FullTypeMessage/index'
import AddKeywordReply from 'community/components/AddKeywordReply'
import styles from './index.less'

const FormItem = Form.Item
const RadioGroup = Radio.Group

@hot(module)
@toggleModalWarp({
    width: 1000,
    destroyOnClose: true,
    maskClosable: false,
})
@Form.create()

export default class AddKeyword extends React.Component {
    static propTypes = {
        type: PropTypes.string, // add or edit
        record: PropTypes.object, // 编辑的时候，传record
        onOk: PropTypes.func,
    }

    static defaultProps = {
        type: 'add',
        record: {},
        onOk: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {
            knowledge_base_category_item_id: undefined, // 知识库的问题id（新增/编辑，维护该id，获取回复内容列表）
        }
        props.setModalOkFn(this.handleOk)
    }

    componentDidMount() {
        const { type, record } = this.props
        const id = record?.knowledge_base_category_item_id
        if(type === 'edit') { // 如果是编辑关键字，设置问题id，并fetch回复列表
            this.setState({
                knowledge_base_category_item_id: id
            })
            this.props.dispatch({
                type: 'community_groupSetting_autoReply/getReplyContents',
                payload: {
                    isSetProperty: true,
                    id: id,
                },
            })
        }
    }

    componentWillUnmount() {
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/setProperty',
            payload: {replyObj: null},
        })
    }

    handleOk = () => {
        // content, match_type为表单验证得到值，在values对象中；knowledge_base_category_item_id在state中单独维护
        const { knowledge_base_category_item_id } = this.state
        const { type, record, onOk, } = this.props
        const { replyObj } = this.props.community_groupSetting_autoReply
        this.props.form.validateFields({force: true}, (err, values)=> {
            if(!err) {
                if(!knowledge_base_category_item_id) {
                    message.warning('请选择回复内容！')
                }else if(type === 'edit' && knowledge_base_category_item_id === record?.knowledge_base_category_item_id
                && values.content === record?.content && values.match_type === record?.match_type) { // 未修改内容的情况
                    this.props.onModalCancel()
                }else{
                    values.knowledge_base_category_item_id = knowledge_base_category_item_id
                    values.reply_msg_count = replyObj?.reply_msg_count
                    onOk && onOk(type, record, values)
                    this.props.onModalCancel()
                }
            }
        })
    }

    typeCheck = (rule, value, callback) => {
        callback()
        this.props.form.validateFields(['content'], {force: true})
    }

    checkInput = (rule, value, callback) => {
        const { getFieldValue } = this.props.form
        let text = '中文、英文、数字、1-30'
        let re = /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D]{1,30}$/
        if(getFieldValue('match_type') === 1) {
            re = /^[a-zA-Z0-9\u4E00-\u9FA5\uF900-\uFA2D\s]{1,30}$/
            text = '中文、英文、数字、空格、1-30'
        }
        if(value) {
            value = value.trim()
        }
        if(!re.test(value)) {
            callback(text) // callback()用于红色字提醒
        }else {
            callback()
        }
    }

    handleAddKeywordReplyOk = (selectedRows) => { // 接收设置回复内容的回调：selectedRows数组长度为1
        // 设置问题id，并fetch回复列表
        const id = selectedRows[0]?.id
        this.setState({
            knowledge_base_category_item_id: id
        })
        this.props.dispatch({
            type: 'community_groupSetting_autoReply/getReplyContents',
            payload: {
                isSetProperty: true,
                id: id
            },
        })
    }

    render() {

        const { knowledge_base_category_item_id } = this.state
        const { form, record, type, } = this.props
        const { replyObj } = this.props.community_groupSetting_autoReply
        const { getFieldValue, getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        }

        const keywordText = getFieldValue('match_type') === 1 ? (
            <div>多个关键内容请使用<span className={styles.extrude}>空格</span>分开</div>
        ) : '请勿输入标点符号'
        const matchTypeText = getFieldValue('match_type') === 1 ? (
            <div>
                <div>
                    此规则下好友发送的消息<span className={styles.extrude}>包含</span>关键内容即可触发自动回复；
                </div>
                <div>
                    在一个关键内容中设置多个关键词则需包含多个关键词；
                </div>
                <div>
                    例：设置关键内容：你好 订单；那么客户发送：你好吖，我的订单是XXX。会自动回复；客户发送：你好，不会自动回复
                </div>
            </div>
        ) : (
            <div>
                <div>
                    此规则下好友发送的消息需与关键内容<span className={styles.extrude}>完全一致</span>才可触发回复内容
                </div>
                <div>
                    例：设置关键内容：你好；客户发送：你好，会自动回复；客户发送：你好啊，不会自动回复
                </div>
            </div>
        )

        const columns = [
            {
                title: '回复类型',
                dataIndex: 'type',
                className: styles.typeColumns,
                render: (text, record, index) => {
                    return getTabName(_.get(record, 'common_msg_content.type'))

                },
            },
            {
                title: '内容',
                dataIndex: 'content',
                className: styles.contentColumns,
                render: (text, record, index) => {
                    return (
                        <MsgContent
                            type={_.get(record, 'common_msg_content.type')}
                            values={_.get(record, 'common_msg_content.values')}
                        />
                    )
                },
            },
        ]

        return (
            <Form className={styles.addKeywordForm}>
                <FormItem
                    {...formItemLayout}
                    label={'关键词'}
                    extra={keywordText}
                >
                    {
                        getFieldDecorator('content', {
                            initialValue: record.content,
                            validate: [
                                {
                                    trigger: 'onChange',
                                    rules: [
                                        {required: true, message: '必填'},
                                        {validator: this.checkInput}
                                    ]
                                }

                            ]
                        })(
                            <Input
                                placeholder=" 输入关键词，30字以内"
                                maxLength={30}
                            />
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={'匹配规则'}
                    extra={matchTypeText}
                >
                    {
                        getFieldDecorator('match_type', {
                            initialValue: record.match_type,
                            rules: [
                                {required: true, message: '必填'},
                                {validator: this.typeCheck},
                            ]
                        })(
                            <RadioGroup>
                                <Radio value={0}>完全匹配</Radio>
                                <Radio value={1}>包含匹配</Radio>
                            </RadioGroup>,
                        )
                    }
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={<><span className={styles.require}>* </span>回复内容</>}
                >
                    <AddKeywordReply
                        renderBtn={(setTrue) => <Button onClick={setTrue}>{ knowledge_base_category_item_id ? '更换回复内容': '新增回复内容'}</Button>}
                        onOk={this.handleAddKeywordReplyOk}
                    />

                </FormItem>
                <Row>
                    <Col offset={4}>
                        <div className={styles.tableWrap}>
                            <Table
                                columns={columns}
                                dataSource={replyObj?.reply_contents}
                                size="middle"
                                scroll={{y: 300}}
                                rowKey={(record, index) => index}
                                pagination={false}
                                onChange={this.handleTableChange}
                            />
                        </div>
                    </Col>
                </Row>
            </Form>
        )
    }
}
