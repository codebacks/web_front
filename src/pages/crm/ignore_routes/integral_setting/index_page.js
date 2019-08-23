/**
 **@time: 2018/12/18
 **@Description:积分设置
 **@author: yecuilin
 */
import React, {Component} from 'react'
import Page from '@/components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import { Form, Radio, DatePicker, Select, Input, Button, Switch ,message,InputNumber,Modal} from 'antd'
import { connect } from 'dva'
import styles from './index.less'
import {objToForm} from '@/pages/platform/utils/form'
import classNames from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import TextAreaCount from '@/components/TextAreaCount'
// import {PLATFORM_TYPE} from '../../../../common/shopConf'
import {getPlatformTypeByVal,PLATFORM_TYPE} from '../../services/integral'
import router from 'umi/router'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option


@connect(({ base , crm_intergral}) => ({
    base,
    crm_intergral
}))
@documentTitleDecorator()
@Form.create()

export default class Index extends Component{
    constructor(props){
        super(props)
        this.state = {
            points_period: false,    
            saving: false,       
            explain:'',//编辑说明
            visible:false,
            onOkUrl: '',  
            content:'',  
            deleteShops:false,
            deleteGzh:false,
            defaultShopValue:''
        }
    }
    /**页面事件 */
    componentDidMount(){
        const promises = [
            this.getAuthshops(),
            this.getGzhList(),
            this.getSettingData()
        ]

        Promise.all(promises).then(() => {
            this.initForm()
            const { getFieldValue,validateFields } = this.props.form
            if(getFieldValue('shoppingSwitch')){
                validateFields(['shops'], { force: true })
            }
            if(getFieldValue('focusSwitch')){
                validateFields(['attentionSelect'], { force: true })
            }

            
        })
    }

    initForm = () => {
        const { props } = this
        const formObj = objToForm(
            _.get(this.props,'crm_intergral.getsettingData',{}),
            ['bindSwitch','bindSelect','bindInput','shoppingSwitch','shops','shoppingSelect','shoppingInteInput','focusSwitch','attentionSelect','attentionInput','explain',{
                name:'bindSwitch',convert:function(value,model){
                    if(model.details && model.details.bind){
                        if(model.details.bind.type){
                            return model.details.bind.type ? true : false
                        }else{
                            return false
                        }   
                    }else{
                        return false
                    }
                }
            },{
                name:'bindSelect',convert:function(value,model){
                    if(model.details && model.details.bind){
                        if(model.details.bind.type_id){
                            return model.details.bind.type_id.split(',').map(item => {
                                return (item - 0)
                            })
                        }else{
                            return []
                        }
                    }else{
                        return []
                    }
                }
            },{
                name:'bindInput',convert:function(value,model){
                    if(model.details && model.details.bind){
                        if(model.details.bind.type){
                            return model.details.bind.get_points/100
                        }else{
                            return
                        }
                    }else{
                        return
                    }
                }
            },{
                name:'shoppingSwitch',convert:function(val,model){
                    if(model.details && model.details.buy){
                        if(model.details.buy.type){
                            return model.details.buy.type ? true : false
                        }else{
                            return false
                        }
                    }else{
                        return false
                    }
                }
            },{
                name:'shops',convert:function(val,model){
                    if(model.details){
                        if(model.details.buy && model.details.buy.type_id){
                            const {getAuthshops } = props.crm_intergral
                            //判断是否删除店铺 或者公众号
                            if(!getAuthshops.length){
                                //全部删光了店铺
                                return []
                            }else{
                                let shops = model.details.buy.type_id.split(',')
                                let shops_id = getAuthshops.map(v => v.id)
                                let total = shops_id.concat(shops_id)
                                let count = 0,obj = {}                       
                                total.forEach(i=>{
                                    if(!obj[i]){
                                        obj[i] = true
                                    }else{
                                        count ++
                                    }
                                })
                                if(count > 0){
                                    // 店铺id 和 接口返回的店铺id 查重 如果一个都一样 select的默认值为[]
                                    // 去掉接口里面返回，且授权店铺不存的id
                                    // console.log(shops, shops_id)
                                    // ["10090", "10089", "10088", "112", "102"] 
                                    // [10090, 10089, 10088, 112, 102]
                                    for(let i=shops.length-1; i>=0; i--){
                                        let validate = false
                                        shops_id.forEach((v,k)=>{
                                            if(v === + shops[i]){
                                                validate = true
                                            }
                                        })
                                        if(!validate){
                                            shops.splice(i,1)
                                        }
                                    }
                                    return shops.map(item => {
                                        return (item - 0)
                                    })
                                }else{
                                    return []
                                }
                            } 
                        }else{
                            return []
                        }
                    }else{
                        return []
                    }
                }
            },{
                name:'shoppingSelect',convert:function(val,model){
                    if(model.details){
                        if(model.details.buy){
                            return model.details.buy.cost/100
                        }else{
                            return
                        }
                    }else{
                        return
                    }
                }
            },{
                name:'shoppingInteInput',convert:function(val,model){
                    if(model.details){
                        if(model.details.buy && model.details.buy.get_points){
                            return model.details.buy.get_points/100
                        }else{
                            return 
                        }
                    }else{
                        return 
                    }
                }
            },{
                //关注送积分 -Swicth
                name:'focusSwitch',convert:function(val,model){
                    if(model.details && model.details.subscribe.type){
                        return model.details.subscribe.type ? true : false
                    }
                }
            },{
                name:'attentionSelect',convert:function(val,model){
                    if(model.details){
                        if(model.details.subscribe && model.details.subscribe.type_id){
                            const { getGzhList } = props.crm_intergral
                            
                            //判断是否删除公众号
                            if(!getGzhList.length){
                                //全部删光了公众号
                                return []
                            }else{
                                let gzh = model.details.subscribe.type_id.split(',')
                                let gzh_appid = getGzhList.map(v => v.app_id)
                                let total = gzh.concat(gzh_appid)
                                let count = 0,obj = {}                       
                                total.forEach(i=>{
                                    if(!obj[i]){
                                        obj[i] = true
                                    }else{
                                        count ++
                                    }
                                })
                                if(count > 0){
                                    // 公众号id 和 接口返回的店铺id 查重 如果一个都一样 select的默认值为[]
                                    return gzh.map(item => {
                                        return item
                                    })
                                }else{
                                    return []
                                }
                            }
                        }else{
                            return []
                        }
                    }else{
                        return []
                    }
                }
            },{
                name:'attentionInput',convert:function(val,model){
                    if(model.details){
                        if(model.details.subscribe && model.details.subscribe.get_points){
                            return model.details.subscribe.get_points/100
                        }else{
                            return 
                        }
                    }
                }
            },{
                name:'signinSwitch',convert:function(val,model){
                    if(model.details && model.details.sign){
                        if(model.details.sign.type){
                            return model.details.sign.type ? true : false
                        }else{
                            return false
                        }
                    }else{
                        return false
                    }
                }
            },{
                name:'day_sign_get_points',convert:function(val,model){
                    if(model.details){
                        if(model.details.sign && model.details.sign.day_sign_get_points){
                            return model.details.sign.day_sign_get_points/100
                        }else{
                            return 
                        }
                    }
                }
            },{
                name:'keep_sign_day',convert:function(val,model){
                    if(model.details){
                        if(model.details.sign && model.details.sign.keep_sign_day){
                            return model.details.sign.keep_sign_day
                        }else{
                            return 
                        }
                    }
                }
            },{
                name:'keep_sign_get_points',convert:function(val,model){
                    if(model.details){
                        if(model.details.sign && model.details.sign.keep_sign_get_points){
                            return model.details.sign.keep_sign_get_points/100
                        }else{
                            return 
                        }
                    }
                }
            },{
                name:'explain',convert:function(val,model){
                    return model.description
                }
            }]
        )
        this.props.form.setFieldsValue(formObj)
    }

    // 设置信息
    getSettingData = () =>{
        return this.props.dispatch({
            type:'crm_intergral/getsettingData'
        })
    }
    // 授权店铺
    getAuthshops = () =>{
        return this.props.dispatch({
            type:'crm_intergral/getAuthshops',
            payload:{
                // auth_status:2
                offset:0,
                limit:200
            }
        })
    }
    // 获取公众号
    getGzhList = () =>{
        return this.props.dispatch({
            type:'crm_intergral/getGzhList'
        })
    }
    // 点击积分
    // changeRatio = (e) =>{
    //     this.setState({
    //         points_period:e.target.value === 1 ? true : false
    //     })
    // }

    // 点击 示例文字
    handleTextChange = () => {
        this.props.form.setFieldsValue({
            explain: `积分说明：\n1.积分目前有以下获取方式：绑定购物平台账号、购物、参与营销活动等几种形式。\n2.用户可以使用积分参与营销活动，获得现金或者实物奖励。\n3.积分由商家发放、核销，最终解释权归属于商家。\n4.积分一旦兑换提交，将自动扣除，奖品如有问题，可联系商家处理。`
        })
        this.setState({
            explain: `积分说明：\n1.积分目前有以下获取方式：绑定购物平台账号、购物、参与营销活动等几种形式。\n2.用户可以使用积分参与营销活动，获得现金或者实物奖励。\n3.积分由商家发放、核销，最终解释权归属于商家。\n4.积分一旦兑换提交，将自动扣除，奖品如有问题，可联系商家处理。`
        })
    }
    // 输入正整数
    formatterInt = (value) => {
        const reg = /[^\d]/g
        let count = ''
        if (typeof value === 'string' && (Number(value) >= 1)){
            count = !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1)) {
            count = !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            count = ''
        }
        return count
    }
    formatterIntFive = (value) =>{
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 99999)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 99999)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    formatterIntThree = (value) =>{
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 99)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 99)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }
    // 点击提交
    handleSubmit = (e) =>{
        e.preventDefault()
        this.props.form.validateFields({force: true},(err, values) => {
            // 判断是否开启绑定
            if(!err){
                let setForm  = {}
                let detail_bind = {},detail_shopping = {},detail_focus = {},signin = {}
                if(values.bindSwitch){
                    detail_bind = {
                        type:'1',
                        type_id:values.bindSelect,
                        get_points:values.bindInput*100
                    }
                    if(values.bindSelect[0] === 'all'){
                        let platform_id = PLATFORM_TYPE.map(v =>v.value).join(',')
                        detail_bind.type_id = platform_id
                    }else{
                        let ids = values.bindSelect.map(item => item)
                        detail_bind.type_id = ids.join(',')
                    }
                }else{
                    detail_bind = {}
                }
                if(values.shoppingSwitch){
                    detail_shopping = {
                        type:'2',
                        type_id:values.shops,
                        cost:values.shoppingSelect*100,
                        get_points:values.shoppingInteInput*100
                    }
                    if(values.shops[0] === 'all'){
                        const { getAuthshops } = this.props.crm_intergral
                        let ids = getAuthshops.map(item => item.id)
                        detail_shopping.type_id = ids.join(',')
                    }else{
                        detail_shopping.type_id = values.shops.join(',')
                    }
                }else{
                    detail_shopping = {}
                }
                if(values.focusSwitch){
                    detail_focus = {
                        type:'3',
                        type_id:values.attentionSelect,
                        get_points:values.attentionInput*100
                    }
                    if(values.attentionSelect[0] === 'all'){
                        const { getGzhList } = this.props.crm_intergral
                        let ids = getGzhList.map(item => item.aap_id)
                        detail_focus.type_id = ids.join(',')
                    }else{
                        detail_focus.type_id = values.attentionSelect.join(',')
                    }
                }else{
                    detail_focus = {} 
                } 
                if(values.signinSwitch){
                    signin = {
                        type:'4',
                        day_sign_get_points:values.day_sign_get_points*100,
                        keep_sign_day:values.keep_sign_day,
                        keep_sign_get_points:values.keep_sign_get_points*100
                    }
                }else{
                    signin = {}
                }             
                setForm = {
                    expired_date:'',
                    description:values.explain,
                    details:{
                        'bind':detail_bind,
                        'buy':detail_shopping,
                        'subscribe':detail_focus,
                        'sign':signin
                    }
                }
                this.updateSetting(setForm)               
            }         
        })
    }
    updateSetting = (data) =>{
        this.setState({
            saving: true
        })
        this.props.dispatch({
            type:'crm_intergral/updateSetting',
            payload:{
                settingForm:data
            },
            callback:(data) =>{
                this.setState({
                    saving: false
                })
                if(data.meta && data.meta.code === 200){
                    message.success('积分设置成功！')
                }
            }
        })
    }
    handleShopsChange = (type,val) =>{
        const lastValue = _.last(val)
        if(lastValue === 'all'){
            setTimeout(() => {
                this.props.form.setFieldsValue({
                    [type]: ['all']
                })
            }, 100)
        }else{
            const newValues = val.filter(v => v !== 'all')
            if(newValues.length){
                setTimeout(() => {
                    this.props.form.setFieldsValue({
                        [type]: newValues
                    })
                }, 100)
            }else{
                this.props.form.validateFields([type],{force:true})
            }            
        }
    }
    // 取消
    cancleCreate = () =>{
        this.initForm()
    }
    changeSwicth = (type,e) =>{
        if(e){
            if(type === 'focus'){
                const { getGzhList } = this.props.crm_intergral
                const { setFieldsValue } = this.props.form
                if(!getGzhList.length){
                    setFieldsValue({
                        focusSwitch:false
                    })
                    this.setState({
                        visible:true,
                        onOkUrl:'/setting/authorization/subscription',
                        content:'gzh'
                    })
                    return
                }
            }else{
                const { getAuthshops } = this.props.crm_intergral
                const { setFieldsValue } = this.props.form
                if(!getAuthshops.length){
                    setFieldsValue({
                        shoppingSwitch:false
                    })
                    this.setState({
                        visible:true,
                        onOkUrl:'/setting/shop_management',
                        content:'shops'
                    })
                    return
                }
            }
        }
    }
    hideModal = () =>{
        const {onOkUrl} = this.state
        router.push(onOkUrl)
    }
    handleCountCancel = () =>{
        this.setState({
            visible:false,
        })   
    }
    
    checkPoints = (text,value,callback) =>{
        const {getFieldValue} = this.props.form
        if(getFieldValue('signinSwitch') && getFieldValue('keep_sign_day') && !value){
            callback('请输入积分')
            return
        }
        callback()
    }
    checkDays = (text,value,callback) =>{
        const {getFieldValue} = this.props.form
        if(getFieldValue('signinSwitch') && getFieldValue('keep_sign_get_points') && !value){
            callback('输入值不在设定范围内')
            return
        }
        callback()
        
    }
    /**页面渲染 */
    render() {
        const { visible ,content} = this.state
        const { getFieldDecorator,getFieldValue } = this.props.form
        const { getAuthshops , getGzhList } = this.props.crm_intergral
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '80px' }
            },
            wrapperCol: {
                // span: 15
            }
        }
        const formItemLayout_textarea = {
            labelCol: {
                span: 6,
                style : { width: '84px'}
            },
            wrapperCol: {
                span: 7,
            },
        }
        const labelLayout = {
            titlelCol: {
                span: 6,
                style: {
                    width: 'auto',
                    textAlign: 'right',
                    color: '#333'
                },
            },
            textCol: {
                span: 16,
                style: {
                    wordBreak: 'break-all'
                }
            },
        }      
  
        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    hasGutter={false}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E5%AE%A2%E6%88%B7%E7%AE%A1%E7%90%86/%E7%A7%AF%E5%88%86%E8%BF%90%E8%90%A5.md"
                />
                <div className={styles.settingTip}>
                    <div className={styles.tip}>
                        <img src={require('../../assets/images/settingTip.svg')} width="18" height="18" alt="" style={{marginRight:'2px'}}/>
                        为保证用户体验和积分核销的准确性，积分设置规则不建议频繁修改，请慎重考虑后设置
                    </div>                    
                </div>
                <Form onSubmit={this.handleSubmit}>
                    {/* <div className={styles.itemTitle}>
                        <span className={styles.titleBar}></span>
                        <span className={styles.titleText}>期限设置</span>
                    </div>
                    <FormItem
                        {...formItemLayout}
                        label="积分有效期"
                        style={{marginBottom:'0'}}  
                    >
                        {getFieldDecorator('validityRadio', {
                        })(
                            <RadioGroup>
                                <Radio value={1} className={styles.points_Linmit} >
                                    <span className={styles.inlineMargin}>不设期限</span>
                                </Radio>
                            </RadioGroup>
                        )}
                    </FormItem> */}
                    <div className={styles.itemTitle}>
                        <span className={styles.titleBar}></span>
                        <span className={styles.titleText}>发放设置</span>
                    </div>
                    <div className={styles.fistone}>
                        <FormItem label="绑定送积分"
                            {...formItemLayout}
                            className={styles.radioForm}
                            style={{padding:'0'}}
                        >
                            {getFieldDecorator('bindSwitch', {
                                valuePropName:'checked'
                            })(
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            )}
                            <span className={styles.ItmelTip}>客户首次绑定购物账号后自动获取积分（每个客户只能获取一次）</span>
                        </FormItem>
                        <div className={styles.radioItemBox} style={{ display:(getFieldValue('bindSwitch') ? 'block' : 'none')}}>
                            <div className={styles.radioInline}>
                                <span className={styles.inlineMargin}>首次绑定</span>
                                <FormItem className={styles.radioForm} style={{width:'300px'}}>
                                    {getFieldDecorator('bindSelect', {
                                        rules:[{
                                            required:getFieldValue('bindSwitch'),
                                            message:'请选择平台类型'
                                        }]
                                    })(
                                        <Select placeholder="请选择平台类型"
                                            mode="multiple"
                                            onChange={(e) =>this.handleShopsChange('bindSelect',e)}
                                        >
                                            <Option value='all'>全部类型</Option>
                                            {PLATFORM_TYPE.map((item) => {
                                                return <Option key={item.value} value={item.value}>{item.type}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin}>购物账号后，奖励</span>
                                <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                    {getFieldDecorator('bindInput', {
                                        rules:[{
                                            required:getFieldValue('bindSwitch'),
                                            message:'请输入积分'
                                        }]
                                    })(
                                        <InputNumber min={1} formatter={this.formatterInt}/>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin} style={{marginLeft:8}}>积分</span>
                            </div>
                        </div> 
                    </div>
                    <div className={classNames(styles.labelBorder)}>
                        <FormItem label="购物送积分"
                            {...formItemLayout}
                            className={styles.radioForm}
                            style={{padding:'0'}}
                        >
                            {getFieldDecorator('shoppingSwitch', {
                                valuePropName:'checked'
                            })(
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" onClick={(e)=>this.changeSwicth('shopping',e)}/>
                            )}
                            <span className={styles.ItmelTip}>客户绑定购物账号后在绑定平台店铺中购物，在确认收货十五天后，即可获取相应的积分奖励</span>
                        </FormItem>
                        <div className={styles.radioItemBox} style={{ display:(getFieldValue('shoppingSwitch') ? 'block' : 'none')}}>                           
                            <div className={styles.radioInline}>
                                <span className={styles.inlineMargin}>在绑定的</span>
                                <FormItem className={styles.radioForm} style={{width:'300px'}}>
                                    {getFieldDecorator('shops', {
                                        rules:[{
                                            required:getFieldValue('shoppingSwitch'),
                                            message:'请选择店铺'
                                        }]
                                    })(
                                        <Select  
                                            placeholder="请选择店铺"
                                            mode="multiple"
                                            onChange={(e) =>this.handleShopsChange('shops',e)}
                                        >
                                            {
                                                getAuthshops.length > 1? <Option value='all'>全部店铺</Option> : ''
                                            }
                                            {getAuthshops.map((item) => {
                                                return <Option key={item.id} value={item.id}>{getPlatformTypeByVal(item.type)}/{item.name}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin}>中购物，每满</span>
                                <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                    {getFieldDecorator('shoppingSelect', {
                                        initialValue: '',
                                        rules:[{
                                            required:getFieldValue('shoppingSwitch'),
                                            message:'请输入金额'
                                        }]
                                    })(
                                        <InputNumber min={1} formatter={this.formatterInt}/>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin}>元，奖励</span>
                                <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                    {getFieldDecorator('shoppingInteInput', {
                                        initialValue: '',
                                        rules:[{
                                            required:getFieldValue('shoppingSwitch'),
                                            message:'请输入积分'
                                        }]
                                    })(
                                        <InputNumber min={1} formatter={this.formatterInt}/>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin} style={{marginLeft:8}}>积分</span>
                            </div>
                        </div>
                    </div>
                    <div className={classNames(styles.labelBorder)}>
                        <FormItem label="关注送积分"
                            {...formItemLayout}
                            className={styles.radioForm}
                            style={{padding:'0'}}
                        >
                            {getFieldDecorator('focusSwitch', {
                                valuePropName:'checked'
                            })(
                                // onClick={(e)=>this.changeSwicth('focus',e)}
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" onClick={(e)=>this.changeSwicth('focus',e)}/>
                            )}
                            <span className={styles.ItmelTip}>客户首次关注公众号后自动获取积分（每个客户只能获取一次）</span>
                        </FormItem>
                        <div className={styles.radioItemBox} style={{ display:(getFieldValue('focusSwitch') ? 'block' : 'none')}}>                   
                            <div className={styles.radioInline}>
                                <span className={styles.inlineMargin}>首次关注</span>
                                <FormItem className={styles.radioForm} style={{width:'300px'}}>
                                    {getFieldDecorator('attentionSelect', {
                                        rules:[{
                                            required:getFieldValue('focusSwitch'),
                                            message:'请选择公众号'
                                        }]
                                    })(
                                        <Select placeholder="请选择公众号" mode="multiple"
                                            onChange={(e) =>this.handleShopsChange('attentionSelect',e)}
                                        >
                                            {
                                                getGzhList.length > 1 ? <Option value='all'>全部公众号</Option> : ''
                                            }
                                            {getGzhList.map((item) => {
                                                return <Option key={item.app_id} value={item.app_id}>{item.name}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin}>后，奖励</span>
                                <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                    {getFieldDecorator('attentionInput', {
                                        rules:[{
                                            required:getFieldValue('focusSwitch'),
                                            message:'请输入积分'
                                        }]
                                    })(
                                        <InputNumber min={1} formatter={this.formatterInt}/>
                                    )}
                                </FormItem>
                                <span className={styles.inlineMargin} style={{marginLeft:8}}>积分</span>
                            </div>
                        </div>                        
                    </div>
                    <div className={classNames(styles.labelBorder_last)}>
                        <Page.Label title='营销活动送积分' text={
                            <span style={{color:'#556675'}}>客户参与营销活动，可获取积分，积分值在营销活动中设置</span>
                        } {...labelLayout}></Page.Label>
                    </div>
                    <div className={classNames(styles.labelBorder)}>
                        <FormItem label="签到送积分"
                            {...formItemLayout}
                            className={styles.radioForm}
                            style={{padding:'0'}}
                        >
                            {getFieldDecorator('signinSwitch', {
                                valuePropName:'checked'
                            })(
                                // onClick={(e)=>this.changeSwicth('focus',e)}
                                <Switch checkedChildren="开启" unCheckedChildren="关闭"/>
                            )}
                            <span className={styles.ItmelTip}>客户参与签到活动，可奖励积分</span>
                        </FormItem>
                        <div className={styles.radioItemBox} style={{ display:(getFieldValue('signinSwitch') ? 'block' : 'none')}}> 
                            <div className={styles.radioInline}>
                                <span className={styles.inlineMargin} style={{marginRight:8}}><i class={styles.mart}>*</i>签到积分：</span>
                                <FormItem className={styles.radioForm} style={{paddingLeft:0,width:'100px'}}>
                                    {getFieldDecorator('day_sign_get_points', {
                                        rules:[{
                                            required:getFieldValue('signinSwitch'),
                                            message:'请输入积分'
                                        }]
                                    })(
                                        <InputNumber min={1} formatter={this.formatterIntFive} parser={this.formatterIntFive} max={99999}/>
                                    )}                                    
                                </FormItem>
                                <span className={styles.inlineMargin}>积分/日，每日签到均奖励</span>
                            </div>                  
                            
                            <div>
                                <div className={styles.radioInline}>
                                    <span className={styles.inlineMargin}>连续签到奖励：连续签到的第</span>
                                    <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                        {getFieldDecorator('keep_sign_day', {
                                            rules:[{validator: this.checkDays}]
                                        })(
                                            <InputNumber min={1} formatter={this.formatterIntThree} parser={this.formatterIntThree} max={99}/>
                                        )}
                                    </FormItem>
                                    <span className={styles.inlineMargin} style={{marginLeft:8}}>天，当日额外奖励</span>
                                    <FormItem className={styles.radioForm} style={{width:'100px'}}>
                                        {getFieldDecorator('keep_sign_get_points', {
                                            rules:[
                                                {validator: this.checkPoints}
                                            ]
                                        })(
                                            <InputNumber min={1} formatter={this.formatterIntFive} parser={this.formatterIntFive} max={99999}/>
                                        )}
                                    </FormItem>
                                    <span className={styles.inlineMargin} style={{marginLeft:8}}>积分</span>
                                </div>
                            </div>
                            
                        </div>                        
                    </div>
                    <div className={styles.itemTitle}>
                        <span className={styles.titleBar}></span>
                        <span className={styles.titleText}>积分说明</span>
                    </div>
                    <FormItem label="编辑说明:"
                        className={styles.textAreaFormItem}
                        {...formItemLayout_textarea}
                    >
                        {getFieldDecorator('explain', {
                            initialValue: '',
                            rules:[{
                                required:true,
                                message:'请输入活动说明'
                            }]
                        })(
                            <TextAreaCount
                                style={{ width: 450 }}
                                placeholder="请输入或粘贴客户需要了解的积分规则，文字可换行"
                                rows={8}
                                limitSize={500}
                            />
                        )}
                        
                    </FormItem>
                    <div style={{ textAlign:'right' ,width: 535}}>
                        {/* <span style={{ float: "left" }}>限{getFieldValue('explain') ? getFieldValue('explain').length : '0'}/500字内</span> */}
                        <a href="javascript:;" onClick={this.handleTextChange}>示例文字</a>
                    </div>
                    <FormItem
                        style={{marginTop:'20px'}}
                        {...formItemLayout}
                    >
                        <Button style={{marginLeft: '84px'}} type='primary' htmlType="submit" loading={this.state.saving} disabled={this.state.saving}>保存</Button>
                        <Button style={{marginLeft: '16px'}} onClick={this.cancleCreate.bind(this)}>取消</Button>
                    </FormItem>
                </Form>
                <Modal
                    title="发放设置"
                    visible={visible}
                    okText="去设置"
                    cancelText="取消"
                    closable={false}
                    onOk={this.hideModal}
                    onCancel={this.handleCountCancel}
                >
                {
                    content === 'shops' ? <p>当前系统中无绑定店铺，请至<span className={styles.stronger}>店铺管理</span>中设置！</p>
                    : <p>当前系统中无授权公众号，请至<span className={styles.stronger}>公众号</span>中设置！</p>
                }
                    
                </Modal>
            </Page>
        )
    }
}
