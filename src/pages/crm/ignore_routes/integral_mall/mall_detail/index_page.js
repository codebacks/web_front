import {Component} from 'react'
import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Row, Input, Button, message, Spin, Col, Select, Upload, Icon, Modal } from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import styles from './index.less'
import HzInput from '@/components/HzInput'
import get from 'lodash/get'

const Option = Select.Option
const DEFAULT_BAN = require('../../../assets/images/mall_ban.png')

@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
@Form.create()
export default class Index extends Component {
    state ={
        loading: false,
        text: '',
        isEdite: false,
        fileList: [],
        maxNum: 1,
        maxSize: 2,
        visible: false,
        preImage: '',
        hostName: 'image.51zan.com',
        banImg: DEFAULT_BAN,
    }
    componentDidMount() {
        this.props.dispatch({
            type: 'crm_intergral/getToken',
            payload: {
                type: 'image',
            }
        })
        this.props.dispatch({
            type: 'crm_intergral/getGzhList',
            payload: {},
            callback: ()=>{
                this.checkShow()
                this.checkSignBar()
            }
        }) 
    }
    checkShow = () => {
        const { id } = this.props.location.query
        const { hostName } = this.state
        if (id) {
            this.setState({loading: true})
            this.props.dispatch({
                type: 'crm_intergral/getMallDetail',
                payload: {
                    id: id || '',
                },
                callback: ()=>{ 
                    this.setState({loading: false})
                    let {getMallDetail, getGzhList} = this.props.crm_intergral
                    let val = {...getMallDetail}
                    // 判断公众号授权是否已经失效
                    let oauthArr = Array.isArray(getGzhList)&&getGzhList.filter((item)=>{
                        return item.app_id === val.app_id
                    })
                    if(oauthArr&&oauthArr.length === 0){
                        message.warn('公众号未授权第三方平台，请检查授权状态')
                        val.app_id = ''
                    }
                    let list = []
                    if(val.head_image_url){
                        list.push({
                            uid: 1,
                            status: 'done',
                            urlText: val.head_image_url || '',
                            url: `//${hostName}/${val.head_image_url}` || '',
                        })
                    }
                    this.props.form.setFieldsValue({
                        app_id: val.app_id || '',
                        title: val.title || '',
                        description: val.description || '',
                        head_image_url: list || ''
                    })
                    this.setState({
                        text: '编辑积分商城',
                        isEdite: true,
                        title: val.title || '',
                        dec: val.description || '',
                        fileList: list || [],
                        banImg: val.head_image_url ? `//${hostName}/${val.head_image_url}` : '',
                    })
                }
            })
        }else{
            this.setState({
                text: '创建积分商城',
                isEdite: false,
            },()=>{
                this.props.form.setFieldsValue({
                    description: '积分兑换 有您有礼'
                })  
            })
        }
    }
    checkSignBar = () =>{
        this.props.dispatch({
            type:'crm_intergral/getsettingData',
        })
    }
    onSave = ()=>{
        this.props.form.validateFields((err, values) => {
            if(!err){  
                let list = ''
                values.head_image_url.length>0 && values.head_image_url.map((item)=>{
                    if(item.response){
                        list =  item.response.key
                    }else{
                        list = item.urlText
                    }
                })
                const { id } = this.props.location.query
                this.setState({loading: true})
                this.props.dispatch({
                    type: 'crm_intergral/editMall',
                    payload: {
                        id: id || '',
                        app_id: values.app_id || '',
                        title: values.title || '',
                        description: values.description || '',
                        head_image_url: list || '',
                    },
                    callback: ()=>{
                        this.setState({loading: true})
                        message.success('保存成功')
                        this.onCancel()
                    }
                })
            }
        })
    }
    onCancel = ()=>{
        router.push('/crm/integral_mall')
    }
    onChangeTitle = (e)=>{
        let val = e.target.value
        this.setState({
            title: val
        })
    }
    onChangeDec = (e)=>{
        let val = e.target.value
        this.setState({
            dec: val
        })
    }
    onChangeImg = ({ file, fileList })=>{
        if (file.status === 'done') {
            message.success(`${file.name} 上传成功`) 
        } else if (file.status === 'error') {
            message.error(`${file.name} 上传失败`)
            fileList.pop()
        } 
        this.setState({ 
            fileList: fileList,
            banImg: fileList.length>0 && fileList[0].thumbUrl,
        })
        this.props.form.setFieldsValue({
            head_image_url: fileList
        })
    }
    onPreview = (file) => {
        const { hostName }  = this.state
        if(file.url){
            this.setState({
                preImage: file.url,
                visible: true,
            })
        }else{
            this.setState({
                preImage: `//${hostName}/${file.response.key}`,
                visible: true,
            })
        }
    }
    onRemove = (file)=>{
        this.setState({
            banImg: DEFAULT_BAN,
            fileList: [],
        },()=>{
            this.props.form.setFieldsValue({
                head_image_url: []
            })
        }) 
    }
    onCancelPreview = ()=>this.setState({ visible: false })
    render() {
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '100px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        } 
        const uploadProps = {
            name: 'file',
            accept:'image/*',
            action: '//upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: '',
            },
            beforeUpload: (file, fileList)=>{
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png'
                if (!isJPG) {
                    message.error('文件限制jpg/jpeg/png!')
                    fileList.pop()
                }
                const isLt1M = file.size / 1024 / 1024 < maxSize
                if (!isLt1M) {
                    message.error(`大小限制${maxSize}MB!`)
                    fileList.pop()
                }
                return isJPG && isLt1M
            },
        }
        const uploadButton = (
            <div>
                <Icon type={'plus'} style={{fontSize: 24}} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        )
        const { getGzhList ,getsettingData, photoToken} = this.props.crm_intergral
        const { fileList, maxNum, maxSize, visible, preImage, banImg  } = this.state
        return (
            < DocumentTitle title = {this.state.text} >
                <Page>
                    <Page.ContentHeader
                        
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '商城开通',
                            path: '/crm/integral_mall'
                        },{
                            name: this.state.text
                        }]}
                    /> 
                    <Spin spinning={this.state.loading}>
                        <Row>
                            <Col span={15} style={{ width: '780px' }}>
                            <div className={styles.leftContent}>
                                <Form onSubmit={this.onSubmit}>
                                    <Form.Item label='所属公众号' {...formItemLayout}
                                        extra={(<span className={styles.extraText}>输入保存后不可更改</span>)}
                                    >
                                        {getFieldDecorator('app_id', {
                                            rules: [
                                                {required: true, message: '请选择公众号'}
                                            ]
                                        })(
                                            <Select placeholder="请选择公众号" style={{width: 320}} disabled={this.state.isEdite}>
                                                {
                                                    getGzhList.map((item)=>{
                                                        return (
                                                            <Option value={item.app_id} key={item.app_id}>{item.name}</Option>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                    <Form.Item label='商城名称' {...formItemLayout}>
                                        {getFieldDecorator('title', {
                                            rules: [
                                                {required: true, message: '请输入10字以内的商城名称'}
                                            ]
                                        })(
                                            <HzInput placeholder="请输入10字以内的商城名称" maxLength={10} style={{width: 320}} onChange={this.onChangeTitle}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item label='商城描述' {...formItemLayout}>
                                        {getFieldDecorator('description', {})(
                                            <HzInput placeholder="请输入10字以内的商城描述" maxLength={10} style={{width: 320}} onChange={this.onChangeDec}/>
                                        )}
                                    </Form.Item>
                                    <Form.Item label='商城banner：' {...formItemLayout} extra={
                                        <span>{`支持jpg、jpeg、png等格式图片上传，大小须${maxSize}M以内，建议图片尺寸：750（宽）* 400（高）`}</span>
                                    }>
                                        {getFieldDecorator('head_image_url', {})(
                                                <div>
                                                    <Upload
                                                        {...{ ...uploadProps, data: { token: photoToken }}}
                                                        listType={'picture-card'}
                                                        fileList={fileList}
                                                        onChange={this.onChangeImg}
                                                        onPreview={this.onPreview}
                                                        onRemove={this.onRemove}
                                                    >
                                                        {
                                                            (fileList.length < maxNum) &&  uploadButton 
                                                        }
                                                    </Upload>
                                                </div>
                                        )}
                                    </Form.Item>
                                    <Row style={{marginLeft: 100}}>
                                        <Button type="primary" style={{marginRight: 16}} onClick={this.onSave}>保存</Button>
                                        <Button onClick={this.onCancel}>取消</Button>
                                    </Row>
                                </Form>
                            </div>
                        </Col>
                        <Col span={6}>
                            <div className={`${styles.phoneWrap} ${(get(getsettingData,'details.sign') && Object.keys(getsettingData.details.sign).length) ? styles.signBar : styles.noSignBar}`}>
                                <div className={styles.phoneContent}>
                                    <div className={styles.head}>
                                        <span>{this.state.title || '积分商城名称'}</span>
                                        <img src={require('../../../assets/images/mall_plot.png')} alt="" className={styles.headImg}/>
                                    </div>
                                    <div className={styles.banerWarp}>
                                        <img src={banImg || DEFAULT_BAN} alt="" className={styles.banerImg}/>
                                        <div className={styles.banerText}>{this.state.dec || '积分兑换 有您有礼'}</div>
                                    </div>
                                    <div className={styles.conWarp}>
                                        <img src={require('../../../assets/images/mall_content.png')} alt="" className={styles.conImg}/>
                                    </div>
                                </div>
                                <div style={{textAlign: 'center',marginTop: 70}}>效果预览</div>
                            </div>
                        </Col>
                    </Row>
                    </Spin>
                    <Modal visible={visible} footer={null} onCancel={this.onCancelPreview} wrapClassName={styles.modalCon}>
                        <img alt="图片预览" style={{ width: '100%' }} src={preImage} />
                    </Modal>
                </Page>
            </DocumentTitle>
        )
    }
}
