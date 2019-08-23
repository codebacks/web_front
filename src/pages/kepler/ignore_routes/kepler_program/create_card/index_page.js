import Page from '../../../../../components/business/Page'
import Input from '../../../../../components/HzInput'
import { PureComponent } from 'react'
import {connect} from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import { Button, Select, Form, Icon, Upload, message, Spin } from 'antd'
import styles from './index.less'
import AddGroup from '../Modal/AddGroup'
import _ from 'lodash'

const Option = Select.Option

@Form.create()
@connect(({kepler_program, base}) =>({
    kepler_program, base
}))
export default class extends PureComponent {
    state = {
        groupLoading: false,
        fileList: [],
        uploadLoading: {
            card: false,
            default: false
        },
        uploadImgs: {
            cardImgUrl: '',
            defaultImgUrl: ''
        },
        modalVisible: false,
        selectValue: 0,
        showTitle: '',
    }

    componentDidMount () {
        this.props.dispatch({
            type: 'kepler_program/getToken',
            payload: {
                type: 'image',
            }
        })
        this.props.dispatch({
            type: 'kepler_program/getCardConfig',
            callback: (data) => {
                if (data.data && data.data.id) {
                    this.setState({
                        uploadImgs: {
                            ...this.state.uploadImgs,
                            defaultImgUrl: data.data.default_image_url
                        }
                    })
                }
            }
        })
        this.getGroupList().then(() => {
            const { groupArray } = this.props.kepler_program
            this.setState({
                selectValue: _.head(groupArray).id
            })
        })
    }

    getCardDetail = (id) => {
        this.props.dispatch({
            type: 'kepler_program/cardDetail',
            payload: id,
            callback: (data) => {
                console.log(data)
            }
        })
    }

    getGroupList = () => {
        return new Promise((resolve, reject) => {
            this.setState({groupLoading: true})
            this.props.dispatch({
                type: 'kepler_program/getGroupList',
                callback: (data) => {
                    if (data.meta && data.meta.code === 200) {
                        this.setState({
                            groupLoading: false
                        })
                        resolve()
                    } else {
                        reject()
                    }
                }
            })
        })
    }

    beforeUpload = (file, fileList) => {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJPG) {
            message.error('只能上传jpg/jpeg和png格式的图片！')
        }
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
            message.error('图片大小不能超过2MB！')
        }

        return isJPG && isLt2M
    }

    handleChange = (info, type) => {
        const { photoPrefix } = this.props.kepler_program
        const Protocol = window.location.protocol, setWhichImg = type === 'Card' ? 'cardImgUrl' : 'defaultImgUrl'
        if(info.file.status === 'done'){
            this.setState({
                uploadImgs: {
                    ...this.state.uploadImgs,
                    [setWhichImg]: `${Protocol}//${photoPrefix}/${info.file.response.key}`
                }
            }, () => {
                this.props.form.validateFields(['cardStyle'],{force: true})
            })
        }
    }

    validateCoverImg = (rules, value, callback) => {
        const { uploadImgs } = this.state
        if (!uploadImgs.cardImgUrl && !uploadImgs.defaultImgUrl) {
            callback('请至少上传一张图片')
        }
        callback()
    }

    validateCardId = (rules, value, callback) => {
        if (value && !/^gh_/.test(value)) {
            callback('请确认原始ID，原始ID均以gh_开头')
        }
        callback()
    }

    /* 事件处理 */

    handleCreate = (e) => {
        e.preventDefault()

        const { uploadImgs, selectValue } = this.state
        this.props.form.validateFields((err, value) => {
            if (err) return

            const path = `pages/cmData/cmData.html?returnPage=${encodeURIComponent(value.path)}&cm_source=hz`
            this.props.dispatch({
                type: 'kepler_program/createCard',
                payload: {
                    original_app_id: value.originalID,
                    app_path: path,
                    title: value.title,
                    image_url: uploadImgs.cardImgUrl ? uploadImgs.cardImgUrl: uploadImgs.defaultImgUrl,
                    category_id: selectValue
                },
                callback: (data) => {
                    if (data.meta && data.meta.code === 200) {
                        message.success('创建卡片成功！')
                        router.replace('/kepler/kepler_program')
                    }
                }
            })
            if (uploadImgs.defaultImgUrl) {
                this.props.dispatch({
                    type: 'kepler_program/editCardConfig',
                    payload: {
                        default_image_url: uploadImgs.defaultImgUrl
                    }
                })
            }
        })
    }

    handleTitle = (e) => {
        this.setState({
            showTitle: e.target.value
        })
    }

    addGroup = () => {
        this.setState({
            modalVisible: true
        })
    }

    handleSelect = (value) => {
        this.setState({
            selectValue: value
        })
    }

    handleBack = () => {router.replace('/kepler/kepler_program')}

    onCancel = (value) => {
        if (value && value === 'addAlready') {
            this.getGroupList()
        }
        this.setState({
            modalVisible: false
        })
    }

    render () {
        const uploadButton = (
            <div>
                <Icon type={this.state.uploadLoading.card ? 'loading' : 'plus'} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        )
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '110px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 10,
                style: {
                    width: '320px'
                }
            },
        }
        const formStyleItemLayout = {
            ...formItemLayout,
            wrapperCol: {
                span: 18,
            },
        }

        const { getFieldDecorator } = this.props.form
        const { groupArray, photoToken } = this.props.kepler_program
        const { modalVisible, uploadImgs, groupLoading, selectValue, showTitle } = this.state
        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            listType: "picture-card",
            beforeUpload: this.beforeUpload,
            className: "avatar-uploader",
            showUploadList: false
        }

        return (
            <DocumentTitle title='创建卡片'>
                <Page>
                    <Page.ContentHeader
                        hasGutter={true}
                        breadcrumbData={[{
                            name: '开普勒小程序',
                            path: '/kepler/kepler_program'
                        },{
                            name: '创建卡片'
                        }]}
                    />
                    <Form onSubmit={this.handleCreate}>
                        <Form.Item label="小程序原始ID" {...formItemLayout}>
                            {getFieldDecorator('originalID', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入小程序原始ID'
                                    },
                                ]
                            })(
                                <Input placeholder='请输入小程序原始ID' />
                            )}
                        </Form.Item>
                        <Form.Item label="小程序路径" {...formStyleItemLayout}>
                            {getFieldDecorator('path', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入小程序路径'
                                    },
                                ],
                            })(<Input placeholder='请输入小程序路径' maxLength={1024} style={{paddingRight: '55px', width: '320px'}}/>)}
                            <div className={styles.pathTips}>
                                <div>如小程序页面路径：</div>
                                <div>示例一：pages/detail/detail</div>
                                <div>示例二：pages/detail/detail?id=XX&name=XX</div>
                            </div>
                        </Form.Item>
                        <Form.Item label="卡片标题" {...formItemLayout}>
                            {getFieldDecorator('title', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入卡片标题'
                                    }
                                ]
                            })(
                                <Input placeholder='京东微小店' maxLength={35} style={{paddingRight: '45px'}} onChange={this.handleTitle} />
                            )}
                        </Form.Item>
                        <Form.Item label="卡片样式" {...formStyleItemLayout}>
                            {getFieldDecorator('cardStyle', {
                                rules: [
                                    {
                                        validator: this.validateCoverImg
                                    }
                                ]
                            })(
                                <div className={styles.cardStyle}>
                                    <div className={styles.cardStyleCont}>
                                        <div className={styles.cardReveal}>
                                            <div>
                                                <div className={styles.cardHeader}>
                                                    <div className={styles.cardLogo}></div>
                                                    <div>小程序名称</div>
                                                </div>
                                                <div className={styles.title}>{showTitle ? showTitle : '卡片标题'}</div>
                                                <div className={styles.cardUpload}>
                                                    <Upload
                                                        {...uploadProps}
                                                        onChange={(info) => this.handleChange(info, 'Card')}
                                                    >
                                                        {uploadImgs.cardImgUrl || uploadImgs.defaultImgUrl ? <img src={uploadImgs.cardImgUrl ? uploadImgs.cardImgUrl : uploadImgs.defaultImgUrl} alt='' /> : uploadButton}
                                                    </Upload>
                                                </div>
                                            </div>
                                            <div className={styles.cardBottom}>
                                                <img alt="" src={require('../../../assets/icon_xiaochegnxu.svg')}></img>
                                                <span>小程序</span>
                                            </div>
                                        </div>
                                        <div className={styles.defaultImg}>
                                            <div className={styles.title}>默认图片</div>
                                            <div className={styles.cardUpload}>
                                                <Upload
                                                    {...uploadProps}
                                                    onChange={(info) => this.handleChange(info, 'Default')}
                                                >
                                                    {uploadImgs.defaultImgUrl ? <img src={uploadImgs.defaultImgUrl} alt='' /> : uploadButton}
                                                </Upload>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.cardStyleTips}>建议尺寸5:4，大小不超过2M，暂不支持动图 ,如不上传卡片样式图，则统一使用默认图片</div>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item label="所属分组" {...formItemLayout}>
                            <Spin spinning={groupLoading}>
                                <Select placeholder="未分组" value={selectValue} onChange={this.handleSelect} style={{width: '240px',marginRight: '8px'}}>
                                    {groupArray.length > 0 && groupArray.map((item, index) => {
                                        return <Option value={item.id} key={index}>{item.name}</Option>
                                    })}
                                </Select>
                                <a href="javascript:;" style={{textDecoration: 'none'}} onClick={this.addGroup}>新增</a>
                            </Spin>
                        </Form.Item>
                        <Button type='primary' style={{marginLeft: '110px'}} htmlType='submit'>创建</Button>
                        <Button style={{marginLeft: '16px'}} onClick={this.handleBack}>取消</Button>
                    </Form>
                    <AddGroup visible={modalVisible} onCancel={this.onCancel} />
                </Page>
            </DocumentTitle>
        )
    }
}