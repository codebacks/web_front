import {Component} from 'react'
import Page from 'components/business/Page'
import DocumentTitle from 'react-document-title'
import { Form, Row, Input, Button, Select, Radio, Modal, Col, Upload, Icon, message, Spin  } from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import styles from './index.less'
import {jine} from '../../../../../utils/display'
import EditorCon from 'components/EditorCon'
import HzInput from '@/components/HzInput'
import { AWARD_TYPE } from 'crm/services/integral'
const Option = Select.Option
const RadioGroup = Radio.Group
const DefaultImg = '2019/01/18/FkQFFyGe7YqQwcBU_zKt1X7-mzjc.png'
const DecDoc = 'http://kf.qq.com/faq/170905yMRfaq170905RruuMZ.html'
const IntegerPattern = /^([1-9]\d*)$/g
const DecimalPattern = /^([1-9]\d*)$|^(\d+\.(\d){1,2})$/g

@connect(({ base,crm_intergral }) => ({
    base,
    crm_intergral
}))
@Form.create()
export default class Index extends Component {
    state = {
        // 图片类型
        picType: 1,
        // 奖品类型
        awardType: '',
        title: '',
        loading: false,
        fileList: [],
        visible: false,
        preImage: '',
        hostName: 'image.51zan.com',
        maxNum: 5,
        maxSize: 5,
        disabled: false,
        isPackage: true,
        isEdite: false,
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
            }
        })
    }
    checkShow = () => {
        const { id } = this.props.location.query
        const {hostName} = this.state
        if (id) {
            this.setState({loading: true})
            this.props.dispatch({
                type: 'crm_intergral/getAwardDetail',
                payload: {
                    id: id || '',
                },
                callback: ()=>{ 
                    const {getAwardDetail, getGzhList} = this.props.crm_intergral
                    let val = getAwardDetail
                    if(val.type === 1){
                        // 判断公众号授权是否已经失效
                        let oauthArr = Array.isArray(getGzhList)&&getGzhList.filter((item)=>{
                            return item.app_id === val.app_id
                        })
                        if(Array.isArray(oauthArr)&&oauthArr.length === 0){
                            message.warn('公众号未授权第三方平台，请检查授权状态')
                            val.app_id = ''
                        }
                    }
                    this.props.form.setFieldsValue({
                        name: val.name || '',
                        type: val.type + '' || '',
                        price: val.price&&jine(val.price, '0.00', 'Fen') || '',
                        consumed_points: val.consumed_points&&jine(val.consumed_points, '0', 'Fen')  || '',
                        stock_count: val.stock_count || '',
                        description: val.description || '',
                        status: parseInt(val.status, 10) || '',
                    })
                    this.textRefs.onChange(val.description)
                    let  isPackage
                    if(parseInt(val.type,10) === 1){
                        isPackage =  true
                    }else{
                        isPackage =  false
                    }
                    let arr = val.image_urls
                    this.setState({
                        loading: false,
                        disabled: true,
                        title: '编辑奖品',
                        isPackage: isPackage,
                        isEdite: true,
                        picType: 2,
                        awardType: val.type || '',
                    },()=>{
                        const {picType} = this.state
                        if(picType === 1){
                            return 
                        }
                        let list = []
                        Array.isArray(arr)&&arr.forEach((item)=>{
                            list.push({
                                uid: 1,
                                status: 'done',
                                urlText: item || '',
                                url: item?`//${hostName}/${item}`:'',
                            })
                        })
                        this.props.form.setFieldsValue({
                            image_urls: list,
                            app_id: val.app_id + '' || '',
                        })
                        this.setState({
                            fileList: val.image_urls ? list : []
                        })
                    })
                }
            })
        }else{
            this.setState({
                isEdite: false,
                title: '添加奖品'
            })
        }
    }

    onSave = ()=>{
        this.props.form.validateFields((err, values) => {
            if(!err){
                let list = []
                values.image_urls.length>0 && values.image_urls.map((item)=>{
                    if(item.response){
                        item.response.key&&list.push(item.response.key)
                    }else{
                        item.urlText&&list.push(item.urlText)
                    }
                })
                const { id } = this.props.location.query
                this.props.dispatch({
                    type: 'crm_intergral/editAward',
                    payload: {
                        id: id || '',
                        name: values.name || '',
                        type: values.type || '',
                        price: values.price * 100 || '',
                        consumed_points: values.consumed_points * 100  || '',
                        stock_count: values.stock_count || '',
                        app_id: values.app_id || '',
                        image_urls: JSON.stringify(list),
                        description: values.description || '',
                        status: values.status || '',
                    },
                    callback: ()=>{
                        this.onCancel()
                    }
                })
            }
        })
    }
    onCancel = ()=>{
        router.push('/crm/integral_award')
    }
    showConfirm = (value)=>{
        if(parseInt(value, 10) === 1){
            this.setState({
                awardType: value,
                fileList: [],
            },()=>{
                const {hostName} = this.state
                let list = []
                list.push({
                    uid: 1,
                    status: 'done',
                    urlText: DefaultImg || '',
                    url: DefaultImg?`//${hostName}/${DefaultImg}`:'',
                    default: true,
                })
                this.setState({
                    fileList: list, 
                })
                this.props.form.setFieldsValue({
                    image_urls: list
                })
            })
            Modal.info({
                okText: '确定',
                title: (<span className={styles.tipTitle}>红包提示</span>),
                content: (
                  <div>
                    <span className={styles.tipContent}>红包奖品，需支付公众号开通企业付款功能。开通前，需入驻满90天，且有30天连续不间断流水记录，详情说明</span>
                    <span className={styles.tipLink}>
                        <a href={DecDoc} alt='' target='_blank'>企业付款/现金红包开通条件</a>
                    </span>
                  </div>
                ),
                onOk() {}
              })
        }else{
            this.props.form.setFieldsValue({
                image_urls: []
            })
            this.setState({
                awardType: value,
                picType: 1,
                fileList: [],
            })
        }
    }
    onChangeType = (e)=>{
        let val = e.target.value
        if(parseInt(val, 10) === 1){
            const {hostName} = this.state
            let list = []
            list.push({
                uid: 1,
                status: 'done',
                urlText: DefaultImg || '',
                url: DefaultImg?`//${hostName}/${DefaultImg}`:'',
                default: true,
            })
            this.setState({
                fileList: list, 
            })
            this.props.form.setFieldsValue({
                image_urls: list
            })
        }else{
            this.setState({
                fileList: [], 
            })
            this.props.form.setFieldsValue({
                image_urls: []
            })
        }
        this.setState({
            picType: parseInt(val, 10)
        })
    } 

    normFile = (e) => {
        if (e.fileList && e.fileList.status !== 'removed') {
            return e.fileList
        }
    }
    onChangeImg = ({ file, fileList })=>{
        if (file.status === 'done') {
            message.success(`${file.name} 上传成功`) 
        } else if (file.status === 'error') {
            message.error(`${file.name} 上传失败`)
            fileList.pop()
        } 
        this.setState({ fileList: fileList })
        this.props.form.setFieldsValue({
            image_urls: fileList
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
    onCancelPreview = ()=>this.setState({ visible: false })
    
    onRemove = (file)=>{
        if(file.default){
            message.warn('默认图片不能删除')
            return false
        }
    }

    changeQuill = (html)=> {
        let str
        // 当输入内容为空的时候
        const temp = html.replace(/<[^>]*>|/g, "")
        //当去除标签后为空或者不包含img标签的时候
        if(temp === '' && html.indexOf('<img')===-1){
            str = ''
        }else{
            str = html
        }
        // console.log(html)
        this.props.form.setFieldsValue({
            description: str,
        })
    }
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
        const uploadButton = (
            <div>
                <Icon type={'plus'} style={{fontSize: 24}} />
                <div className="ant-upload-text">上传图片</div>
            </div>
        ) 
        const { fileList, visible, preImage, maxNum, maxSize, isPackage, isEdite, awardType, picType, hostName } = this.state
        const { photoToken, getGzhList } = this.props.crm_intergral
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
        return (
            <DocumentTitle title = {this.state.title} >
                <Page>
                    <Page.ContentHeader
                        
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '奖品管理',
                            path: '/crm/integral_award'
                        },{
                            name: this.state.title
                        }]}
                    /> 
                    <Spin spinning={this.state.loading}>
                        <Row style={{marginBottom: 16}}>
                            <Col>
                                <div className={styles.leftContent}>
                                    <Form onSubmit={this.onSubmit}>
                                        <Form.Item label='奖品名称' {...formItemLayout}>
                                            {getFieldDecorator('name', {
                                                rules: [
                                                    {required: true, message: '请输入30字以内的奖品名称'},
                                                ]
                                            })(
                                                <HzInput placeholder="请输入30字以内的奖品名称" maxLength={30} style={{width: 320}}/>
                                            )}
                                        </Form.Item>
                                        <Form.Item label='奖品类型' {...formItemLayout}>
                                            {getFieldDecorator('type', {
                                                rules: [
                                                    {required: true, message: '请选择奖品类型'}
                                                ]
                                            })(
                                                <Select 
                                                    placeholder="请选择奖品类型" 
                                                    style={{width: 320}} 
                                                    onChange={this.showConfirm} 
                                                    disabled={this.state.disabled}
                                                    getPopupContainer={triggerNode => triggerNode.parentNode}
                                                >
                                                    {
                                                        AWARD_TYPE.map(item=>{
                                                            return <Option value={item.value + ''} key={item.value}>{item.type}</Option>
                                                        })
                                                    }
                                                </Select>
                                            )}
                                        </Form.Item>
                                        <Form.Item label='奖品价值' {...formItemLayout} required={true}>
                                            {getFieldDecorator('price', {
                                                rules: [
                                                    {required: true, message: '请输入奖品价值'},
                                                    {pattern: /^([1-9]\d*)$|^([1-9](\d)*\.(\d){1,2})$|^(0\.[1-9](\d){0,1})$|^(0\.0[1-9])$/g, message: '请输入正确的值，最多两位小数'}
                                                ]
                                            })(
                                                <Input placeholder='请输入奖品价值' maxLength={9} style={{width: 120}}/>
                                            )}
                                            <span style={{ marginLeft: "12px" }}>元</span>
                                        </Form.Item>
                                        <Form.Item label='兑换积分' {...formItemLayout} required={true}>
                                            {getFieldDecorator('consumed_points', {
                                                rules: [
                                                    {required: true, message: '请输入积分数'},
                                                    {pattern: IntegerPattern, message: '请输入正确的积分数'}
                                                ]
                                            })(
                                                <Input placeholder='请输入积分数' maxLength={9} style={{width: 120}}/>
                                            )}
                                            <span style={{ marginLeft: "12px" }}>分</span>
                                        </Form.Item>
                                        <Form.Item label='总库存' {...formItemLayout} required={true}>
                                            {getFieldDecorator('stock_count', {
                                                rules: [
                                                    {required: true, message: '请输入总库存数'},
                                                    {pattern: IntegerPattern, message: '请输入正确的库存数'}
                                                ]
                                            })(
                                                <Input placeholder='请输入总库存数' maxLength={9} style={{width: 120}}/>
                                            )}
                                            <span style={{ marginLeft: "12px" }}>个</span>
                                        </Form.Item>
                                        {/* 仅红包显示公众号 */}
                                        {
                                            awardType && parseInt(awardType, 10) === 1 && (
                                                <Form.Item label='付款公众号' {...formItemLayout}>
                                                    {getFieldDecorator('app_id', {
                                                        rules: [
                                                            {required: true, message: '请选择付款公众号'}
                                                        ]
                                                    })(
                                                        <Select placeholder="请选择付款公众号" style={{width: 320}}>
                                                            {
                                                                getGzhList.map((item, index)=>{
                                                                    return (
                                                                        <Option value={item.app_id} key={index}>{item.name || '公众号未授权'}</Option>
                                                                    )
                                                                })
                                                            }
                                                        </Select>
                                                    )}
                                                </Form.Item>
                                            )
                                        }
                                        {/* 选择奖品类型后才显示图片 */}
                                        {
                                           awardType &&(
                                            <Form.Item label='奖品主图' {...formItemLayout}
                                                extra={(
                                                <div>
                                                    {
                                                        !isEdite && parseInt(awardType, 10) === 1&&(<div className={styles.extraText}>如不更换图片，则奖品将显示默认红包图片</div>)
                                                    }
                                                    <div className={styles.extraText}>{`最多上传${this.state.maxNum}张，图片大小5MB以内，支持jpg、jpeg、png等格式`}</div>
                                                </div>)}
                                            >
                                                {getFieldDecorator('image_urls', {
                                                    rules: [
                                                        {required: true, message: '请上传奖品主图'}
                                                    ]
                                                })(
                                                    <span></span>
                                                )}
                                                <div>
                                                    {
                                                        !isEdite && parseInt(awardType, 10) === 1 && (
                                                            <div>
                                                                <RadioGroup onChange={this.onChangeType} value={picType}>
                                                                    <Radio value={1}>默认图片</Radio>
                                                                    <Radio value={2}>自定义图片</Radio>
                                                                </RadioGroup> 
                                                            </div>
                                                        )
                                                    }
                                                    <div>
                                                        <Upload
                                                            {...{ ...uploadProps, data: { token: photoToken }}}
                                                            listType={'picture-card'}
                                                            className={styles.uploadCon +" "+ `${parseInt(awardType, 10) === 1 && picType === 1&&styles.deleteHidden}`}
                                                            fileList={fileList}
                                                            onChange={this.onChangeImg}
                                                            onPreview={this.onPreview}
                                                            onRemove={this.onRemove}
                                                        >
                                                            {
                                                                fileList.length < (parseInt(awardType, 10) === 1 && picType === 1 ? 1 : maxNum) &&  uploadButton 
                                                            }
                                                        </Upload>
                                                    </div>
                                                </div>
                                            </Form.Item>
                                           ) 
                                        }
                                        <Form.Item label='奖品详情' {...formItemLayout}>
                                            {getFieldDecorator('description', {
                                                rules: [
                                                    {required: true, message: '请输入奖品详情'}
                                                ]
                                            })(
                                                <EditorCon 
                                                    ref={node => this.textRefs = node} 
                                                    changeQuill={this.changeQuill} 
                                                    placeholder='请输入奖品详情或兑换须知'
                                                    photoToken={photoToken}
                                                    photoPrefix={hostName}
                                                ></EditorCon>
                                            )}
                                        </Form.Item>
                                        <Form.Item label='是否上架' {...formItemLayout}>
                                            {getFieldDecorator('status', {
                                                initialValue: 1,
                                                rules: [
                                                    {required: true, message: '请选择是否上架'}
                                                ]
                                            })(
                                                <RadioGroup>
                                                    <Radio value={1}>上架</Radio>
                                                    <Radio value={2}>不上架</Radio>
                                                </RadioGroup>
                                            )}
                                        </Form.Item>
                                        <Row style={{marginLeft: 100}}>
                                            <Button type="primary" style={{marginRight: 16}} onClick={this.onSave}>保存</Button>
                                            <Button onClick={this.onCancel}>取消</Button>
                                        </Row>
                                    </Form>                     
                                </div>
                            </Col>
                        </Row>
                        <Modal visible={visible} footer={null} onCancel={this.onCancelPreview} wrapClassName={styles.modalCon}>
                            <img alt="图片预览" style={{ width: '100%' }} src={preImage} />
                        </Modal>
                    </Spin>
                </Page>
            </DocumentTitle>
        )
    }
}
