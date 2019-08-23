import { Component } from 'react'
import { connect } from 'dva'
import router from 'umi/router'
import safeSetState from 'hoc/safeSetState'
import Page from 'components/business/Page'
import { Form, Input, Upload, Icon, Cascader, Select, Radio, Checkbox, Button, message, notification, InputNumber } from 'antd'
import styles from './index.less'
import _ from 'lodash'
import DocumentTitle from 'react-document-title'
// 富文本编辑器组件
import EditorCon from 'components/EditorCon'
// 标签组件
import TagsComp from '../../../components/TagsComp'
// 规格组件
import StandardComp from '../../../components/StandardComp'
import classnames from 'classnames'
import { jine, amount } from 'utils/display'
import { validatorByIsPositiveMoney } from '../../../../../utils/validator'
import { STATUS } from '../../../services/distributor/distributor_center'

// const InputGroup = Input.Group
const Option = Select.Option
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group

@connect(({ base, add_good }) => ({
    base,
    add_good,
}))
@Form.create()
@safeSetState()
export default class Index extends Component {

    CompRef = null

    constructor(props) {
        super(props)
        this.state = {
            gid: '',
            fileList: [],
            checkboxGroup: [],
            categoryDefault: [],
            checkboxGroupNum: {
                free_return: 2,
                genuine_article: 2,
                quick_delivery: 2,
            },
            weight: '',
            weightUnit: 1,
            postageUnit: 3, // 选择的哪个邮费方式，3为免邮，2是用邮费模板，1为自定义邮费
            postageTemplateId: undefined, // 邮费模板id
            postageTemplateRule: 1, // 邮费模板是否为重量模板，2为重量
            postageUnitInput: false, // 是否显示邮费重量模块
            customPostage: '', // 自定义邮费
            hasSpec: false,
            isCommission: false
        }
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'add_good/initEditData'
        })

        this.props.dispatch({
            type: 'add_good/getToken',
            payload: {
                type: 'image',
            }
        })

        this.getPostage()
        this.props.dispatch({
            type: 'add_good/getCategory',
            payload: {},
            callback: (res) => {
                if (this.props.location.query && this.props.location.query.gid) {
                    let gid = this.props.location.query.gid
                    this.setState({ gid: gid })
                    this.getGoods(gid)
                } else {
                    this.props.dispatch({
                        type: 'add_good/setProperty',
                        payload: {
                            data: {},
                            weight: '',
                            weightUnit: 1,
                        }
                    })
                }
            }
        })

        this.getCenterList()
    }

    // 佣金比例
    getCenterList = () => {
        this.props.dispatch({
            type: 'distributor_center/centerList',
            payload: {},
            callback: (data) => {
                if (data.created_at && data.status === STATUS.isStatus) {
                    this.setState({
                        isCommission: true
                    })
                }
            }
        })
    }

    // 获取邮费模板
    getPostage = () => {
        this.props.dispatch({
            type: 'add_good/getPostage',
            payload: {},
        })
    }

    // 获取商品信息
    getGoods = (id) => {
        this.props.dispatch({
            type: 'add_good/getGoods',
            payload: {
                id: id
            },
            callback: (res) => {
                // console.log(res)
                const photoPrefix = this.props.add_good.photoPrefix
                const checkboxGroup = this.state.checkboxGroup
                if (res) {
                    let fileList = []
                    for (let v of res.goods_images) {
                        fileList.push({ uid: -v.id, id: v.id, status: 'done', url: `//${photoPrefix}/${v.icon_url}`, key: v.icon_url })
                    }

                    // 佣金比例
                    if (res.commission_rate) {
                        this.props.form.setFieldsValue({
                            commission_rate: res.commission_rate
                        })
                    }

                    // 营销活动提醒
                    if (res.activity_join && res.activity_join.length > 0) {
                        let string = ''
                        let arr = res.activity_join
                        if (arr.length === 1) {
                            string = arr[0] === 1 ? '拼团' : (arr[0] === 2 ? '砍价' : (arr[0] === 3 ? '特价' : '秒杀'))
                        } else if (arr.length === 2) {
                            string = arr[0] === 1 ? '拼团等' : (arr[0] === 2 ? '砍价等' : (arr[0] === 3 ? '特价等' : '秒杀等'))
                        }
                        notification.info({
                            message: '提示',
                            description: '此商品已参与了' + string + '活动，参加营销活动中的商品，不可再次编辑。',
                        })
                    }

                    if (res.free_return === 1) {
                        checkboxGroup.push('7天包退换')
                    }
                    if (res.genuine_article === 1) {
                        checkboxGroup.push('100%正品')
                    }
                    if (res.quick_delivery === 1) {
                        checkboxGroup.push('24小时发货')
                    }

                    if (res.spec_a !== null) {
                        this.setState({
                            hasSpec: true
                        })
                    }

                    // 邮费
                    if (res.is_free_express === 1) {
                        this.setState({ postageUnit: 3 })
                    } else if (res.postage_temp_id) {
                        const { postageList } = this.props.add_good
                        this.setState({
                            postageUnit: 2,
                            postageTemplateId: res.postage_temp_id || undefined
                        })
                        for (let v of postageList) {
                            if (res.postage_temp_id === v.id) {
                                if (v.rule === 2) {
                                    this.setState({
                                        postageTemplateRule: 2,
                                        postageUnitInput: true,
                                    })
                                }
                            }
                        }
                    } else {
                        this.setState({
                            postageUnit: 1,
                            customPostage: res.free_express_price || undefined
                        })
                    }

                    let postageUnit = 3
                    if (res.is_free_express === 2) {
                        if (res.postage_temp_id) {
                            postageUnit = 2
                        } else {
                            postageUnit = 1
                        }
                    }

                    this.setState({
                        fileList,
                        weight: res.weight,
                        postageUnit: postageUnit,
                        checkboxGroup,
                    })
                    this.setCategory(res.category_id)
                    this.props.form.setFieldsValue({
                        postageTemplateId: res.postage_temp_id,
                        customPostage: res.free_express_price === 0 ? '' : jine(res.free_express_price, "0.00", amount.unit.Fen)
                    })
                }
            }
        })
    }

    // 设置商品类目
    setCategory = (category_id) => {
        const { categoryList } = this.props.add_good
        const { categoryDefault } = this.state
        if (category_id) {
            for (let v of categoryList) {
                if (v.id === category_id) {
                    categoryDefault.push(v.id)
                    this.setState({
                        categoryDefault
                    })
                    break
                } else {
                    if (v.children && v.children.length > 0) {
                        for (let w of v.children) {
                            if (w.id === category_id) {
                                categoryDefault.push(v.id)
                                categoryDefault.push(w.id)
                                this.setState({
                                    categoryDefault
                                })
                                break
                            }
                        }
                    }
                }
            }
        }
    }
    // 商品图片删除
    handleRemove = (file) => {
        const { fileList } = this.state
        for (let [i, v] of fileList.entries()) {
            if (v.uid === file.uid) {
                fileList.splice(i, 1)
                this.setState({ fileList }, () => {
                    this.props.form.validateFields(['images'], { force: true })
                })
                return
            }
        }
    }
    // 商品图片上传
    handleChange = (info) => {
        const { fileList } = info
        const photoPrefix = this.props.add_good.photoPrefix

        if (info.file.status === 'uploading') {
            this.setState({ fileList })
        }

        if (info.file.status === 'done') {
            fileList.map((file) => {
                if (file.response) {
                    file.url = `//${photoPrefix}/${file.response.key}`
                    file.key = file.response.key
                }
                return file
            })

            this.setState({ fileList })
        }
    }

    beforeUpload = (file, fileList) => {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
        if (!isJPG) {
            message.error('只能上传jpg和png格式的图片！')
        }
        const isLt2M = file.size / 1024 / 1024 < 2
        if (!isLt2M) {
            message.error('图片大小不能超过2MB！')
        }
        const maxPic = this.state.fileList.length + fileList.length <= 10
        if (!maxPic) {
            message.error('最多只能上传10张图片！')
        }

        return isJPG && isLt2M && maxPic
    }

    changeQuill = (html) => {
        this.props.form.setFieldsValue({
            content: html
        })
    }
    onChangeTag = (data) => {
        this.props.form.setFieldsValue({
            keywords: data
        })
    }

    registerComp = (comp) => {
        this.CompRef = comp
    }


    onOkHander = () => {
        this.CompRef.getDatas().then((guiges) => {
            // console.log(`获取到：`, guiges)
            if (guiges) {
                if (guiges.specificassdt && guiges.specificassdt.length > 0) {
                    let sku = []
                    let specs = []

                    sku = guiges.specificassdt
                    specs = guiges.specificat.map((item, index) => {
                        return {
                            spec: item.name,
                            property: item.value
                        }
                    })
                    this.submitData(sku, specs)
                } else {
                    this.submitData()
                }
            }
        }).catch((err) => {
            this.submitData()
        })
    }

    submitData = (sku, specs) => {
        this.props.form.validateFields((err, values) => {
            // console.log('Received values of form: ', values)
            if (!err) {
                const { checkboxGroupNum, postageTemplateRule, postageUnit } = this.state
                const { customPostage, postageTemplateId } = values
                let id = this.props.location.query && this.props.location.query.gid
                this.getPromise(values.promise)

                const data = {
                    type: 1,
                    name: values.name || '',
                    description: values.description || '',
                    goods_images: this.getImages(),
                    category_id: values.category[values.category.length - 1],
                    content: values.content || '',
                    // weight: this.getWeightGram(),
                    no: values.no || '',
                    unit: values.quantifier || '',
                    keywords: values.keywords || [],
                    display_price: values.minPrice && values.minPrice * 100,
                    stock_shown: values.remaindShow,
                    status: values.onShelf,
                    is_recommend: values.is_recommend,
                    // 商家承诺
                    free_return: checkboxGroupNum.free_return,
                    genuine_article: checkboxGroupNum.genuine_article,
                    quick_delivery: checkboxGroupNum.quick_delivery,
                    // 佣金比例
                    commission_rate: values.commission_rate,
                    virtual_sales: values.virtualSale || 0
                }
                // 判断邮费使用的方式，免邮费则发送is_free_express字段为1，不免则发送模板id或者固定邮费金额
                if (postageUnit === 3) {
                    data.is_free_express = 1
                } else if (postageUnit === 1) {
                    data.is_free_express = 2
                    data.free_express_price = customPostage * 100
                } else if (postageUnit === 2) {
                    data.is_free_express = 2
                    data.postage_temp_id = postageTemplateId
                    if (postageTemplateRule === 2) {
                        data.weight = values.weight * 1000
                    }
                }

                // 判定有没有sku规格，若没有则发送总的价格和库存
                if (sku) {
                    data.sku = sku
                    data.specs = specs
                } else {
                    data.price = values.price * 100
                    data.stock_count = values.stock_count
                }

                // 判断是否有id，如有则发送修改商品的字段
                if (id) {
                    const oldData = this.props.add_good.data

                    data.id = id
                    data.old_sku_ids = oldData.old_sku_ids
                    data.image_ids = oldData.image_ids
                    data.sku_ids = oldData.sku_ids
                    data.goods_detail_id = oldData.goods_detail_id
                } else {
                    data.sync_feed_status = values.dynamic === 1 ? true : false // 是否同步动态
                }

                if (id) {
                    this.props.dispatch({
                        type: 'add_good/modifyGoods',
                        payload: data,
                        callback: (res) => {
                            if (!res.error) {
                                router.push('/mall/goods_management')
                            }
                        }
                    })
                } else {
                    this.props.dispatch({
                        type: 'add_good/createGoods',
                        payload: data,
                        callback: (res) => {
                            if (!res.error) {
                                router.push('/mall/goods_management')
                            }
                        }
                    })
                }
            }
        })
    }

    getImages = () => {
        const { fileList } = this.state
        if (fileList) {
            const goods_images = []
            for (let v of fileList) {
                goods_images.push({ id: v.id || '', url: v.key })
            }
            return goods_images
        }
    }
    getWeightGram = () => {
        let { weight, weightUnit } = this.state
        if (window.parseInt(weightUnit) === 2) {
            weight = weight * 1000
        } else if (window.parseInt(weightUnit) === 3) {
            weight = weight * 1000000
        }

        return weight
    }
    getPromise = (promise) => {
        let checkboxGroupNum = this.state.checkboxGroupNum
        for (let v of promise) {
            if (v === '7天包退换') {
                checkboxGroupNum.free_return = 1
            }
            if (v === '100%正品') {
                checkboxGroupNum.genuine_article = 1
            }
            if (v === '24小时发货') {
                checkboxGroupNum.quick_delivery = 1
            }
        }
        this.setState({ checkboxGroupNum })
    }

    onCancelHander = () => {
        router.push('/mall/goods_management')
    }

    validatorImage = (rule, value, callback) => {
        const { fileList } = this.state
        if (fileList.length === 0) {
            callback('请上传图片')
        } else {
            callback()
        }
    }

    validatorCustomPostage = (rule, value, callback) => {
        const { postageUnit } = this.state

        if (postageUnit === 1) {
            if (!value) {
                callback('自定义，邮费必填')
            } else {
                validatorByIsPositiveMoney(rule, value, callback)
            }
        } else {
            callback()
        }
    }

    validatorPostageTemplate = (rule, value, callback) => {
        const { postageUnit } = this.state

        if (postageUnit === 2 && !value) {
            callback('请选择模板')
        } else {
            callback()
        }
    }

    validatorGreeThenZero = (rule, value, callback) => {
        if (value) {
            const number = value - 0
            if (number > 0) {
                callback()
            } else {
                callback('必须大于0')
            }
        } else {
            callback()
        }
    }

    virtualSaleValidate = (rule, value, callback) => {
        if (value && !/^\d+$/.test(value)) {
            callback('请输入数字')
        } else {
            callback()
        }
    }

    onPostageTemplateChange = (val) => {
        this.setState({
            postageTemplateId: window.parseInt(val)
        })
        for (let v of this.props.add_good.postageList) {
            if (v.id === window.parseInt(val)) {
                this.setState({
                    postageTemplateRule: v.rule
                })
                if (v.rule === 2 && this.state.postageUnit === 2) {
                    this.setState({
                        postageUnitInput: true
                    })
                } else {
                    this.setState({
                        postageUnitInput: false
                    })
                }
                break
            }
        }
    }
    onPostageChange = (e) => {
        this.setState({
            postageUnit: e.target.value
        }, () => {
            this.props.form.validateFields(['customPostage', 'postageTemplateId'], { force: true })
        })
        if (this.state.postageTemplateRule === 2 && e.target.value === 2) {
            this.setState({
                postageUnitInput: true
            })
        } else {
            this.setState({
                postageUnitInput: false
            })
        }
    }
    onChangeWeightUnit = (val) => {
        this.setState({
            weightUnit: val
        })
    }
    onChangeWeight = (e) => {
        // console.log(e.target.value)
        this.setState({
            weight: e.target.value
        })
    }
    onCustomPostageChange = (e) => {
        this.setState({
            customPostage: e.target.value
        })
    }

    // 获取spec
    onChangeSpec = (spec) => {
        if (spec && spec.length > 0) {
            this.setState({
                hasSpec: true
            })
        } else {
            this.setState({
                hasSpec: false
            })
        }
    }

    onChangeSkuHandler = (skus) => {
        const stock_count = skus.reduce((prev, current, index) => {
            return prev + current.stock_count
        }, 0)

        const price = _.min(skus.map(item => item.price))

        this.props.form.setFieldsValue({
            price: jine(price, '0.00', amount.unit.Fen),
            stock_count: stock_count
        })
    }

    // 自定义邮费模块验证
    postageValidator = (rule, value, callback) => {
        const { postageTemplateId, customPostage } = this.state
        if (value === 1 && !customPostage) {
            callback('请填写自定义邮费！')
        } else if (value === 2 && !postageTemplateId) {
            callback('请选择邮费模板！')
        }
        callback()
    }

    onAddTemp = () => {
        window.open('/mall/carriage/carriage_model', '_blank')
    }

    stopPropagationAndPreventDefault = (e) => {
        e.stopPropagation()
        e.preventDefault()
    }

    // 输入佣金比例
    formatterInteger = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) > 0 && Number(value) <= 100)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value > 0 && Number(value) <= 100)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    render() {
        // 上传图片的token
        const { photoToken, data, categoryList, photoPrefix, postageList } = this.props.add_good

        const { getFieldDecorator } = this.props.form
        const { fileList, categoryDefault, postageUnit, postageTemplateId, gid } = this.state

        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: ".jpg,.png",
            headers: {},
            data: {
                token: photoToken,
            },
            listType: "picture-card",
            multiple: true,
            beforeUpload: this.beforeUpload,
            onChange: this.handleChange,
            onRemove: this.handleRemove,
            fileList: fileList,
            className: "avatar-uploader",
        }

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
        const PageTitle = ({ title }) => {
            return <div className={styles.pageTitle}>{title}</div>
        }

        const postageTemplateOption = postageList.map(template => <Option key={template.id} value={template.id}>{template.rule === 1 ? '按件' : '按重'}：{template.name}</Option>)

        return (<DocumentTitle title={gid ? '编辑商品' : '新增商品'}>
            <Page>
                <Page.ContentHeader
                    hasGutter={false}
                    breadcrumbData={[{
                        name: '商品管理',
                        path: '/mall/goods_management'
                    }, {
                        name: gid ? '编辑商品' : '新增商品'
                    }]}
                />
                <Form style={{ marginTop: 16 }}>
                    <PageTitle title='基本信息' />
                    <Form.Item label="商品名称" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("name", {
                            rules: [
                                { required: true, message: '请填写标题' },
                            ],
                            initialValue: data.name,
                        })(
                            <Input placeholder='输入商品名称（最多30个字符）' className={styles.inputClass} maxLength={30} />
                        )}
                    </Form.Item>
                    <Form.Item label="分享描述" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("description", {
                            initialValue: data.description,
                        })(
                            <Input placeholder='输入商品描述' className={styles.inputClass} maxLength={30} />
                        )}
                    </Form.Item>
                    <Form.Item label="商品图片" {...formItemLayout} style={{ marginTop: 16 }}
                        extra={(<div>建议尺寸：800*800像素，最多上传10张，图片大小请控制在2MB以内，支持jpg、jpeg、png格式的图片</div>)}
                    >
                        {getFieldDecorator("images", {
                            rules: [
                                { required: true, validator: this.validatorImage, message: '请上传商品图片' }
                            ],
                            initialValue: fileList,
                        })(
                            <Upload
                                {...uploadProps}
                            >
                                {fileList.length >= 10 ? null : <div>
                                    <Icon type='plus' style={{ fontSize: 32 }} />
                                    <div className="ant-upload-text">上传图片</div>
                                </div>
                                }

                            </Upload>
                        )}
                    </Form.Item>
                    <Form.Item label="商品类目" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("category", {
                            initialValue: categoryDefault,
                        })(
                            <Cascader
                                options={categoryList}
                                expandTrigger="hover"
                                fieldNames={{ label: 'name', value: 'id' }}
                                placeholder="请选择"
                                style={{ width: 240 }} />
                        )}
                    </Form.Item>
                    <Form.Item label="商品卖点" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("content", {
                            initialValue: data.content,
                        })(
                            <EditorCon key={'content' + data.id + data.content} placeholder='输入内容...' ref={node => this.textRefs = node} changeQuill={this.changeQuill} content={this.props.form.getFieldValue('content') || ''} photoPrefix={photoPrefix} photoToken={photoToken} />
                        )}
                    </Form.Item>
                    {/* <Form.Item label="商品重量" {...formItemLayout} style={{marginTop: 16}}>
                        {getFieldDecorator("weight",{
                            // rules: [{enum: 'number', message: '商品重量必须是数字！'}]
                        })(
                            <InputGroup compact className={styles.inputClass}>
                                <Input placeholder='请输入商品重量' value={this.state.weight} style={{ width: '70%' }} onChange={this.onChangeWeight}/>
                                <Select defaultValue="1" style={{ width: '30%' }} onChange={this.onChangeWeightUnit}>
                                    <Option value="1">克</Option>
                                    <Option value="2">千克</Option>
                                    <Option value="3">吨</Option>
                                </Select>
                            </InputGroup>
                        )}
                    </Form.Item> */}
                    <Form.Item label="唯一编码" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("no", {
                            initialValue: data.no,
                        })(
                            <Input placeholder='商品的唯一编码' className={styles.inputClass} maxLength={50} />
                        )}
                    </Form.Item>
                    <Form.Item label="商品量词" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("quantifier", {
                            initialValue: data.unit,
                        })(
                            <Input placeholder='请输入商品量词' className={styles.inputClass} maxLength={4} />
                        )}
                    </Form.Item>
                    <Form.Item label="关键字" {...formItemLayout} style={{ marginTop: 16 }}
                        extra={(<div>输入完成后，按“回车键”确认</div>)}
                    >
                        {getFieldDecorator("keywords", {
                            initialValue: data.keywords,
                        })(
                            <TagsComp key={'keywords' + data.id + JSON.stringify(data.keywords)} error={'关键字'}  text={''} onChangeTag={this.onChangeTag} tags={this.props.form.getFieldValue('keywords') || []}></TagsComp>
                        )}
                    </Form.Item>


                    <PageTitle title='价格库存' />

                    <StandardComp
                        key={'StandardComp' + data.id + JSON.stringify(data.sku)}
                        photoToken={photoToken}
                        onChangeSpec={this.onChangeSpec}
                        onChangeSku={this.onChangeSkuHandler}
                        parent={this}
                        data={data}
                    />
                    <Form.Item label="商品价格" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("price", {
                            rules: [
                                { required: !this.state.hasSpec, message: '请填写商品价格' },
                                { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '价格必须为数字，且小数最多只能有2位' },
                                { validator: this.validatorGreeThenZero, message: '必须大于0元' }
                            ],
                            validateFirst: true,
                            initialValue: data.price ? jine(data.price, '0.00', 'Fen') : ''
                        })(
                            <Input disabled={this.state.hasSpec || (data.activity_join && data.activity_join.length > 0)} className={styles.inputClass} maxLength={15} />
                        )}
                    </Form.Item>
                    <Form.Item label="划线价格" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("minPrice", {
                            rules: [
                                { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: '划线价格必须为数字，且小数最多只能有2位' },
                                { validator: this.validatorGreeThenZero, message: '必须大于0元' }
                            ],
                            validateFirst: true,
                            initialValue: data.display_price ? jine(data.display_price, '0.00', 'Fen') : ''
                        })(
                            <Input className={styles.inputClass} maxLength={15} />
                        )}
                    </Form.Item>
                    <Form.Item label="库存" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("stock_count", {
                            rules: [
                                { required: !this.state.hasSpec, message: '请填写商品库存' },
                                { pattern: /^([1-9]\d*)$|^0$/, message: '库存必须是正整数，或为0' }
                            ],
                            initialValue: data.stock_count
                        })(
                            <Input disabled={this.state.hasSpec} className={styles.inputClass} maxLength={8} />
                        )}
                    </Form.Item>
                    <Form.Item label="库存显示" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("remaindShow", {
                            initialValue: data.stock_shown || 1
                        })(
                            <RadioGroup>
                                <Radio value={1}>显示</Radio>
                                <Radio value={2}>不显示</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    <Form.Item label="虚拟销量" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("virtualSale", {
                            initialValue: data.virtual_sales || 0,
                            rules: [
                                {
                                    validator: this.virtualSaleValidate
                                }
                            ]
                        })(
                            <InputNumber min={0} className={styles.inputClass} />
                        )}
                    </Form.Item>


                    <PageTitle title='其他信息' />
                    <Form.Item label="快递邮费" {...formItemLayout} style={{ marginTop: 16 }}>
                        <RadioGroup value={this.state.postageUnit} className={styles.postageModule} onChange={this.onPostageChange}>
                            <Radio className={classnames(styles.radioStyle, styles.radioinlinelistitem)} value={1}>
                                <span className={styles.radioinlinelistitemcontain} >
                                    <span className={styles.explain} style={{ width: '4em' }}>自定义</span>
                                    <span className={styles.radioinlinelistitemcontorl} onClick={this.stopPropagationAndPreventDefault}>
                                        <Form.Item>
                                            {getFieldDecorator("customPostage", {
                                                rules: [{ validator: this.validatorCustomPostage }],
                                            })(
                                                <Input addonBefore="￥" placeholder='请输入自定义邮费' style={{ width: 240 }} maxLength={10} />
                                            )}
                                        </Form.Item>
                                    </span>
                                    <span className={styles.radioinlinelistitemauto} onClick={this.stopPropagationAndPreventDefault}>&nbsp;</span>
                                </span>
                            </Radio>

                            <Radio className={classnames(styles.radioStyle, styles.radioinlinelistitem)} value={2}>
                                <span className={styles.radioinlinelistitemcontain}>
                                    <span className={styles.explain} style={{ width: '4em' }}>使用模板</span>
                                    <span className={styles.radioinlinelistitemcontorl}>
                                        <Form.Item>
                                            {getFieldDecorator("postageTemplateId", {
                                                rules: [{ validator: this.validatorPostageTemplate, message: '请选择模板' }],
                                            })(
                                                <Select onChange={this.onPostageTemplateChange} placeholder='请选择模板' style={{ marginRight: 16, width: 240 }}>
                                                    {postageTemplateOption}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </span>
                                    <span onClick={this.stopPropagationAndPreventDefault}><a onClick={this.onAddTemp} className={styles.toAdd}>添加模板</a></span>
                                </span>

                            </Radio>
                            <Radio className={classnames(styles.radioStyle, styles.radioinlinelistitem)} value={3}>
                                <span className={styles.radioinlinelistitemcontain}>
                                    免邮费
                                    <span className={styles.radioinlinelistitemauto} onClick={this.stopPropagationAndPreventDefault}>&nbsp;</span>
                                </span>
                            </Radio>
                        </RadioGroup>
                    </Form.Item>
                    {this.state.postageUnitInput &&
                        <Form.Item label="物流重量" {...formItemLayout} style={{ marginTop: 16 }}>
                            {getFieldDecorator("weight", {
                                rules: [
                                    { required: true, message: '请填写物流重量！' },
                                    { pattern: /^[0-9]+(\.[0-9]{1,3})?$/, message: '请输入数字, 小数最多只能有3位' },
                                    { validator: this.validatorGreeThenZero, message: '物流重量必须大于0' }
                                ],
                                initialValue: data.weight ? data.weight / 1000 : ''
                            })(
                                <Input addonBefore="Kg" style={{ width: 240 }} placeholder="所有商品的统一重量" />
                            )}
                        </Form.Item>
                    }
                    <Form.Item label="是否上架" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("onShelf", {
                            rules: [{ required: true, message: '请选择是否上架该商品' }],
                            initialValue: data.status || 1
                        })(
                            <RadioGroup disabled={data.activity_join && data.activity_join.length > 0}>
                                <Radio value={1}>上架</Radio>
                                <Radio value={2}>不上架</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    {/* {!this.state.gid &&
                        <Form.Item label="同步动态" {...formItemLayout} style={{marginTop: 16}}>
                            {getFieldDecorator("dynamic",{
                                rules: [{ required: true, message: '请选择是否同步动态' }],
                                initialValue: 1
                            })(
                                <RadioGroup>
                                    <Radio value={1}>同步</Radio>
                                    <Radio value={2}>不同步</Radio>
                                </RadioGroup>
                            )}
                        </Form.Item>
                    } */}
                    <Form.Item label="是否推荐" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("is_recommend", {
                            rules: [{ required: true, message: '请选择是否同步动态' }],
                            initialValue: data.is_recommend === 1 ? 1 : 0
                        })(
                            <RadioGroup>
                                <Radio value={1}>推荐</Radio>
                                <Radio value={0}>不推荐</Radio>
                            </RadioGroup>
                        )}
                    </Form.Item>
                    <Form.Item label="商家承诺" {...formItemLayout} style={{ marginTop: 16 }}>
                        {getFieldDecorator("promise", {
                            initialValue: this.state.checkboxGroup,
                        })(
                            <CheckboxGroup options={['7天包退换', '100%正品', '24小时发货']}></CheckboxGroup>
                        )}
                    </Form.Item>
                    {
                        this.state.isCommission ?
                            <Form.Item {...formItemLayout} label="佣金比例">
                                {getFieldDecorator('commission_rate', {})(
                                    <InputNumber
                                        min={0} max={100}
                                        formatter={this.formatterInteger}
                                        parser={this.formatterInteger}
                                        placeholder="建议设置1%-4%"
                                        style={{ width: 140 }}
                                    />
                                )}
                                <span className='hz-margin-small-left-right'>%</span>
                            </Form.Item> : ''
                    }
                    <Form.Item  {...formItemLayout} style={{ marginTop: 16 }}>
                        <Button type='primary' onClick={this.onOkHander}>保存</Button>
                        <Button style={{ marginLeft: 16 }} onClick={this.onCancelHander}>返回</Button>
                    </Form.Item>
                </Form>
            </Page>
        </DocumentTitle>
        )
    }
}
