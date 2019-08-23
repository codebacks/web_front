import React, {Fragment} from 'react'
import {Form, Button, Icon, Select, Input, Radio, DatePicker, Modal, message, notification} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import _ from 'lodash'
import documentTitleDecorator from 'hoc/documentTitle'
import Header from 'crm/components/Header'
import COSUpload from 'components/business/COSUpload'
import config from 'crm/common/config'
import commonStyles from '../common.scss'
import styles from './index.scss'

import Editor from 'components/Face/components/Editor'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const confirm = Modal.confirm

const {DateTimeFormat} = config

@connect(({base, crm_mass_msg_group, crm_mass_msg_record, loading}) => ({
    base,
    crm_mass_msg_group,
    crm_mass_msg_record,
    createLoading: loading.effects['crm_mass_msg_record/create'],
}))
@documentTitleDecorator(
    {
        title: '新建群发'
    }
)
export default class CreatePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    componentDidMount() {
        const query = this.props.location.query
        if (!query.id) {
            router.push('/crm/mass_msg')
        }else {
            const id = query.id
            this.loadGroupDetail(id)
        }
    }

    componentWillUnmount() {
        // resetParams
    }

    getInitialState = () => {
        return {
            num: 0,
            body: {
                executeType: 1, // 执行时间类型
                messages: [
                    this.getInitialMessage()
                ],
            },
            delay: 30, // 延迟分钟数
            content: '',
            submit: false,
            messageError: '',
            executeTimeError: '',
            fileList: {},
            loading: {},
            editorError: {},
            previewImage: '',
            previewVisible: false,
        }
    }

    getInitialMessage = () => {
        return {
            type: 1, // 类型，1文本3图片
            content: '',
        }
    }

    loadGroupDetail = (id) => {
        this.props.dispatch({
            type: 'crm_mass_msg_group/groupDetail',
            payload: {
                id: id
            },
            callback: (data) => {
                this.setState({
                    num: data.num
                })
            }
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
            if (key === 'title') {
                val = val.trim()
            }
        } else {
            val = e
        }
        let body = {...this.state.body}
        body[key] = val
        this.setState({
            body: body
        })
    }

    handleTimeChange = (key, e) => {
        let body = {...this.state.body}
        body[key] = e
        if (key === 'execute_time') {
            this.checkExecuteTime(e)
        }
        this.setState({
            body: body
        })
    }

    checkExecuteTime = (val) => {
        let {body, delay} = this.state
        if(body.executeType === 1){
            if (!val) {
                this.setState({
                    executeTimeError: '请选择执行时间'
                })
                return false
            } else if (val.isBefore(moment().add(delay, 'minutes'))) {
                this.setState({
                    executeTimeError: `需大于当前时间+${delay}分钟`
                })
                return false
            } else {
                this.setState({
                    executeTimeError: ''
                })
                return true
            }
        }else {
            this.setState({
                executeTimeError: ''
            })
            return true
        }
    }

    handleAddMessage = () => {
        let body = {...this.state.body}
        let messages = [...body.messages]
        if (messages.length < 10) {
            messages.push(this.getInitialMessage())
            body.messages = messages
            this.setState({
                body: body
            })
        } else {
            message.warning('一次最多可发送10条消息')
        }
    }

    handleDeleteMessage = (index) => {
        let body = {...this.state.body}
        let messages = _.cloneDeep(body.messages)
        messages.splice(index, 1)
        body.messages = messages
        this.setState({
            body: body
        })
        this.handleRemoveUpload({}, index)
    }

    handleChangeContentType = (e, index) => {
        let fileList = {...this.state.fileList}
        const type = e.target.value
        let body = {...this.state.body}
        let messages = _.cloneDeep(body.messages)
        if (type !== messages[index].type) {
            messages[index].type = type
            messages[index].content = ''
        }
        if (type === 1 && fileList[index]) {
            delete fileList[index]
            this.setState({
                fileList: fileList
            })
        }
        body.messages = messages
        this.setState({
            body: body
        })
    }

    handleUploadChange = (info, index) => {
        const status = info.file.status
        let fileList = {...this.state.fileList}
        let loading = {...this.state.loading}
        if (status === 'uploading') {
            loading[index] = true
        } else if (status === 'done') {
            loading[index] = false
            let url = info.file.response.url.split('//')
            fileList[index] = url[1].substring(url[1].indexOf('/'))
            this.setState({
                fileList: fileList
            },()=>{
                this.checkMessages()
            })
        } else {
            loading[index] = false
        }
        this.setState({
            loading: loading
        })
    }

    handleRemoveUpload = (info, index) => {
        let fileList = _.cloneDeep(this.state.fileList)
        delete fileList[index]
        this.setState({
            fileList: fileList
        })
        this.checkMessages()
    }

    handleShowPreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        })
    };

    handleCancelPreview = () => {
        this.setState({
            previewImage: '',
            previewVisible: false
        })
    }

    handleContentChange = (type, e, index) => {
        let body = {...this.state.body}
        let messages = _.cloneDeep(this.state.body.messages)
        messages[index] = {
            type: type,
            content: e
        }
        body.messages = messages
        this.setState({
            body: body
        }, () => {
            this.checkEditor(e, index)
            this.checkMessages()
        })
    }

    checkEditor = (value, index) => {
        let editorError = _.cloneDeep(this.state.editorError)
        if (value && this.removeTag(value)) {
            if (this.isOverEditorLimit(value)) {
                editorError[index] = '字数不超过600字'
            } else {
                if (editorError[index]) {
                    delete editorError[index]
                }
            }
        } else {
            if (editorError[index]) {
                delete editorError[index]
            }
        }
        this.setState({
            editorError: editorError
        })
    }

    isOverEditorLimit = (value) => {
        return Editor.htmlToMsg(value).length > 600
    }

    handleExecuteTypeChange = (e) => {
        let type = e.target.value
        let body = {...this.state.body}
        let {executeTimeError} = this.state
        body['executeType'] = type
        if (type === 0 && body['execute_time']) {
            body['execute_time'] = ''
            executeTimeError = ''
        }
        this.setState({
            body: body,
            executeTimeError: executeTimeError
        })
    }

    disabledDate = (current) => {
        return current && current <= moment().startOf('day')
    };

    showConfirm = () => {
        const messages = this.filterMessages()
        if (messages.length) {
            confirm({
                title: '编辑的内容尚未提交，确定取消？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    this.handleReset(() => {
                        this.redirect()
                    })
                },
                onCancel: () => {
                },
            })
        } else {
            this.handleReset(() => {
                this.redirect()
            })
        }
    }

    handleSave = () => {
        if (this.props.createLoading) {
            return
        }
        const {submit, body} = this.state
        if (!submit) {
            this.setState({
                submit: true,
            })
        }
        if (this.checkSubmit()) {
            const {dispatch} = this.props
            const params = this.setParams(body)
            dispatch({
                type: 'crm_mass_msg_record/create',
                payload: {
                    body: params,
                },
                callback: () => {
                    this.handleReset(()=>{
                        this.redirect(2)
                    })
                },
            })
        }
    }

    setParams = (values) => {
        const body = {}
        body['group_id'] = this.props.location.query.id
        body['title'] = values['title'].trim()
        if (values['executeType'] === 1) {
            body['execute_now'] = false
            body['execute_time'] = values['execute_time'].format(DateTimeFormat)
        } else {
            body['execute_now'] = true
            body['execute_time'] = ''
        }
        body['messages'] = this.filterMessages()
        return body
    };

    checkSubmit = () => {
        let correct = true
        const {body, editorError} = this.state
        if (!body.title) {
            correct = false
        }
        if (Object.keys(editorError).length) {
            correct = false
        }
        if (!this.checkMessages()) {
            correct = false
        }
        if (body.executeType === 1 && !this.checkExecuteTime(body['execute_time'])) {
            correct = false
        }
        return correct
    }

    checkMessages = () => {
        const messages = this.filterMessages()
        if (messages.length) {
            this.setState({
                messageError: ''
            })
            return true
        } else {
            this.setState({
                messageError: '请填充消息内容'
            })
            return false
        }
    }

    // 过滤为空的消息
    filterMessages = () => {
        let messages = _.cloneDeep(this.state.body.messages)
        let fileList = this.state.fileList
        messages = messages.filter((item, index) => {
            if(item.type === 1){
                return item.content && this.removeTag(item.content)
            }else if(item.type === 3) {
                return fileList[index]
            }
        }).map((item, index) => {
            if (item.type === 1) {
                return {
                    type: item.type,
                    content: Editor.htmlToMsg(item.content)
                }
            } else if (item.type === 3) {
                return {
                    type: item.type,
                    content: fileList[index]
                }
            }
        })
        return messages
    }

    removeTag = (t) => {
        if (t) {
            t = t.replace(/<(?!img).*?>/g, '')
        }
        return t
    }

    handleReset = (callback) => {
        this.setState(this.getInitialState())
        callback && callback()
    };

    redirect = (type) => {
        router.push(`/crm/mass_msg?type=${type || 1}`)
    }

    uploadProps = (index) => {
        return {
            accept: 'image/jpeg,image/jpg,image/png,image/gif',
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    const typeOk = file.type === 'image/jpeg'
                        || file.type === 'image/jpg'
                        || file.type === 'image/png'
                        || file.type === 'image/gif'
                    if (!typeOk) {
                        notification.error({
                            message: '图片格式错误',
                            description: '仅能上传jpg/jpeg/png/gif格式图片',
                        })
                        reject(file)
                    }
                    const sizeOk = file.size <= 1024 * 1024 * 2 // 图片大小限制2M以内
                    if (!sizeOk) {
                        notification.error({
                            message: '图片大小超出限制',
                            description: '图片大小不能超过2M',
                        })
                        reject(file)
                    }
                    resolve(file)
                });

            },
            onChange: (info) => {
                this.handleUploadChange(info, index)
            },
            onPreview: this.handleShowPreview,
            onRemove: (info) => {
                this.handleRemoveUpload(info, index)
            },
            listType: "picture-card",
        }
    }


    render() {
        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '100px'
                }
            },
            wrapperCol: {span: 10},
        }

        const {
            num,
            submit,
            body,
            fileList,
            loading,
            editorError,
            messageError,
            executeTimeError,
            previewVisible,
            previewImage,
        } = this.state

        const query = this.props.location.query

        const uploadButton = (
            <div>
                <Icon type='plus'/>
                <div className="ant-upload-text">点击上传</div>
            </div>
        )

        return query ? <div className={styles.createWrap} id="createMassMsg">
                <Header
                    breadcrumbData={
                        [
                            {
                                name: '客户群发',
                                path: '/crm/mass_msg?type=1'
                            },
                            {
                                name: '新建群发',
                            },
                        ]
                    }
                />
                <div className={styles.create}>
                    <Form>
                        <h3 className={styles.title}>群发客户</h3>
                        <FormItem
                            {...formItemLayout}
                            label="选择客户组"
                            required={true}
                        >
                            <Select defaultValue="" disabled>
                                <Option value="">{query.name}</Option>
                            </Select>
                            <p className={styles.tip}>总群发客户数：{num}人</p>
                        </FormItem>
                        <h3 className={styles.title}>群发内容</h3>
                        <FormItem
                            {...formItemLayout}
                            label="群发主题"
                            required={true}
                        >
                            <Input placeholder="请输入主题，20字以内"
                                maxLength={20}
                                value={body['title']}
                                onChange={(e) => {
                                    this.handleChange('title', e)
                                }}
                            />
                            {submit && !body['title'] ?
                                <p className={commonStyles.errMsg}>请输入主题</p> : ''}
                        </FormItem>
                        {
                            body.messages.map((item, index) => {
                                return <div className={styles.editors} key={index}>
                                    {index === 0 ?
                                        <span className={styles.operate} onClick={this.handleAddMessage}>添加消息</span>
                                        : <span className={styles.operate} onClick={() => {
                                            this.handleDeleteMessage(index)
                                        }}>删除</span>
                                    }
                                    <FormItem
                                        {...formItemLayout}
                                        label={`消息内容${index + 1}`}
                                        required={true}
                                    >
                                        <RadioGroup onChange={(e) => {
                                            this.handleChangeContentType(e, index)
                                        }} value={item.type}>
                                            <Radio value={1}>文本</Radio>
                                            <Radio value={3}>图片</Radio>
                                        </RadioGroup>
                                        {item.type === 1
                                            ? (
                                                <Fragment>
                                                    <Editor
                                                        className={styles.editor}
                                                        placeholder="限制600字"
                                                        onChange={(e) => {
                                                            this.handleContentChange(1, e, index)
                                                        }}
                                                        value={item.content}
                                                        extend={<span/>}
                                                        disableKeyDown={true}
                                                    />
                                                    {submit && editorError[index] ?
                                                        <p className={commonStyles.errMsg}>{editorError[index]}</p> : ''}
                                                </Fragment>
                                            )
                                            : ''}
                                        {item.type === 3
                                            ? (
                                                <Fragment>
                                                    <COSUpload uploadProps={this.uploadProps(index)}>
                                                        {fileList[index] || loading[index] ? null : uploadButton}
                                                    </COSUpload>
                                                    <p className={styles.tip}>支持jpg、jpeg、png、gif格式，图片大小不超过2MB</p>
                                                    <p className={styles.smallTip}>(上传图片时，如出现浏览器卡死的情况，请尝试关闭输入法)</p>
                                                </Fragment>
                                            ) : ''
                                        }
                                    </FormItem>
                                    {index > 0 && index === body.messages.length - 1 ?
                                        <FormItem {...formItemLayout} label=" " colon={false}>
                                            <p className={styles.tip}>发送多条消息时，每条执行间隔3~10秒</p>
                                        </FormItem> : ''}
                                </div>
                            })
                        }
                        {submit && messageError ?
                            <p className={commonStyles.errMsg} style={{marginLeft: '100px'}}>{messageError}</p> : ''}
                        <FormItem
                            {...formItemLayout}
                            label="执行时间"
                            required={true}
                            className={styles.timeFormItem}
                        >
                            <RadioGroup defaultValue={body['executeType']}
                                onChange={this.handleExecuteTypeChange}>
                                <Radio value={0}>立即执行</Radio>
                                <Radio value={1}>定时执行</Radio>
                            </RadioGroup>
                            {body['executeType'] === 1 ? <DatePicker
                                showTime
                                format={DateTimeFormat}
                                disabledDate={this.disabledDate}
                                style={{width: 200}}
                                onChange={(e) => {
                                    this.handleTimeChange('execute_time', e)
                                }}
                            /> : ''}
                            { body['executeType'] === 1 && executeTimeError ?
                                <p className={commonStyles.errMsg}>{executeTimeError}</p> : ''}
                        </FormItem>
                        <FormItem {...formItemLayout} label=" " colon={false} className={styles.btnWrap}>
                            <Button type="primary" onClick={this.handleSave}
                                disabled={this.props.createLoading}>确定</Button>
                            <Button onClick={this.showConfirm}>取消</Button>
                        </FormItem>
                    </Form>
                </div>
                <Modal visible={previewVisible}
                    footer={null}
                    onCancel={this.handleCancelPreview}
                    getContainer={() => document.getElementById('createMassMsg')}
                >
                    <img style={{width: '100%'}} src={previewImage} alt="image"/>
                </Modal>
            </div> : ''
    }
}
