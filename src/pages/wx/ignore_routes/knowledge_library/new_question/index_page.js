import React from 'react'
import { Row, Col, Divider, Button, Form, Input, Icon, message, Table, Modal, } from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import router from "umi/router"
import ContentHeader from 'business/ContentHeader'
import FullTypeMessageModal from 'business/FullTypeMessageModal'
import {getTabName, MsgContent} from 'business/FullTypeMessage'

const FormItem = Form.Item
const TextArea = Input.TextArea
const ModalConfirm = Modal.confirm

@connect(({wx_newQuestion, loading}) => ({
    wx_newQuestion,
    addQuestionLoading: loading.effects['wx_newQuestion/categoryUpdate'],
}))
@documentTitleDecorator({
    title: '新建规则',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_newQuestion/resetState',
        })
    }

    handleAddReplyOk = ({data, handleCancel}) => {
        const formData = {common_msg_content: data,}
        this.props.dispatch({
            type: 'wx_newQuestion/addReply',
            payload: formData,
        })
        message.success('创建成功！')
        handleCancel()
    }

    move = (record, preIndex, nextIndex) => {
        const {
            reply_contents: list,
        } = this.props.wx_newQuestion
        let ord = 0
        if(nextIndex === 0) {
            ord = list[nextIndex].ord - 1
        }else if(preIndex === (list.length - 1)) {
            ord = list[preIndex].ord + 1
        }else {
            ord = (list[preIndex].ord + list[nextIndex].ord) / 2
        }

        this.props.dispatch({
            type: 'wx_newQuestion/editReply',
            payload: {id: record.id, ord},
        })
        message.success('移动成功')
    }

    handleRemove = (record) => {
        ModalConfirm({
            title: '确定删除该内容？',
            okText: '删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: () => {
                this.props.dispatch({
                    type: 'wx_newQuestion/deleteReply',
                    payload: {id: record.id},
                })
                message.success('删除成功')
            },
            onCancel() {
            },
        })
    }

    handleChange = (key, e) => {
        let val = e.target.value
        this.props.dispatch({
            type: 'wx_newQuestion/setStateByPath',
            payload: {
                path: key,
                value: val,
            },
        })
    }

    cancel = () => {
        this.props.dispatch({
            type: 'wx_newQuestion/resetState',
        })
        router.push('/wx/knowledge_library')
    }

    ok = () => {
        const { des, comment, reply_contents } = this.props.wx_newQuestion
        if(!des || !des.trim()) {
            message.warning('请添加问题描述')
            return
        }
        if(!reply_contents.length) {
            message.warning('请添加回复内容')
            return
        }
        this.props.dispatch({
            type: 'wx_newQuestion/addQuestion',
            payload: {
                id: this.props.location.query?.treeId
            },
            callback: () => {
                this.cancel()
            },
        })
    }

    render() {
        const {
            addQuestionLoading,
            wx_newQuestion,
            dispatch,
        } = this.props
        const { reply_contents: list, des, comment, } = wx_newQuestion
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        const columns = [
            {
                title: '回复类型',
                dataIndex: 'type',
                width: 100,
                render: (text, record, index) => {
                    return getTabName(_.get(record, 'common_msg_content.type'))

                },
            },
            {
                title: '内容',
                dataIndex: 'content',
                className: styles.contentColumn,
                render: (text, record, index) => {
                    return (
                        <MsgContent
                            type={_.get(record, 'common_msg_content.type')}
                            values={_.get(record, 'common_msg_content.values')}
                        />
                    )
                },
            },
            {
                title: '操作',
                key: 'operator',
                width: 180,
                render: (text, record, index) => {
                    return (
                        <div className={styles.operator}>
                            <FullTypeMessageModal
                                tabsActiveKey={record.common_msg_content.type}
                                typeValue={{
                                    type: record.common_msg_content.type,
                                    values: record.common_msg_content.values,
                                }}
                                typeSourceType={{
                                    type: record.common_msg_content.type,
                                    sourceType: record.common_msg_content.source_type,
                                }}
                                handleOk={({data, handleCancel}) => {
                                    console.log('edit:', data, handleCancel)
                                    const formData = {
                                        common_msg_content: data,
                                        id: record.id,
                                    }
                                    this.props.dispatch({
                                        type: 'wx_newQuestion/editReply',
                                        payload: formData,
                                    })
                                    message.success('更新成功！')
                                    handleCancel()
                                }}
                                renderBtn={(setTrue) => {
                                    return (
                                        <span
                                            className={styles.canEdit}
                                            onClick={setTrue}
                                        >
                                            编辑
                                        </span>
                                    )
                                }}
                                modalOption={{
                                    title: '编辑回复',
                                }}
                            />
                            <Divider type="vertical"/>
                            <span
                                className={styles.canEdit}
                                onClick={() => {
                                    this.handleRemove(record)
                                }}
                            >
                                删除
                            </span>
                            {
                                index !== 0 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.canEdit}
                                            onClick={() => {
                                                this.move(record, index - 2, index - 1)
                                            }}
                                        >
                                            上移
                                        </span>
                                    </>
                                )
                            }
                            {
                                index !== list.length - 1 && (
                                    <>
                                        <Divider type="vertical"/>
                                        <span
                                            className={styles.canEdit}
                                            onClick={() => {
                                                this.move(record, index + 1, index + 2)
                                            }}
                                        >
                                            下移
                                        </span>
                                    </>
                                )
                            }
                        </div>
                    )
                },
            },
        ]

        return (
            <div className={styles.newQuestion}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '知识库',
                                path: '/wx/knowledge_library',
                            },
                            {
                                name: '新建规则',
                            },
                        ]
                    }
                />
                <div className={styles.contents}>
                    <Row type='flex' align='middle'>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label={<><span className={styles.required}>*</span>问题描述：</>} colon={false}>
                                <Input
                                    placeholder="请输入问题描述，50字以内"
                                    value={des}
                                    onChange={(e) => {this.handleChange('des', e)}}
                                    maxLength={50}
                                />

                            </FormItem>
                        </Col>
                        <span className={styles.formItemRemind}>例如：商品咨询</span>
                    </Row>
                    <Row>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label='备注：' colon={false}>
                                <TextArea
                                    placeholder="请输入问题描述，200字以内"
                                    value={comment}
                                    onChange={(e) => {this.handleChange('comment', e)}}
                                    maxLength={200}
                                    rows={4}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row type='flex' align='middle'>
                        <Col span={12}>
                            <FormItem {...formItemLayout} label={<><span className={styles.required}>*</span>回复内容：</>} colon={false}>
                                <FullTypeMessageModal
                                    handleOk={this.handleAddReplyOk}
                                    renderBtn={(setTrue) => {
                                        return (
                                            <Button
                                                type="primary"
                                                loading={addQuestionLoading}
                                                onClick={() => {
                                                    if(list.length >= 10) {
                                                        message.warning('请勿设置超过10条的回复')
                                                        return
                                                    }
                                                    setTrue()
                                                }}
                                                icon="plus"
                                            >
                                                添加回复
                                            </Button>
                                        )
                                    }}
                                    modalOption={{title: '新建回复'}}
                                />
                                <span className={styles.formItemRemind}>• 建议回复内容不要创建过多，以1~3条为佳</span>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={3}></Col>
                        <Col span={14}>
                            <div className={styles.table}>
                                <Table
                                    columns={columns}
                                    dataSource={list}
                                    rowKey={(record) => {
                                        return record.id
                                    }}
                                    loading={addQuestionLoading}
                                    pagination={false}
                                />
                            </div>
                        </Col>
                    </Row>

                    <div className={styles.btnBar}>
                        <Button
                            loading={this.props.addQuestionLoading}
                            type="primary"
                            className={styles.btn}
                            onClick={this.ok}
                        >确定</Button>
                        <Button
                            loading={this.props.addQuestionLoading}
                            onClick={this.cancel}
                        >取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}
