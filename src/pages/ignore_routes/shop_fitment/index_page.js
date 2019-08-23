import React from 'react'
import {connect} from 'dva'
import {Layout , Button, Icon,message,Modal } from 'antd'
import {Link} from 'dva/router'
import router from 'umi/router'
import Page from "components/business/Page"
import documentTitleDecorator from 'hoc/documentTitle'
import ShopMenu from './components/ShopMenu'
import EditContent from './components/EditContent'
import Banner from './components/Banner'
import SingleImg from './components/SingleImg'
import Line from './components/Line'
import Search from './components/Search'
import TabsComponent from './components/TabsComponent'
import SingleProducts from './components/SingleProducts'
import ActiveProduct from './components/ActiveProduct'
import ImageText from './components/ImageText'
import SingleText from './components/SingleText'
import Section from './components/Section'
import Category from './components/Category'
import ThemeModal from './components/ThemeModal'

import initialData,{initProduct} from './components/ThemeModal/initData'
import styles from './index.less'
const footerNavSvg = require('./asserts/footer_nav.svg')
const { Header, Content } = Layout
const {confirm} = Modal

const imageUrl = 'https://image.51zan.com/'

@connect(({shop_fitment}) => ({
    shop_fitment
}))
@documentTitleDecorator({
    title: '店铺装修'
})
export default class extends React.Component {
     
    state ={
        activity:{},
        modelJson:[],
        currentIndex:0,
        visible:true
    }
    componentDidMount(){
        this.getShop()
    }
    beforeunload(e){
        e = e || window.event
        e.returnValue = "离开后所有的数据将清空，确定离开页面吗？"
    }
    setInintBanner = (data) =>{
        this.props.dispatch({
            type: 'shop_fitment/getOrderSetting',
            callback: (res) => {
                data.forEach((element,index) => {
                    if (element.name === 'Banner') {
                        if(res.banner){
                            element.data[0].data[0] = {
                                img_url: imageUrl + res.banner
                            }
                        }else{
                            data.splice(index,1)
                        }
                    } else if (element.name === 'Search') {
                        element.data[0].data[0] = {
                            text: res.search_default_text
                        }
                    } else if (element.name === 'ImageText') {
                        element.data[0].data[0] = {
                            img_path: imageUrl + res.logo_url,
                            phone: res.customer_service_mobile,
                            text: "<<< 我是店主，可以随时咨询我哦",
                            textHead: "您的专属客服，24小时不打烊~"
                        }
                    }
                })
                data = this.resetData(data)
                this.setState({
                    activity:data[0],
                    modelJson: data
                })
            }
        })
        return data
    }
    setInitCategory = (data)=>{
        this.props.dispatch({
            type: 'shop_fitment/getCategory',
            callback: (res) => {
                let tempArr = []
                res.forEach((element, index) => {
                    tempArr.push({
                        label: 'ICON ' + index,
                        type: '0_' + index,
                        data: [{
                            cover_url: imageUrl + element.icon_url,
                            name: element.name,
                            id: element.id
                        }]
                    })
                })
                data = data.map(item => {
                    if (item.name === 'Category') {
                        item.data = tempArr
                    }
                    return item
                })
                data = this.resetData(data)
                this.setState({
                    modelJson: data
                })
            }
        })
        return data
    }
    setInitImageText = (data) =>{
        return data
    }
    setProduct = (data) =>{
        let page = {
            page:  0,
            per_page: 1000
        }
        let activeType = [{
            type: 'shop_fitment/searchGoodsList',
            payload: {
                status: 1,
                goods_name: '',
                ...page
            }
        }, {
            type: 'shop_fitment/ptList',
            payload: {
                status: 2,
                order_by: 'end_at asc',
                ...page
            }
        }, {
            type: 'shop_fitment/getGoodsList',
            payload: {
                status: 2
            }
        }, {
            type: 'shop_fitment/goodsList',
            payload: {
                goods_name: '',
                status: 1,
                activity_type: 3,
                ...page
            },
        }]
        let promises =  activeType.map(item =>{
            return this.props.dispatch(item)
        })
        Promise.all(promises).then(res=>{
            setTimeout(_=>{
                const {goodsList} = this.props.shop_fitment
                let _data = []
                let _default = []
                let activeState = false
                initProduct.forEach((item,index) => {
                    if(item.active && index <= 200){
                        if(goodsList[item.active] && goodsList[item.active].length){
                            activeState = true
                            let row_id ='goods_id'
                            if(item.active==='tuijian')row_id ='id'
                            let ids = goodsList[item.active].map(_item=>_item[row_id])
                            let marks ={
                                'pingtuan':1,
                                'tejia':2,
                                'tuijian':3
                            }
                            item.data =[{"label":item.text,"type":`${index}_${index}`,mark:marks[item.active],"data":ids}]
                            _data.push(item)
                        }
                    }else if(!item.active && goodsList['default'] && goodsList['default'].length && index <= 200){
                        let ids = goodsList[ 'default'].map(_item => _item.id)
                        item.data =[{"label":"宝贝推荐","type":`${index}_${index}`,"data":ids}]
                        _default = [item]
                    }
                })
                if(activeState){
                    data =  data.concat(_data)
                }else {
                    data =  data.concat(_default)
                }
                data = this.resetData(data)
                this.setState({
                    modelJson :data
                },()=>{
                    this.getProudctList(data)
                })
            },500)
        })
    }
    initData =() =>{
        // eslint-disable-next-line no-unused-vars
        let data = JSON.parse(JSON.stringify(initialData)) 
        this.setInintBanner(data)
        this.setInitCategory(data)
        this.setInitImageText(data)
        this.setProduct(data)
    }
    theme = {}
    onOk = (theme) =>{
        this.theme = theme
        this.props.dispatch({
            type:'shop_fitment/setTheme',
            payload:theme
        })
    }
    onCancel = () =>{
        this.setState({
            visible: false
        })
    }
    // 重新对type进行初始化排查，以防重复
    resetData = (modelJson) =>{
        let resetType = {}
        modelJson = JSON.parse(JSON.stringify(modelJson))
        let json =  modelJson.map((model,index)=>{
            let {data} = model
            model.data =  data ? data.map((item,_index)=>{
                let oldType = item.type
                item.type = `${index}_${_index}`
                resetType[oldType] = item.type
                return item
            }) : data
            return model
        })

        this.props.dispatch({
            type:'shop_fitment/resetData',
            payload: resetType
        })
        return json
    }
    handleTheme = () => {
        this.setState({
            visible: true
        })
    }
    // 点击菜单中的模板
    shopMenuCheck = (data,currentIndex = this.state.currentIndex) =>{
        let { modelJson } = this.state

        if(['Search','Category','SingleLine','DoubleColumn','Banner'].indexOf(data.name) > -1 ){
            if(modelJson.some(i => i.name === data.name)){
                message.error(`${data.text}模块不能重复`)
                return
            }
        }
        if(['pingtuan','tejia','tuijian'].indexOf(data.active) > -1){
            if(modelJson.some(i => i.active === data.active)){
                message.error(`${data.text}模块不能重复`)
                return
            }
        }
        let arr = modelJson.map(item =>{
            item.isActive = false
            return item
        })
        data.data = []
        
        data.isActive = true
        if(data.text){
            this.setState({
                activity:{...this.state.activity,...data}
            })
        }
        currentIndex = modelJson.length === 0 ? currentIndex : currentIndex + 1
        
        arr.splice(currentIndex, 0, JSON.parse(JSON.stringify(data)))
        this.setState({
            activity:data,
            modelJson:this.resetData(arr),
            currentIndex: currentIndex
        })
    }
    // 选中的当前模块
    handleCurrentIndex =(index) =>{
        let { modelJson } = this.state
        let arr = modelJson.map(item =>{
            item.isActive = false
            return item
        })
        if(arr[index]){
            arr[index].isActive = true
            if(arr[index].text){
                this.setState({
                    activity:{...arr[index]}
                })
            }
        }
        
        this.setState({
            currentIndex :index,
            modelJson:arr
        })
    }
    // 菜单选择对应的组件模块
    ShopModelMap = (model, index) => {
        const M = {
            Banner,
            SingleImg,
            Line,
            Search,
            ActiveProduct,
            ImageText,
            SingleText,
            Section,
            Category,
            ProductCross: TabsComponent,
            ProductDirection: TabsComponent,
            DoubleColumn: ActiveProduct,
            SingleLine: ActiveProduct
        }
        let { modelJson } = this.state
        
        const ShopModel = M[model.name]
        if(!ShopModel) return null
        
        const props = {
            model,
            index,
            isActive: model.isActive,
            currentIndex: this.handleCurrentIndex,
            key: `row_${index}`,
            onMove: this.moveShopModel,
            onDelete: this.deleteShopModel,
            isBottom: modelJson.length === index + 1 && modelJson.length > 1
        }
        if(model.productType) props.type = model.productType
        if (ShopModel) {
            return <ShopModel { ...props } />
        }
    }
    // 组件模块上下移动
    moveShopModel = (data,type,index)=>{
        let { modelJson } = this.state
        let current = modelJson[index]
        let currentIndex = index
        if(type === 'up'){
            let prev =  modelJson[index - 1]
            if(prev){
                modelJson[index] = prev
                modelJson[index - 1] = current
                currentIndex = index - 1
            }
        }else{
            let next =  modelJson[index + 1]
            if(next){
                modelJson[index] = next
                modelJson[index + 1] = current
                currentIndex = index + 1
            }
        }
        modelJson = this.resetData(modelJson)
        this.setState({modelJson,currentIndex,activity:modelJson[currentIndex]})
        
    }
    // 组件模块删除
    deleteShopModel = (index)=>{
        let { modelJson } = this.state
        modelJson.splice(index,1)
        let arr = modelJson.map(item =>{
            item.isActive = false
            return item
        })
        const isActiveIndex = modelJson[index - 1]? index - 1: modelJson[index] ? index : null
        this.setState({modelJson:arr,currentIndex:isActiveIndex || 0},()=>{
            if(isActiveIndex !== null){
                this.handleCurrentIndex(isActiveIndex || 0)
            }else{
                this.setState({activity:{}})
            }
        })
        
    }
    handleData = (activity,index,flag) =>{
        let { modelJson } = this.state
        activity = JSON.parse(JSON.stringify(activity))
        modelJson[index] = activity
        if(!flag){
            modelJson = this.resetData(modelJson)
        }
        this.setState({ modelJson, activity:modelJson[index] })
    }
    validate = (json) => {
        let arr =['Banner','SingleImg','ImageText']
        let isError = false
        let errorText = ''

        json.forEach(model=>{
            let {data} = model
            if(data.length===0 && model.name !== 'Line'){
                isError = true
                errorText = `${model.text}模块数据不能为空`
            }
            
            if(model.productType){
                data.forEach(item=>{
                    let flag = item.data.length >= 1 && item.data.length <= 200
                    if(!isError && !flag){
                        isError = !flag
                        errorText= model.text + '中数据不能为空'
                    } 
                })
            } else if(arr.indexOf(model.name) > -1){
                data.forEach(item => {
                    let d = item.data[0]
                    if(!d || (!d.img_url && !d.img_path)){
                        if(!isError){
                            isError = true
                            errorText= model.text + '中请选择或填写图片'
                        }  
                    }
                    if(d && d.img_url && d.img_path){
                        if(!isError){
                            isError = true
                            errorText= model.text + '中上传图片与网络图片不能同时存在'
                        } 
                    }
                    if(model.name === 'ImageText'){
                        if(!d || !d.textHead || !d.text){
                            if(!isError){
                                isError = true
                                errorText= model.text + '中请填写完整的文案信息'
                            } 
                        }
                        if(!d || !d.phone){
                            if(!isError){
                                isError = true
                                errorText= model.text + '中请填写电话号码'
                            } 
                        }

                    }
                })
            }else if(['SingleText','Section','Search'].indexOf(model.name) > -1){
                data.forEach(item => {
                    let d = item.data[0]
                    if(!d || !d.text){
                        if(!isError){
                            isError = true
                            errorText= model.text + '中请填写文案信息'
                        } 
                    }
                })
            }else if(['Category'].indexOf(model.name) > -1){
                data.forEach(item => {
                    let d = item.data[0]
                    if(!d || !d.cover_url ){
                        if(!isError){
                            isError = true
                            errorText= model.text + '中请选择菜单类目'
                        }  
                    }
                })
            }
           
        })
        if(isError){
            message.error(errorText)
            return false
        }
        return true
    }
    getProudctList = (json) =>{
        let mainJson = []
        json.forEach(model =>{
            if(model.productType){
                let {data} = model
                data && data.forEach(item=>{
                    if(item.data && item.data.length){
                        mainJson.push({
                            type:item.type,
                            mark:item.mark,
                            data:item.data
                        })
                    }
                })
            }else if(['Banner','SingleImg'].indexOf(model.name) > -1){
                let {data} = model
                data && data.forEach(item=>{
                    if(item._data && item._data.length){
                        mainJson.push({
                            type:item.type,
                            data:item._data
                        })
                    }
                })
            }
        })
        this.props.dispatch({
            type:'shop_fitment/getProductList',
            payload: {
                main: mainJson
            }
        })
    }
    getShop = () =>{
        this.props.dispatch({
            type:'shop_fitment/getShop',
            callback:(respone)=>{
                if(respone.meta && respone.meta.code === 200){
                    respone.data =  respone.data && this.resetData(respone.data)
                    respone.data = respone.data && respone.data.map(item=>{
                        item.isActive = false
                        return item
                    }) 
                    if(respone.data){
                        let o ={
                            modelJson:respone.data,
                        } 
                        
                        if(respone.data[0]){
                            respone.data[0].isActive = true
                            o.activity = respone.data[0]
                            o.currentIndex = 0
                        }
                        this.setState(o)
                        this.getProudctList(respone.data)  
                    }else{
                        // 初始化数据
                        this.initData()
                    }
                    
                }
            }
        })
    }
    save = () => {
        let { modelJson } = this.state
        let { products }  = this.props.shop_fitment
        modelJson = JSON.parse(JSON.stringify(modelJson))
        // let arr =
        modelJson =  modelJson.map(model => {
            let {data} = model

            model.data =  data ? data.map(item =>{
                if(products[item.type] && model.productType){
                    let ids = products[item.type].map(i => i.id)
                    item.data = item.data && item.data.filter(i => ids.indexOf(i) > -1)
                }else if(products[item.type] && ['Banner','SingleImg'].indexOf(model.name)>-1){
                    let ids = products[item.type].map(i => i.id)
                    item._data = item._data && item._data.filter(i => ids.indexOf(i) > -1)
                }
                return item
            }) : data
            return model
        })
        let isPass = this.validate(modelJson)
        if(isPass){
            modelJson = this.resetData(modelJson)
            this.setState({ modelJson,activity:modelJson[this.state.currentIndex] ||{}})
            confirm({
                title: '是否保存当前店铺装修的数据？',
                onOk:()=> {
                    this.props.dispatch({
                        type:'shop_fitment/setShop',
                        payload: {
                            main: modelJson,
                            type: this.theme.type,
                            title: this.theme.title,
                            version: this.theme.version
                        },
                        callback:(respone)=>{
                            if(respone.meta && respone.meta.code === 200){
                                message.success('保存成功！')
                            }
                        }
                    })
                },
                onCancel() {},
            })
            
        }
    }
    goBack = () => {
        confirm({
            title: '退出后修改过的数据将会丢失，是否继续？',
            onOk() {
                router.push({
                    pathname: '/setting/shop_management/mp_setting',
                    params: {
                        key: 4
                    }
                })
            },
            onCancel() {},
        })
    }
    render(){
        const { activity,modelJson } = this.state
        return <Layout className={styles.shop_layout}>
            <Header className={styles.topBar}>
                <div className={styles.logo}>
                    <Link to="/mall/overview" title="前往虎赞小店" >
                        <img src='//image.yiqixuan.com/retail/logo/51-logo_x160.png' alt="虎赞" />
                        <span className={styles.weight}>·</span>
                        <span>店铺装修</span>
                    </Link>
                </div>
                <div className={styles.right}>
                    {/* <Button type='primary' ghost onClick={this.handleTheme}> <Icon type="appstore" style={{color:'#4391FF',fontSize:14,marginLeft: 0,marginRight:4,fontWeight:500}}/> 模版库</Button> */}
                    <Button type='primary' onClick={this.save}>保存</Button>
                    <Button onClick={this.goBack}>退出</Button>
                </div>
            </Header>
            <Layout>
                <ShopMenu onCheck={this.shopMenuCheck} />
                <Content>
                    <div className={styles.content}>
                        <div className={styles.content_header}>
                            <h3>{activity.text}</h3>
                        </div>
                        <div className={styles.body}>
                            <div className={styles.body_left}>
                                <p>实际效果以手机端浏览为准，此处只做参考：</p>
                                <div className={styles.model}>
                                    <div className={styles.model_content} id='m_model'>
                                        {
                                            modelJson.map((item, index) => this.ShopModelMap(item, index))
                                        }
                                        <div className={styles.model_footer} >
                                            <img src={footerNavSvg} alt=''/>
                                        </div>
                                    </div>
                                </div>
                                <h3>预览效果图</h3>
                            </div>
                            <div className={styles.body_right}>
                                <Page.ContentBlock title="内容编辑" />
                                <div className={styles.body_container}>
                                    <EditContent
                                        activity={activity} 
                                        handleData={this.handleData} 
                                        index={this.state.currentIndex} />
                                </div>
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
            <ThemeModal
                visible={this.state.visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
            />
        </Layout>
    }
}
