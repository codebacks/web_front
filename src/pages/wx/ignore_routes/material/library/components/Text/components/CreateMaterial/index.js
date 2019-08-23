import React, {Component} from 'react'
import {connect} from "dva/index"
import {Modal, message, Form, Input, Tag, Button} from 'antd'
import Editor from 'components/Face/components/Editor'
import config from 'wx/common/config'
import {textMaxLength, tagMaxLength} from '../../../../config'
import styles from './index.scss'

const FormItem = Form.Item

const {materialType} = config

@connect(({loading}) => ({
    createLoading: loading.effects['wx_material_library/createText'],
}))
export default class CreateMaterial extends Component {
    constructor(props) {
        super(props)
        this.state = {
            content: '',
            value: '',
            tags: [],
            contentError: ''
        }
    }

    componentDidMount() {}

    handleChange = (key, e) => {
        let value = ''
        if (e && e.target) {
            value = e.target.value
        } else {
            value = e
        }
        if (key === 'content') {
            this.checkEditor(value)
            this.setState({
                content: value
            })
        } else if (key === 'tag') {
            value = value.trim()
            this.setState({
                value: value
            })
        }
    }

    checkEditor = (value) => {
        value = value || ''
        let contentError = ''
        let len = Editor.computeMsgLength(value)
        if (!value || !len) {
            contentError = '请输入文字内容'
        } else if (this.isOverEditorLimit(value)) {
            contentError = `字数不超过${textMaxLength}字`
        }
        this.setState({
            contentError: contentError
        })
    }

    isOverEditorLimit = (value) => {
        return Editor.computeMsgLength(value) > textMaxLength
    }

    checkSubmit = () => {
        const {content, contentError} = this.state
        let correct = true
        const msgLen = Editor.computeMsgLength(content)
        if (!msgLen) {
            correct = false
            this.checkEditor()
        } else if (contentError) {
            correct = false
        }
        return correct
    }

    handleAddTag = (value) => {
        if(!value) {
            return
        }
        const tags = [...this.state.tags]
        const has = tags.find((v) => {
            return v === value
        })
        if (has) {
            message.warning('标签已存在')
            return
        }
        tags.push(value)
        this.setState({
            value: '',
            tags: tags,
        })
    }

    removeTag = (tag) => {
        const currentTags = this.state.tags.filter((v) => {
            return v !== tag
        })
        this.setState({
            tags: currentTags
        })
    }

    handleOk = () => {
        if(this.checkSubmit()) {
            const {category} = this.props
            const {content, tags} = this.state
            const payload = {
                body: {
                    type: materialType.text.type,
                    desc: Editor.htmlToMsg(content),
                    tags: tags,
                    category_id: category ? parseInt(category, 10) : 0
                }
            }
            this.createTextMaterial(payload)
        }
    }

    createTextMaterial = (payload) => {
        this.props.dispatch({
            type: 'wx_material_library/createText',
            payload: payload,
            callback: () => {
                message.success('创建成功')
                this.props.onOk()
            }
        })
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    render() {
        const {visible, createLoading} = this.props
        const {value, tags, contentError} = this.state

        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 16},
        }

        return  (
            <Modal
                centered
                title="添加文本素材"
                width={720}
                visible = {visible}
                className={styles.wrapper}
                destroyOnClose={true}
                maskClosable={false}
                onOk={this.handleOk}
                okButtonProps={{ disabled: createLoading }}
                confirmLoading={createLoading}
                onCancel={this.handleCancel}
            >

                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="内容："
                        required={true}
                    >
                        <div className={styles.editorWrap}>
                            <Editor
                                placeholder={`限制${textMaxLength}个字`}
                                onChange={(e)=>{this.handleChange('content', e)}}
                                extend={<span/>}
                                disableKeyDown={true}
                                className={styles.editor}
                            />
                        </div>
                        { contentError ? <p className={styles.errorMsg}>{contentError}</p> : null}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="标签："
                    >
                        <div className={styles.inputItem}>
                            <Input placeholder={`输入限制${tagMaxLength}个字`}
                                className={styles.input}
                                value={value}
                                maxLength={tagMaxLength}
                                onChange={(e)=>{this.handleChange('tag', e)}}
                                onPressEnter={()=>{this.handleAddTag(value)}}
                            />
                            <Button className={styles.add}
                                onClick={()=>{this.handleAddTag(value)}}
                            >添加标签</Button>
                        </div>
                        <p className={styles.tip}>若无此标签，将创建一个</p>
                        <div className={styles.tagsWrap}>
                            <div className={styles.tags}>
                                {
                                    tags.map((tag)=>{
                                        return <Tag key={tag}
                                            closable={true}
                                            color="blue"
                                            className={styles.tag}
                                            onClose={()=>{this.removeTag(tag)}}
                                        >{tag}</Tag>
                                    })
                                }
                            </div>
                        </div>
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}

