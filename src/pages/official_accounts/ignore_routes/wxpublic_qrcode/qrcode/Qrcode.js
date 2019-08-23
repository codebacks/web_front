'use strict'

import React from 'react'
import { connect } from 'dva'
import { Button, Form, Input, Icon, message, Radio, Upload ,Modal} from 'antd'
import DocumentTitle from 'react-document-title'
import router from 'umi/router'
import Page from '../../../../../components/business/Page'
import TextAreaCount from '../../../../../components/TextAreaCount'
import InputFilter from '../../../../../components/InputFilter'
import { REPLY_TYPE } from '../../../services/wxpublic_qrcode'
import ModalActivty from './Modal'
import styles from './index.less'
const img_type = {
    1: require(`../../../assets/qrcode_type_1_view.png`),
    2: require(`../../../assets/qrcode_type_2_view.png`),
    3: require(`../../../assets/qrcode_type_3_view.png`)
}


const RadioGroup = Radio.Group
const formItemLayout = {
    labelCol: {
        span: 6,
        style: {
            width: '108px',
            textAlign: 'right',
        },
    },
    wrapperCol: {
        span: 18,
    }
}

@connect(({ base, wxpublic_qrcode }) => ({
    base,
    wxpublic_qrcode
}))
@Form.create()
export default class extends React.Component {
    state = {
        loading:false,
        type: '1',
        expired_type: '1',
        expired: '',
        visible: false,
        activity: null,
        errMessage: '',
        mp_name: '',
        fileList: []
    }
    componentDidMount() {
        this.props.dispatch({
            type: 'wxpublic_qrcode/getToken',
            payload: {
                type: 'image',
            }
        })

        const query = this.props.location.query
        if (query.id || query.showid) {
            this.props.dispatch({
                type: 'wxpublic_qrcode/qrcodeDetail',
                payload: {
                    id: query.id || query.showid
                }
            })
        }
        if (!query.id && !query.showid) {
            this.props.dispatch({
                type: 'wxpublic_qrcode/subData',
                payload: {},
                callback: (data) => {
                    if (data && data[0]) {
                        this.setState({
                            mp_name: data[0].name
                        })
                    }
                }
            })
        }
    }
    componentWillUnmount() {
        this.props.dispatch({
            type: 'wxpublic_qrcode/clearProperty'
        })
    }
    isLoad = false
    componentDidUpdate(prevProps, prevState) {
        let { detail } = this.props.wxpublic_qrcode
        let keys = Object.keys(detail)
        if (keys.length > 0 && !this.isLoad) {
            this.isLoad = true

            let state = {
                expired: detail.expired + '' !== '-1' ? detail.expired : '',
                mp_name: detail.mp_name,
                type: detail.type + ''
            }
            if (detail.img_url) {
                this.imgUrl = detail.img_url
                state.fileList = [{
                    uid: '-1',
                    name: detail.img_url,
                    status: 'done',
                    url: detail.img_url
                }]
            }
            if (detail.activity_id && detail.activity_name) {
                state.activity = {
                    id: detail.activity_id,
                    name: detail.activity_name,
                    end_at: detail.activity_expired_at
                }
            }
            this.props.form.setFieldsValue({
                name: detail.name,
                expired_type: detail.expired + '' !== '-1' ? '1' : '0',
                text: detail.text,
                type: detail.type + ''
            })
            this.setState(state, () => {
                if (detail.img_url && detail.type + '' === '2') {
                    setTimeout(_ => {
                        this.props.form.setFieldsValue({
                            img_url: state.fileList
                        })
                    }, 200)

                }
            })
        }

    }
    expiredOfValidator = (rule, value, callback) => {
        if (!this.state.expired && value === '1') {
            callback('请输入二维码有效时间')
        } else {
            callback()
        }
    }
    typeChange = (e) => {
        this.setState({
            type: e.target && e.target.value
        })

    }
    expiredChange = (e) => {
        let expired_type = e.target && e.target.value
        let state = { expired_type }
        if (expired_type === '0') state.expired = ''
        this.setState(state, () => {
            this.props.form.validateFields(['expired_type'], { force: true })
        })
    }
    inputChange = (value) => {
        if (Number(value) > 30 || Number(value) === 0) {
            this.setState({ expired: value.slice(0, value.length - 1) }, () => {
                this.props.form.validateFields(['expired_type'], { force: true })
            })
        } else {
            this.setState({ expired: value }, () => {
                this.props.form.validateFields(['expired_type'], { force: true })
            })
        }
    }
    showModal = (e) => {
        e.preventDefault()
        this.props.dispatch({
            type: 'wxpublic_qrcode/activityList',
            payload: {
                offset: 0,
                limit: 100,
                begin_at: '',
                end_at: '',
                status: '1',
                name: '',
                operator_id: ''
            }
        })
        this.setState({ visible: true })
    }
    onCancel = () => {
        this.setState({ visible: false })
    }
    onOk = (data) => {
        this.setState({
            activity: data
        })
        if (data) this.setState({ errMessage: '' })

    }
    imgUrl = ''
    getFile = (filesList) => {
        if (filesList && filesList[0]) {
            this.imgUrl = filesList[0].url
        } else {
            this.imgUrl = ''
        }
    }
    handleSubmit = () => {
        this.props.form.validateFields((err, values) => {
            if (values.type === '3' && !this.state.activity) {
                this.setState({ errMessage: '请选择回复活动' })
                return
            }else if(values.type === '2' && !this.imgUrl){
                this.props.form.setFields({
                    img_url: {
                        value: '',
                        errors: [new Error('请上传图片')],
                    }
                })
                return
            }
            if (!err) {
                const activity = this.state.activity || {}
                let payload = {
                    name: values.name,
                    type: values.type,
                    qrcode_type: '1',
                    text: values.type === '1' ? values.text : '',
                    img_url: values.type === '2' ? this.imgUrl : '',
                    activity_type: values.type === '3' ? 'pic' : '',
                    activity_id: values.type === '3' ? activity.id : '',
                    activity_name: values.type === '3' ? activity.name : '',
                    activity_expired_at: values.type === '3' ? activity.end_at : '',
                    expired: values.expired_type === '0' ? -1 : this.state.expired,
                    description: ''
                }
                const query = this.props.location.query
                let type = 'wxpublic_qrcode/postQrcode'
                if (query.id) {
                    payload.id = query.id
                    type = 'wxpublic_qrcode/putQrcode'
                }
                this.setState({
                    loading:true
                })
                this.props.dispatch({
                    type,
                    payload,
                    callback: respones => {
                        this.setState({
                            loading:false
                        })
                        if(respones.data){
                            message.success(query.id ? '编辑二维成功' : '新增二维码成功')
                            router.push('/official_accounts/wxpublic_qrcode')
                        }
                    }
                })
            }
        })
    }
    goBack = (e) => {
        e.preventDefault()
        // this.props.history && this.props.history.goBack()
        router.push('/official_accounts/wxpublic_qrcode')
    }

    render() {
        const { getFieldDecorator } = this.props.form
        const { type, expired_type, expired } = this.state
        const query = this.props.location.query
        return (
            <DocumentTitle title={query.id ? '编辑二维码' : '创建二维码'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '公众号推广',
                            path: '/official_accounts/wxpublic_qrcode'
                        }, {
                            name: query.id ? '编辑二维码' : '创建二维码'
                        }]}
                    />
                    <div className={styles.qrcode_content}>
                        <Form style={{ width: 614, float: 'left' }}>
                            <Form.Item label="公众号名称：" {...formItemLayout} style={{ marginBottom: 8, marginTop: 16 }}>
                                <span>{this.state.mp_name}</span>
                            </Form.Item>
                            <Form.Item label="二维码名称：" {...formItemLayout} >
                                {getFieldDecorator("name", {
                                    rules: [
                                        { required: true, message: '请填写二维码名称',transform:(data)=> data && data.trim() }
                                    ]
                                })(
                                    <Input placeholder='15个字以内' style={{ width: 240 }} maxLength={15} />
                                )}
                            </Form.Item>
                            <Form.Item label="二维码有效期：" {...formItemLayout}>
                                {getFieldDecorator("expired_type", {
                                    rules: [
                                        { required: true, message: '请填写二维码' },
                                        { validator: this.expiredOfValidator }
                                    ],
                                    initialValue: expired_type
                                })(
                                    <RadioGroup onChange={this.expiredChange}  disabled={!!this.props.location.query.id}>
                                        <Radio value='1'><InputFilter  onChange={this.inputChange} value={expired} disabled={expired_type !== '1' || !!this.props.location.query.id} placeholder='1~30' filter='int' style={{ width: 60, paddingRight: 0 }} maxLength={2} /> 天</Radio>
                                        <Radio value='0'>永久</Radio>
                                    </RadioGroup>
                                )}
                            </Form.Item>
                            <Form.Item label="回复类型：" {...formItemLayout}>
                                {getFieldDecorator("type", {
                                    rules: [
                                        { required: true, message: '请填写二维码' }
                                    ],
                                    initialValue: type
                                })(
                                    <RadioGroup onChange={this.typeChange} >
                                        {
                                            REPLY_TYPE.map((item, index) => <Radio key={index} value={item.value}>{item.text}</Radio>)
                                        }
                                    </RadioGroup>
                                )}
                            </Form.Item>
                            {
                                type === '1' ?
                                    <Form.Item label="回复文本：" {...formItemLayout}>
                                        {getFieldDecorator("text", {
                                            rules: [
                                                { required: true, message: '请填写回复文本' ,transform:(data)=> data && data.trim() }

                                            ]
                                        })(<TextAreaCount placeholder='600个字以内' onChange={this.textAreaChange} limitSize={600} rows={5} style={{ width: 354 }} />)
                                        }
                                    </Form.Item> :
                                    type === '2' ? <UploadContainer {...this.props} getFile={this.getFile} fileList={this.state.fileList} /> :
                                        type === '3' ?
                                            (<Form.Item label="回复活动：" {...formItemLayout} className={styles.form_item_required} >
                                                {this.state.activity ? <span >{this.state.activity.name} <a onClick={e => this.showModal(e)} style={{ paddingLeft: 2 }}> 修改</a></span> :
                                                    <Button onClick={e => this.showModal(e)}>选择晒图活动</Button>
                                                }
                                                <div className={styles.has_error}>{this.state.errMessage}</div>
                                            </Form.Item>) : null
                            }
                            <Form.Item label=" " colon={false} {...formItemLayout} >
                                <Button type='primary' onClick={e => { e.preventDefault(); this.handleSubmit() }} loading={this.state.loading} style={{ marginRight: 16 }} htmlType="submit">保存</Button>
                                <Button onClick={this.goBack}>取消</Button>
                            </Form.Item>
                        </Form>
                        <div className={styles.right_img}>
                            <section>
                                <img alt='' src={img_type[type]} />
                                <p>预览效果图</p>
                            </section>
                        </div>

                    </div>
                    <ModalActivty onOk={this.onOk} onCancel={this.onCancel} visible={this.state.visible} />
                </Page>

            </DocumentTitle>
        )
    }
}

class UploadContainer extends React.Component {
    state = {
        fileList: [],
        showUploadIcon: true,
        previewVisible: false,
        previewImage: ''
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.fileList && nextProps.fileList.length && !prevState.length) {
            return {
                fileList: nextProps.fileList,
                showUploadIcon: nextProps.fileList.length === 0
            }
        }
        return null
    }
    handleCancel = () => {
        this.setState({
            previewVisible: false,
            previewImage: ''
        })
    }
    setShowUploadIcon = (status) => {
        setTimeout(_ => {
            this.setState({
                showUploadIcon: status
            })
        }, 400)
    }
    handlePreview = (fileList) => {
        if (fileList && fileList[0]) {
            this.setState({
                previewVisible: true,
                previewImage: fileList[0].url
            })
        }

    }
    beforeUpload = (file, fileList) => {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJPG) {
            message.error('只能上传jpg、jpeg和png格式的图片！')
        }
        const isLt2M = file.size / 1024 / 1024 <= 2
        if (!isLt2M) {
            message.error('图片大小不能超过2MB！')
        }
        const maxPic = this.state.fileList.length + fileList.length <= 1
        if (!maxPic) {
            message.error('最多只能上传1张图片！')
        }

        return isJPG && isLt2M && maxPic
    }

    handleChange = (info) => {
        const { fileList } = info
        const photoPrefix = this.props.wxpublic_qrcode.photoPrefix

        if (info.file.status === 'uploading') {
            this.setState({ fileList }, () => {
                this.setShowUploadIcon(fileList.length === 0)
            })
        }

        if (info.file.status === 'done') {
            fileList.map((file) => {
                if (file.response) {
                    file.url = `https://${photoPrefix}/${file.response.key}`
                    file.key = file.response.key
                }
                return file
            })
            this.props.getFile && this.props.getFile(fileList)
            this.setState({ fileList }, () => {
                this.setShowUploadIcon(fileList.length === 0)
            })
        }
    }
    handleRemove = (file) => {
        const { fileList } = this.state
        for (let [i, v] of fileList.entries()) {
            if (v.uid === file.uid) {
                fileList.splice(i, 1)
                this.props.getFile && this.props.getFile(fileList)
                this.setState({ fileList, showUploadIcon: fileList.length === 0 }, () => {
                    this.props.form.validateFields(['images'], { force: true })
                })
                return
            }
        }
    }
    render() {
        const fileList = this.state.fileList
        const photoToken = this.props.wxpublic_qrcode.photoToken
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.jpeg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            listType: "picture-card",
            multiple: true,
            onPreview: () => this.handlePreview(fileList),
            beforeUpload: this.beforeUpload,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
            fileList: fileList,
            className: "avatar-uploader"
        }
        const { getFieldDecorator } = this.props.form
        return <Form.Item label="回复图片：" {...formItemLayout}
            extra={<div style={{fontSize:12}}>最多上传1张，图片大小请控制在2MB以内，支持png、jpeg、jpg格式</div>}
        >
            {getFieldDecorator("img_url", {
                rules: [
                    { required: true, message: '请上传图片' }
                ]
            })(
                <Upload {...uploadProps}>
                    {
                        this.state.showUploadIcon ? <div>
                            <Icon type='plus' style={{ fontSize: 32, color: '#9EA8B1' }} />
                            <div className="ant-upload-text">上传图片</div>
                        </div> : null
                    }

                </Upload>
            )}
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
        </Form.Item>
    }
}

