import React,{Fragment} from 'react'
import { connect } from 'dva'
import { Row, Button, Icon, Select, Input, Table, Badge, Pagination, Col, Form, Popover } from 'antd'
import router from 'umi/router'
import Page, { DEFAULT_PAGER , DEFAULT_PAGER_FILTER} from '../../../../components/business/Page'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import {datetime} from '../../../../utils/display'
import CreateShop from './modals/CreateShop'
import SelectPart from './modals/SelectPart'
import ShopOauthTaoTemp from './modals/ShopOauthTaoTemp'
import ShopOauthXuan from './modals/ShopOauthXuan'
import ShopEditeTao from './modals/ShopEditeTao'
import ShopEditeXuan from './modals/ShopEditeXuan'
import ShopEditeStore from './modals/ShopEditeStore'
import ShopInfoTao from './modals/ShopInfoTao'
import DeleteOauthTao from './modals/DeleteOauthTao'
import DeleteOauthXuan from './modals/DeleteOauthXuan'
import TaoOauthBack from './modals/TaoOauthBack'
import ShopOauthJd from './modals/ShopOauthJd'
import DueSet from './due_set/index'
import _ from 'lodash'
import {
    SHOP_TYPE as SHOP_TYPES,
    OAUTH_STATE,
    getShopValByName,
    getShopTypeByVal,
    getSourceTypeByVal,
    getOauthValByName,
    getOauthTypeByVal,
    getSourceValByName,
    REDIRECT_URL,
} from '../../../../common/shopConf'
const warnIcon = require('../../assets/images/icon_attention@2x.png')
const Option = Select.Option
const DEFAULT_CONDITION = {
    shopType: '',
    shopStatus: '',
    shopName: '',
}

@connect(({ setting_shopManagement, base }) => ({
    setting_shopManagement,
    base,
}))
@documentTitleDecorator()
@Form.create()
export default class extends Page.ListPureComponent {
    state = {
        shopType: '',
        shopStatus: '',
        shopName: '',
        loading: false,
        condition: {...DEFAULT_CONDITION},
        pager: {...DEFAULT_PAGER}
    }
    initPage = (isSetHistory = false) => {
        const condition = this.getParamForObject(DEFAULT_CONDITION, this.props.location.query)
        const pager = this.getParamForObject(DEFAULT_PAGER, this.props.location.query, DEFAULT_PAGER_FILTER)
        const { shopType, shopStatus, shopName } = condition
        this.getPageData(condition, pager, isSetHistory)
        this.props.form.setFieldsValue({
            'shopType': shopType&&parseInt(shopType,10),
            'shopStatus': shopStatus&&parseInt(shopStatus,10),
            'shopName': shopName
        })
    }
    getPageData = (condition, pager, isSetHistory = true,callback) => {
        if( isSetHistory ){
            this.history(condition, pager)
        }
        this.setState({
            condition: condition,
            pager: pager,
            loading: true
        })
        this.props.dispatch({
            type: 'setting_shopManagement/getShopList',
            payload: {
                page: pager.current,
                per_page: pager.pageSize,
                type: condition.shopType,
                auth_status: condition.shopStatus,
                name: condition.shopName,
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
                callback && callback(data)
            }
        })
    }
    searchData = () => {
        const { form } = this.props
        form.validateFields((error,value) => {
            const condition = {
                ...this.state.condition,
                ...{
                    shopType: value.shopType,
                    shopStatus: value.shopStatus,
                    shopName: value.shopName,
                }
            }
            const pager = {
                pageSize : this.state.pager.pageSize,
                current : DEFAULT_PAGER.current
            }
            this.getPageData(condition, pager)
        })
    }
    componentDidMount () {
        super.componentDidMount()
        this.props.dispatch({
            type: 'setting_shopManagement/getToken',
            payload: {
                type: 'image',
            },
        })
    }
    setCurrent = (item) => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { currentShop: item }
        })
        // window.localStorage.setItem('currentShop', JSON.stringify(item))
    }
    // 授权过期设置
    dueSet = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopDueSetVisible: true }
        })
        this.props.dispatch({
            type: 'setting_shopManagement/getDueRemind'
        })
    }
    //搜索相关
    onChangeShopType = (value) => {
        this.setState({
            shopType: value
        })
    }
    onChangeShopStatus = (value) => {
        this.setState({
            shopStatus: value
        })
    }
    onChangeShopName = (e) => {
        this.setState({
            shopName: e.target.value
        })
    }
    onPressEnter = () => {
        this.searchData()
    }
    shopSearch = () => {
        this.searchData()
    }
    resetSearchHandler = () => {
        this.props.form.resetFields()
        this.shopSearch()
    }
    //创建店铺弹窗处理
    createShop = () => {
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { createShopVisible: true }
        })
    }
    //修改添加部门弹窗处理
    updatePart = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/selectTree',
            payload: {}
        })
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { updatePartVisible: true }
        })
    }
    //淘宝天猫店铺授权弹窗
    shopOauthTao = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopOauthTaoVisible: true }
        })
    }
    shopOauthJd = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopJdVisible: true }
        })
    }
    shopOauthYouZan = (item) => { 
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'setting_shopManagement/getOauthUrl',
            payload: { 
                auth_source: 4,
                shop_id: item.id,
                redirect_uri: encodeURIComponent(`${REDIRECT_URL}?shop_id=${item.id}&auth_source=4`),
            },
            callback: () => { 
                this.setState({
                    loading: false
                })
                const { auth_url } = this.props.setting_shopManagement
                if (auth_url) { 
                    this.youZanRefs.click()
                }
            }
        }) 
    }
    //虎赞小店店铺授权弹窗
    shopOauthXuan = (item) => {
        this.setCurrent(item)
        //获取小程序列表
        this.props.dispatch({
            type: 'setting_shopManagement/oauthXuanList',
            payload: {
                type: 2
            }
        })
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopOauthXuanVisible: true }
        })
    }
    //查看店铺信息弹窗
    getShopInfoTao = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/getOauthInfo',
            payload: {
                id: item.id
            }
        })
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopInfoTaoVisible: true }
        })
    }
    //淘宝天猫店铺编辑
    shopEditeTao = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopEditeTaoVisible: true }
        })
    }
    //虎赞小店店铺编辑
    shopEditeXuan = (item) => {
        this.setCurrent(item)
        // 跳转到编辑页面
        router.push('/setting/shop_management/mp_setting')
    }
    //门店编辑
    shopEditeStore = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopEditeStoreVisible: true }
        })
    }
    //解除店铺授权弹窗
    deleteOauthTao = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopDeleteTaoVisible: true }
        })
    }
    deleteOauthXuan = (item) => {
        this.setCurrent(item)
        this.props.dispatch({
            type: 'setting_shopManagement/setProperty',
            payload: { shopDeleteXuanVisible: true }
        })
    }
    jstOauth = (item) => { 
        this.props.dispatch({
            type: 'setting_shopManagement/getJstOauthUrl',
            payload: {},
            callback: () => { 
                // const { jstOauthUrl } = this.props.setting_shopManagement
                // const win = window.open()
                // win.location.href = jstOauthUrl
                this.refsNode.click()
            }
        })
    }

    // 显示操作详情
    showOperate = (value, item, index) => { 
        // 授权来源为聚水潭
        if (item.auth_source === getSourceValByName('Jst')) { 
            // 已授权，显示解除授权和编辑
            if (item.auth_status === getOauthValByName('Authorized')) { 
                return (
                    <div className={styles.operateClick}>
                        {/* <span size={'small'} onClick={() => { this.deleteOauthTao(item) }}>解除</span> */}
                        <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                    </div>
                )
            }
            // 授权终止、未授权和已过期，显示授权和编辑
            if (item.auth_status !== getOauthValByName('Authorized')) { 
                return (
                    <div className={styles.operateClick}>
                        <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span> 
                    </div>
                )
            }
        }
        // 淘宝或天猫类型店铺
        if (item.type === getShopValByName('TaoBao') || item.type === getShopValByName('TianMao')) { 
            // 授权来源不是聚水潭
            if (item.auth_source !== getSourceValByName('Jst')) { 
                // 已授权，显示解除授权和编辑
                if (item.auth_status === getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            {/* <span size={'small'} onClick={() => { this.deleteOauthTao(item) }}>解除</span> */}
                            <span size={'small'} onClick={() => { this.getShopInfoTao(item) }}>编辑</span>
                        </div>
                    )
                }
                // 授权终止、未授权和已过期，显示授权和编辑
                if (item.auth_status !== getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            <span size={'small'} onClick={() => { this.shopOauthTao(item) }}>授权</span>
                            <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                        </div>
                    )
                }
            }
        }
        // 虎赞小店
        if (item.type === getShopValByName('HuZan')) { 
            // 已授权，显示解除授权和设置
            if (item.auth_status === getOauthValByName('Authorized')) { 
                return (
                    <div className={styles.operateClick}>
                        {/* <span size={'small'} onClick={() => { this.deleteOauthXuan(item) }}>解除</span> */}
                        <span size={'small'} onClick={() => { this.shopEditeXuan(item) }}>设置</span>
                    </div>
                )
            }
            // 授权终止、未授权和已过期，显示授权和编辑
            if (item.auth_status !== getOauthValByName('Authorized')) { 
                return (
                    <div className={styles.operateClick}>
                        <span size={'small'} onClick={() => { this.shopOauthXuan(item) }}>授权</span>
                    </div>
                )
            }   
        }
        // 有赞
        if (item.type === getShopValByName('YouZan')) { 
            // 授权来源不是聚水潭
            if (item.auth_source !== getSourceValByName('Jst')) { 
                // 已授权，显示解除授权和编辑
                if (item.auth_status === getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            {/* <span size={'small'} onClick={() => { this.deleteOauthTao(item) }}>解除</span> */}
                            <span size={'small'} onClick={() => { this.shopOauthYouZan(item) }}>授权</span>
                            <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                            <a ref={node => this.youZanRefs = node} href={this.props.setting_shopManagement.auth_url} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>授权</a>
                        </div>
                    )
                }
                // 授权终止、未授权和已过期，显示授权和编辑
                if (item.auth_status !== getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            <span size={'small'} onClick={() => { this.shopOauthYouZan(item) }}>授权</span>
                            <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                            <a ref={node => this.youZanRefs = node} href={this.props.setting_shopManagement.auth_url} target='_blank' rel="noopener noreferrer" style={{display: 'none'}}>授权</a>
                        </div>
                    )
                }
            }
        }
        // 京东
        if (item.type === getShopValByName('JD')) { 
            // 授权来源不是聚水潭
            if (item.auth_source !== getSourceValByName('Jst')) { 
                // 已授权，显示解除授权和编辑
                if (item.auth_status === getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            {/* <span size={'small'} onClick={() => { this.deleteOauthTao(item) }}>解除</span> */}
                            <span size={'small'} onClick={() => { this.shopOauthJd(item) }}>授权</span>
                            <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                        </div>
                    )
                }
                // 授权终止、未授权和已过期，显示授权和编辑
                if (item.auth_status !== getOauthValByName('Authorized')) { 
                    return (
                        <div className={styles.operateClick}>
                            <span size={'small'} onClick={() => { this.shopOauthJd(item) }}>授权</span>
                            <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                        </div>
                    )
                }  
            }   
        }
        // 门店
        if (item.type === getShopValByName('Mendian')) { 
            return (
                <div className={styles.operateClick}>
                    <span size={'small'} onClick={() => { this.shopEditeStore(item) }}>编辑</span>
                </div>
            )
        }
        // 自营
        if (item.type === getShopValByName('ZiYing')) { 
            return (
                <div className={styles.operateClick}>
                    <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                </div>
            )
        }
        // 微商小店
        if (item.type === getShopValByName('WS')) { 
            return (
                <div className={styles.operateClick}>
                    <span size={'small'} onClick={() => { this.shopEditeTao(item) }}>编辑</span>
                </div>
            )
        }
    }

    render() {
        const { totalPage, shopData, currentPage, perPage, jstOauthUrl } = this.props.setting_shopManagement
        const {initData} = this.props.base
        const version_id = _.get(initData, 'company.product_version.id', '')
        const SHOP_TYPE = version_id ===10 || version_id ===0 ? SHOP_TYPES.filter(item=>item.name !== "TaoBao" &&  item.name !== "TianMao" &&  item.name !== "JD" &&  item.name !== "YouZan"):SHOP_TYPES
        const { loading } = this.state
        //定义表格顶部字段
        const columns = [
            {
                title: '店铺ID',
                dataIndex: 'id',
            },
            {
                title: '店铺名称',
                dataIndex: 'name',
                width: '20%',
            },
            {
                title: '类型',
                dataIndex: 'type',
                render: (value, item, index) => getShopTypeByVal(value)
            },
            {
                title: '授权来源',
                dataIndex: 'auth_source',
                render: (value, item, index) => getSourceTypeByVal(value)
            },
            {
                title: '授权状态',
                dataIndex: 'auth_status',
                render: (value, item, index) => {
                    const text = getOauthTypeByVal(value) + ''
                    if(value === getOauthValByName('Unauthorized')){
                        return <Badge status="default" text={text} />
                    }else if(value === getOauthValByName('Authorized')){
                        return <Badge status="success" text={text} />
                    }else if(value === getOauthValByName('Expired')){
                        return <Badge status="warning" text={text} />
                    }else if(value === getOauthValByName('ErrAuthor')){
                        return <Badge status="warning" text={text} />
                    }
                }
            },
            {
                title: '授权时间',
                dataIndex: 'auth_at',
                render: (value, item, index) => {
                    if (value) {
                        return <span>{value&&datetime(value)}</span>
                    } else {
                        return '-'
                    }
                }
            },
            {
                title: '到期时间',
                dataIndex: 'expire_at',
                render: (value, item, index) => {
                    if (value) {
                        return <span>{value&&datetime(value)}</span>
                    } else {
                        return '-'
                    }
                }
            },
            {
                title: '所属部门',
                dataIndex: 'departments',
                render: (value, item, index) => {
                    if(value){
                        let textArr = []
                        value.forEach((v,k)=>{
                            textArr.push(v.name)
                        })
                        const textAllValue = textArr.join(',')
                        let textArrTemp = []
                        value.forEach((v,k)=>{
                            textArrTemp.push((v.name.length>10?`${v.name.substr(0,10)}...`:v.name))
                        })
                        let textValue
                        if(textArrTemp.length > 2){
                            textValue = textArrTemp.splice(0,2).join(',') + '...'
                        }else{
                            textValue = textArrTemp.join(',')
                        }
                        return <div onClick={()=>{this.updatePart(item)}} className={styles.buttonClick} title={textAllValue}>{textValue}</div> 
                    }else{
                        return <div onClick={()=>{this.updatePart(item)}} className={styles.buttonClick}>添加</div> 
                    }
                },
            },
            {
                title: '操作',
                render: (value, item, index) => {
                    return this.showOperate(value, item, index)
                },
            },
        ]
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '40px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const formItemLayouts = {
            labelCol: {
                span: 6,
                style: {
                    width: '70px',
                    textAlign: 'right',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const { getFieldDecorator } = this.props.form
        const content = <div>
            <p>1.店铺初次绑定只同步三个月内的数据，三个月前数据需要下载历史订单上传；</p>
            <p>2.店铺创建后将不可删除！</p>
            <p>3.虎赞小店(小程序)、TB、TMALL、京东、有赞等类型店铺，授权后数据自动同步。</p>
        </div>
        const titleHelp = <Popover content={content} placement="bottomLeft" title="" trigger="hover" overlayStyle={{maxWidth: 250}}>
            <Icon className="hz-text-primary hz-icon-size-default hz-icon-popover" type='question-circle' />
        </Popover>

        return (
            <Page>
                {/*头部面包屑*/}
                <Page.ContentHeader
                    title={this.props.documentTitle}
                    titleHelp={titleHelp}
                    helpUrl="http://newhelp.51zan.cn/manual/content/%E7%B3%BB%E7%BB%9F%E8%AE%BE%E7%BD%AE/%E5%BA%97%E9%93%BA.md"
                    action={(
                        <div>
                            {/* <div style={{color:'#999',marginBottom: 16}}>
                                <span>店铺初次绑定只同步三个月内的数据，三个月前数据需要下载历史订单上传。店铺创建后将不可删除！虎赞小店(小程序)、TB、TMALL、聚水潭、京东、有赞等类型店铺，授权后数据自动同步。</span>
                            </div> */}
                            {
                                version_id ===10 || version_id ===0 ?'':<div className={styles.alert}>
                                    <img src={warnIcon} className={styles.warnIcon} alt='' />
                                    <span>聚水潭ERP系统的京东、有赞店铺已恢复授权和订单同步功能，并可直接在店铺管理页面中操作授权。聚水潭ERP系统的天猫、淘宝店铺授权恢复时间待定，请知悉!</span>
                                </div>
                            }
                            
                            <div>
                                <Button
                                    type="primary"
                                    onClick={this.createShop}
                                >创建店铺
                                </Button>
                               
                                {
                                    version_id ===10 || version_id ===0 ?'':<Fragment> <Button
                                        style={{marginLeft:16}}
                                        type="primary"
                                        onClick={this.dueSet}
                                    >授权过期设置
                                    </Button>
                                    <Button
                                        style={{marginLeft:16}}
                                        type="primary"
                                        onClick={this.jstOauth}
                                    >聚水潭店铺授权
                                    </Button></Fragment>
                                }
                                
                                <a ref={node => this.refsNode = node} href={jstOauthUrl} target="_blank" rel='noopener noreferrer' style={{display: 'none'}} >授权</a>
                            </div> 
                        </div>
                    )}
                />
                <div>
                    <Page.ContentAdvSearch>
                        <Form layout="horizontal" className="hz-from-search">
                            <Row>
                                <Col span={8}>
                                    <Form.Item label="类型" {...formItemLayout}>
                                        {getFieldDecorator("shopType", {})(
                                            <Select
                                                onChange={this.onChangeShopType}
                                                dropdownClassName={styles.userSelect}
                                                getPopupContainer={triggerNode=>triggerNode.parentNode}
                                                placeholder='不限'
                                            >
                                                <Option value=''>不限</Option>
                                                {
                                                    SHOP_TYPE.map((item) => {
                                                        return <Option value={item.value} key={item.value}>{item.type}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="状态" {...formItemLayout}>
                                        {getFieldDecorator("shopStatus", {})(
                                            <Select
                                                onChange={this.onChangeShopStatus}
                                                getPopupContainer={triggerNode=>triggerNode.parentNode}
                                                placeholder='不限'
                                            >
                                                <Option value="">不限</Option>
                                                {
                                                    OAUTH_STATE.map((item) => {
                                                        return <Option value={item.value} key={item.value}>{item.type}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="店铺名称"  {...formItemLayouts}>
                                        {getFieldDecorator("shopName", {})(
                                            <Input
                                                onChange={this.onChangeShopName}
                                                onPressEnter={this.onPressEnter}
                                                placeholder="输入名称"
                                            />
                                        )}
                                    </Form.Item>
                                </Col>

                            </Row>
                            <Row>
                                <Col span={8}>
                                    <Col span={3} style={{width: '40px'}}></Col>
                                    <Col span={16}>
                                        <Button className="hz-btn-width-default" type="primary" htmlType="submit" onClick={this.shopSearch}>
                                            <Icon type="search"/>
                                            搜索
                                        </Button>
                                        <Button className="hz-btn-width-default hz-margin-base-left" onClick={this.resetSearchHandler}>
                                            重置
                                        </Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </Page.ContentAdvSearch>

                    {/*表格数据*/}
                    <Row>
                        <Table columns={columns} dataSource={shopData} pagination={false} rowKey="id" loading={loading} />
                        {shopData && shopData.length > 0 ?
                            <Pagination
                                className="ant-table-pagination"
                                current={currentPage}
                                total={totalPage}
                                showTotal={(total) => `共 ${total} 条`}
                                showQuickJumper={true}
                                showSizeChanger={true}
                                pageSize={perPage}
                                pageSizeOptions={['10', '20', '50', '100']}
                                onShowSizeChange={this.handleListPageChangeSize}
                                onChange={this.handleListPageChange}
                            />
                            : ''}
                    </Row>
                    {/*弹窗*/}
                    <CreateShop></CreateShop>
                    <SelectPart></SelectPart>
                    <ShopOauthTaoTemp></ShopOauthTaoTemp>
                    <ShopOauthXuan></ShopOauthXuan>
                    <ShopEditeTao></ShopEditeTao>
                    <ShopEditeXuan key={new Date()}></ShopEditeXuan>
                    <ShopEditeStore></ShopEditeStore>
                    <ShopInfoTao></ShopInfoTao>
                    <DeleteOauthTao></DeleteOauthTao>
                    <DeleteOauthXuan></DeleteOauthXuan>
                    <TaoOauthBack></TaoOauthBack>
                    <ShopOauthJd></ShopOauthJd>
                    <DueSet></DueSet>
                </div>
            </Page>
        )
    }
}
