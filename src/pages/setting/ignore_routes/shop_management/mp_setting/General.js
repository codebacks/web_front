import { Component, Fragment } from 'react'
import { connect } from 'dva'
import Page from 'components/business/Page'
import { Form, Button, Input, Upload, Icon, Cascader, Modal, Row, Col, message } from 'antd'
import {AREA_DATA} from 'components/business/CitySelect/AreaData'
import styles from './index.less'
import safeSetState from 'hoc/safeSetState'
import HzInput from '@/components/HzInput'
//地区数据
const options = AREA_DATA
@connect(({base, mp_setting}) => ({
    base,
    mp_setting,
}))
@Form.create()
@safeSetState()
export default class General extends Component {
    state = {
        logoUrl: '',
        banUrl: '',
        shareUrl: '',
        shopEdit: false,
        shareEdit: false,
        textArea: '',
        fileList: [],
        logoFileList: [],
        shareFileList: [],
        imageNum: 1,
        previewVisible: false,
        loading: false,
    }
    componentDidMount () {
        this._isMount = true
        this.props.dispatch({
            type: 'mp_setting/getToken',
            payload: {
                type: 'image',
            }
        })
        this.getInitData()
    }
    componentWillUnmount () { 
        this._isMount = false
    }
    delay = (action) => { 
        this.timer = setTimeout(() => { 
            action()
        },0)
    }
    getInitData = (type) => {
        const typeEdite = type || ''
        if (!this._isMount) { 
            return 
        }
        this.props.dispatch({
            type: 'mp_setting/getSettingData',
            payload: {},
            callback: () => { 
                const { settingData } = this.props.mp_setting
                const { photoPrefix } = this.props.mp_setting
                // console.log(settingData)
                let list = []
                list.push({
                    uid: 1,
                    status: 'done',
                    urlText: settingData.banner,
                    url: settingData.banner?`//${photoPrefix}/${settingData.banner}`:'',
                })
                let shareList = []
                shareList.push({
                    uid: 1,
                    status: 'done',
                    urlText: settingData.share_logo_url,
                    url: settingData.share_logo_url?`//${photoPrefix}/${settingData.share_logo_url}`:'',
                })
                let logoFileList = []
                logoFileList.push({
                    uid: 1,
                    status: 'done',
                    urlText: settingData.logo_url,
                    url: settingData.logo_url?`//${photoPrefix}/${settingData.logo_url}`:'',
                })
                if (this._isMount) { 
                    // 防止退出编辑的时候，另外一个编辑的内容被还原
                    if (typeEdite === 1) {
                        this.props.form.setFieldsValue({
                            name: settingData.name || '',
                            logo_url: logoFileList,
                            owner_name: settingData.owner_name || '',
                            customer_service_mobile: settingData.customer_service_mobile || '',
                        })
                    } else if (typeEdite === 2) {
                        this.props.form.setFieldsValue({
                            share_text: settingData.share_text || '',
                            share_logo_url: shareList,
                        })
                    } else { 
                        this.props.form.setFieldsValue({
                            name: settingData.name || '',
                            logo_url: logoFileList,
                            owner_name: settingData.owner_name || '',
                            customer_service_mobile: settingData.customer_service_mobile || '',
                            share_text: settingData.share_text || '',
                            share_logo_url: shareList,
                        })  
                    }
                }    
                this.setState({
                    logoUrl: settingData.logo_url || '',
                    banUrl: settingData.banner || '',
                    province: settingData.province,
                    city: settingData.city,
                    county: settingData.region,
                    address: settingData.address,
                    shareUrl: settingData.share_logo_url || '',
                    textArea: settingData.description || "", 
                    fileList: settingData.banner?list:'',
                    shareFileList: settingData.share_logo_url?shareList:'',
                    logoFileList: settingData.logo_url?logoFileList:'',
                })
            }
        })
    }
    //更改省市区
    areaChange = (value)=>{
        this.setState({
            province: value[0],
            city: value[1],
            county: value[2],  
        })
    }
    //更改详细地址
    textAdressChange = (e)=>{
        this.setState({
            address: e.target.value, 
        })
    }
    logoChange = (info)=> {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)  
            this.setState({
                logoUrl: `${info.file.response.key}`,
            })
        }
    }
    handleChange = ({ fileList }) => {
        this.setState({ fileList })
        this.props.form.setFieldsValue({
            banner: fileList
        })
    }
    handleLogoChange = ({ fileList }) => {
        this.setState({ logoFileList: fileList })
        this.props.form.setFieldsValue({
            logo_url: fileList
        }) 
    }
    handleCancel = () => this.setState({ previewVisible: false })
    handlePreview = (file) => {
        // console.log(file)
        const { photoPrefix } = this.props.mp_setting
        if(file.url){
            this.setState({
                previewImage: file.url,
                previewVisible: true,
            })
        }else{
            this.setState({
                previewImage: `//${photoPrefix}/${file.response.key}`,
                previewVisible: true,
            })
        }
    }
    normFileImg = (e)=> {
        if(e.fileList && e.fileList.status!=='removed'){
            return e.fileList
        }
        return e.fileList
    }
    shopEdit = () => {
        this.setState({
            shopEdit: true,
        }, () => { 
            this.getInitData()
        }) 
    }
    saveShopEdit = ()=> {
        this.props.form.validateFields((err, values)=>{
            // console.log(values)
            if (!err) {
                this.setState({
                    loading: true
                })
                let { province, city, county, address } = this.state
                let myAddress = ''
                if(!province&&!city&&!county){
                    myAddress = ''
                }else{
                    myAddress = address
                }
                let list = ''
                let logoList = ''
                values.logo_url.length>0 && values.logo_url.forEach(item=>{
                    if(item.response){
                        logoList = item.response.key
                    }else{
                        logoList = item.urlText
                    }
                })
                this.props.dispatch({
                    type: 'mp_setting/saveSettingData',
                    payload: {
                        name: values.name || '',
                        logo_url: logoList,
                        banner: list,
                        description: values.description || '',
                        owner_name: values.owner_name || '',
                        customer_service_mobile: values.customer_service_mobile || '',
                        province: province || '',
                        city: city || '',
                        region: county || '',
                        address: myAddress || '',
                        search_default_text: values.search_default_text || '',
                    },
                    callback: ()=> {
                        this.setState({
                            shopEdit: false,
                            loading: false,
                        }, () => { 
                            this.getInitData()
                        })
                    } 
                })
            }
        })
    }
    cancelShopEdit = () => { 
        this.setState({
            shopEdit: false,
        }, () => { 
            this.getInitData(1)
        }) 
    }

    shareChange = (info)=> {
        if (info.file.status === 'done') {
            message.success(`${info.file.name} 上传成功`)  
            this.setState({
                shareUrl: `${info.file.response.key}`,
            })
        }
    }
    normFileShare = (e) => {
        if(e.fileList && e.fileList[0] && e.fileList[0].response){
            return e.fileList[0].response.key
        }
        return this.state.shareUrl
    }
    shareEdit = ()=> {
        this.setState({
            shareEdit: true,
        }, () => { 
            this.getInitData()
        }) 
    }
    saveShareEdit = ()=> {
        this.props.form.validateFields((err, values)=>{
            if (!err) {
                this.setState({
                    loading: true
                })
                let list = ''
                values.share_logo_url.length>0 && values.share_logo_url.forEach(item=>{
                    if(item.response){
                        list = item.response.key
                    }else{
                        list = item.urlText
                    }
                })
                this.props.dispatch({
                    type: 'mp_setting/saveSharingData',
                    payload: {
                        share_text: values.share_text || '',
                        share_logo_url:  list,
                    },
                    callback: ()=> {
                        this.setState({
                            shareEdit: false,
                            loading: false,
                        }, () => { 
                            this.getInitData()
                        }) 
                    }
                })
            }
        })    
    }
    cancelShareEdit = ()=> {
        this.setState({
            shareEdit: false,
        }, () => { 
            this.getInitData(2)
        })  
    }
    textAreaChange = (e)=>{
        this.setState({
            textArea: e.target.value
        })
    }
    handleShareChange = ({ fileList }) => {
        this.setState({ shareFileList: fileList })
        this.props.form.setFieldsValue({
            share_logo_url: fileList
        })
    }
    handleCancel = () => this.setState({ previewVisible: false })
    handlePreview = (file) => {
        // console.log(file)
        const { photoPrefix } = this.props.mp_setting
        if(file.url){
            this.setState({
                previewImage: file.url,
                previewVisible: true,
            })
        }else{
            this.setState({
                previewImage: `//${photoPrefix}/${file.response.key}`,
                previewVisible: true,
            })
        }
    }
    normFileImg = (e)=> {
        if(e.fileList && e.fileList.status!=='removed'){
            return e.fileList
        }
    }
    render () {
        const {  shareFileList, logoFileList, imageNum, previewVisible, previewImage, loading } = this.state
        const { getFieldDecorator } = this.props.form
        const { mainData, settingData, photoPrefix, photoToken } = this.props.mp_setting
        const { shopEdit, shareEdit, province, city, county, address } = this.state
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const  uploadProps = {
            name: 'file',
            action: 'https://upload.qiniup.com/',
            headers: {
                authorization: 'authorization-text',
            },
            data: {
                token: photoToken,
            },
            beforeUpload: (file, fileList)=>{
                const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
                if (!isJPG) {
                    message.error('文件限制jpg/jpeg/png!')
                    fileList.pop()
                }
                const isLt1M = file.size / 1024 / 1024 < 1
                if (!isLt1M) {
                    message.error('大小限制1MB!')
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
        return(
            <Fragment>
                <Form>
                    <div className={styles.warpCon}>
                        <Page.ContentBlock title='主体信息' hasDivider={false} style={{marginTop: '-12px'}}>
                            <div className={styles.mainInfo}>
                                {mainData&&(
                                    <Fragment>
                                        <Row>
                                            <Col span={8}>
                                                <Form.Item label="商铺编号" {...formItemLayout}>
                                                    {getFieldDecorator("shopNo",{})(
                                                        <span>{mainData.no}</span>
                                                    )}
                                                </Form.Item> 
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label="主体信息" {...formItemLayout}>
                                                    {getFieldDecorator("shopName",{})(
                                                        <span>{mainData.principal_name}</span>
                                                    )}
                                                </Form.Item> 
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label="主营类目" {...formItemLayout}>
                                                    {getFieldDecorator("shopCategory",{})(
                                                        <span>{mainData.category?(
                                                            mainData.category.map((item,index)=>{
                                                                return <span key={index}>{item.first_class || ''}{item.second_class || ''}</span>
                                                            })
                                                        ):''}</span>
                                                    )}
                                                </Form.Item> 
                                            </Col>
                
                                        </Row>
                                        <Row>
                                            <Col span={8}>
                                                <Form.Item label="创建日期" {...formItemLayout}>
                                                    {getFieldDecorator("shopCreate",{})(
                                                        <span>{settingData.created_at}</span>
                                                    )}
                                                </Form.Item> 
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label="小程序名称" {...formItemLayout}>
                                                    {getFieldDecorator("shopNickname",{})(
                                                        <span>{mainData.nick_name}</span>
                                                    )}
                                                </Form.Item> 
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label="小程序ID" {...formItemLayout} style={{marginBottom: 0}}>
                                                    {getFieldDecorator("shopAppid",{})(
                                                        <span>{mainData.app_id}</span>
                                                    )}
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Fragment> 
                                )}
                            </div>
                        </Page.ContentBlock>
                    </div>
                    <div className={styles.warpCon}>
                        <Page.ContentBlock title='店铺信息' hasDivider={false} style={{marginTop: '-12px'}}>
                            <div className={shopEdit === false ?styles.shopInfo:''}>
                                <Row>
                                    <Col span={8}>
                                        <Form.Item label="商铺名称" {...formItemLayout}>
                                            {getFieldDecorator("name",{
                                                rules: [
                                                    { required: true, message: '请输入商铺名称' },
                                                    { max: 20, message: '不能超过20个字符' },
                                                ],
                                            })(
                                                shopEdit === false ? (<span>{settingData.name}</span>) : (
                                                    <HzInput placeholder="20个字内" maxLength={20} className={styles.inputStyle}/>
                                                )
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="客服电话" {...formItemLayout}>
                                            {getFieldDecorator("customer_service_mobile",{
                                                rules: [
                                                    { required: true, message: '请输入客服电话' },
                                                    { pattern: /(^[0-9]{3,4}-[0-9]{3,8}$)|(^[0-9]{3,4} [0-9]{3,8}$)|(^0{0,1}1[3|4|5|6|7|8][0-9]{9}$)/, message: '请输入正确的电话' },
                                                ],
                                            })(
                                                shopEdit === false ? (
                                                    <span>{settingData.customer_service_mobile}</span>
                                                ) : (
                                                    <Input  className={styles.inputStyle}/>
                                                )     
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item label="店长姓名" {...formItemLayout}>
                                            {getFieldDecorator("owner_name", {
                                                rules: [
                                                    { max: 20, message: '不能超过20个字符' },
                                                ], 
                                            })(
                                                shopEdit === false ? (
                                                    <span>{settingData.owner_name}</span>
                                                ) : (
                                                    <HzInput placeholder="20个字内" maxLength={20} className={styles.inputStyle}/>
                                                )
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={8}>
                                        <Form.Item label="商铺logo" {...formItemLayout}
                                            extra={shopEdit !== false&&(<div style={{fontSize: 12}}>建议尺寸：160×160像素，只能上传jpg/jpeg/png文件，图片大小不超过1MB</div>)}
                                        >
                                            {getFieldDecorator("logo_url",{
                                                getValueFromEvent: this.normFileImg,
                                                rules: [{ required: true, message: '请上传商铺logo' }],
                                            })(
                                                shopEdit === false ? (
                                                    <Fragment>
                                                        {
                                                            settingData.logo_url&&(
                                                                <img className={styles.logoUrl} src={`${settingData.logo_url?`//${photoPrefix}/${settingData.logo_url}`:''}`} alt=''/>
                                                            )
                                                        }
                                                    </Fragment>
                                                ) : (
                                                    <Fragment>
                                                        <Upload
                                                            {...uploadProps}
                                                            listType="picture-card"
                                                            fileList={logoFileList}
                                                            onChange={this.handleLogoChange}
                                                            onPreview={this.handlePreview}
                                                        >
                                                            {
                                                                logoFileList.length >= imageNum ? null : uploadButton
                                                            }
                                                        </Upload>
                                                    </Fragment>
                                                )

                                            )}
                                        </Form.Item>
                                    </Col> 
                                    <Col span={8}>
                                        <Form.Item label="联系地址" {...formItemLayout}>
                                            {getFieldDecorator("area", {})(
                                                shopEdit === false ? (
                                                    <span>{`${settingData.province}${' '}${settingData.city}${' '}${settingData.region}${' '}${settingData.address}`}</span>
                                                ) : (
                                                    <div  className={styles.inputStyle}>
                                                        <Cascader 
                                                            options={options} 
                                                            placeholder="省/市/区" 
                                                            value={province&&city&&county?[province, city, county]:[]}
                                                            onChange={this.areaChange}
                                                            popupClassName={styles.myCascader}
                                                        ></Cascader> 
                                                        <Input  value={address} onChange={this.textAdressChange} />
                                                    </div>
                                                )     
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item  {...formItemLayout}>
                                    {
                                        shopEdit === false ? (<Button type='primary' onClick={this.shopEdit}>编辑</Button>) : (
                                            <Fragment>
                                                <Button type='primary' onClick={this.saveShopEdit} style={{ marginRight: 16 }} loading={loading}>保存</Button>
                                                <Button onClick={this.cancelShopEdit}>退出编辑</Button>
                                            </Fragment>
                                        )
                                    }
                                </Form.Item>  
                            </div>
                        </Page.ContentBlock>
                    </div>
                    <div className={styles.warpCon}>
                        <Page.ContentBlock title='首页分享信息' hasDivider={false} style={{marginTop: '-12px'}}>
                            <div className={shareEdit === false ?styles.shareInfo:''}>
                                <Form.Item label="分享文案" {...formItemLayout}  style={{marginTop: '-3px'}}>
                                    {getFieldDecorator("share_text", {
                                        rules: [
                                            { max: 45, message: '不能超过45个字符' },
                                        ],    
                                    })(
                                        shareEdit === false ? (
                                            <span>{settingData.share_text}</span>
                                        ):(
                                            <HzInput placeholder="45个字内" maxLength={45} className={styles.inputStyle}/>
                                        )    
                                    )}
                                </Form.Item> 
                                <Form.Item label="分享图片" {...formItemLayout}
                                    extra={shareEdit!==false&&(<div style={{fontSize: 12}}>建议宽高比：5:4，只能上传jpg/jpeg/png文件，且不超过1MB</div>)}
                                >
                                    {getFieldDecorator("share_logo_url", {
                                        getValueFromEvent: this.normFileImg,
                                    })(
                                        shareEdit === false ? (
                                            <Fragment>
                                                {
                                                    settingData.share_logo_url&&(
                                                        <img className={styles.shareUrl} src={`${settingData.share_logo_url?`//${photoPrefix}/${settingData.share_logo_url}`:''}`} alt=''/>
                                                    )
                                                }
                                            </Fragment>
                                        ) : (
                                            <Fragment>
                                                <Upload
                                                    {...uploadProps}
                                                    listType="picture-card"
                                                    fileList={shareFileList}
                                                    onChange={this.handleShareChange}
                                                    onPreview={this.handlePreview}
                                                >
                                                    {
                                                        shareFileList.length >= imageNum ? null : uploadButton
                                                    }
                                                </Upload> 
                                            </Fragment>
                                        )
                                    )}
                                </Form.Item>
                                <Form.Item  {...formItemLayout}>
                                    {
                                        shareEdit === false ? (
                                            <Button type='primary'  onClick={this.shareEdit}>编辑</Button>
                                        ):(
                                            <Fragment>
                                                <Button type='primary' onClick={this.saveShareEdit} style={{marginRight: 16}} loading={loading}>保存</Button>
                                                <Button onClick={this.cancelShareEdit}>退出编辑</Button>       
                                            </Fragment>
                                        )  
                                    }  
                                </Form.Item> 
                            </div>
                        </Page.ContentBlock> 
                    </div>
                </Form>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal> 
            </Fragment>
        )
    }
}
