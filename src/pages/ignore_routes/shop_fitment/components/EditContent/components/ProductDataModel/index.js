import { PureComponent } from 'react'
import { connect } from 'dva'
import { Modal, Col, Row, Button, Form, Input, Table, Pagination, Tooltip } from 'antd'
// import { searchGoodsList } from 'mall/services/marketing/specialPrice'
import styles from './index.less'
import numeral from 'numeral'
import _ from 'lodash'
const {warning} = Modal 
const ImageUrl = '//image.yiqixuan.com/'

@Form.create()
@connect(({shop_fitment}) => ({
    shop_fitment
}))
export default class extends PureComponent {
    state = {
        data:[],
        selectedKeys:[],
        selectedRowKeys:[],
        total:0,
        loading:false,
        ...this.pager
    }
    pager = {
        current:1,
        pageSize:10
    }

    componentDidUpdate(prevProps){
        if(!prevProps.visible && this.props.visible){
            this.getList()
            this.pager.current = 1
            this.pager.pageSize = 10
            this.selectedRowKeys =[]
        }
    }
    getList = () => {
        let {productIds} = this.props
        
        let ids = []
        productIds.forEach(item=>{
            if(!isNaN(item)){
                ids.push(item)
            }
        })
        this.setState({
            selectedKeys: ids.slice(),
            selectedRowKeys: ids.slice()
        },()=>{
            this.searchGoods()
        })
    }
    showSpecs(value) {
        let specificList = ''
        if (value.property_a) {
            specificList += value.property_a
            if (value.property_b) {
                specificList += '；' + value.property_b
            }
            if (value.property_c) {
                specificList += '；' + value.property_c
            }
        }
        return specificList
    }
    onCancel = () => {
        this.props.onClose()
    }

    searchGoods = (value,t) => {
        this.setState({
            loading:true
        })
        const {model} = this.props
        
        let active = model.active
        let page = {
            page:  this.pager.current - 1,
            per_page: this.pager.pageSize
        }
        let default_payload = {
            status: 1,
            goods_name: value,
            ...page
        }
        if(["SingleImg","Banner"].indexOf(model.name)===-1){
            default_payload.activity_type = 4
        }
        let activeType = {
            default:{
                type:'shop_fitment/searchGoodsList',
                payload: default_payload,
                callback: this.setTotal
            },
            pingtuan:{
                type:'shop_fitment/ptList',
                payload: {
                    status: 2,
                    order_by: 'end_at asc',
                    ...page
                },
                callback: this.setTotal
            },
            tejia:{
                type:'shop_fitment/getGoodsList',
                payload: {
                    status: 2
                },
                callback: this.setTotal
            },
            tuijian:{
                type:'shop_fitment/goodsList',
                payload: {
                    goods_name: value,
                    status: 1,
                    activity_type: 3,
                    ...page
                },
                callback: this.setTotal
            }
        }
        let body = activeType[active]? activeType[active] : activeType.default

        this.props.dispatch({...body}).then(res=>{
            this.setState({
                ...this.pager,
                loading:false
            })
        })
    }
    setTotal =(count) =>{
        this.setState({
            total:!isNaN(count)? Number(count) : 0
        })
    }
    onSearch = (t) => {
        const { form } = this.props
        let searchValue = form.getFieldValue('input')
        if(searchValue && t){
            this.pager.current = 1
        }
        this.searchGoods(searchValue)
    }

    handleChangeSize = (value, pageSize) => {
        this.pager = {
            current:1,
            pageSize
        }
        this.onSearch()
    }

    goToPage = (page) => {
        this.pager.current = page
        this.onSearch()
    }
    onSelectChange = (selectedKeys)=>{
        this.setState({ selectedKeys})
    }
    selectedRowKeys = []
    onSelect = (record, selected)=>{
        let {selectedRowKeys} = this.state
        let { productIds } = this.props
        let id = record.goods_id || record.id
        // 为了选择老的数据位置不变
        // selectedRowKeys copy productIds，
        // 删除的占位为 null，方便后续放入,新增加的放入 this.selectedRowKeys 中
        
        let _index = productIds.indexOf(id)
        if(selected){
            if(_index > -1 ){
                selectedRowKeys[_index] = id
            }else{
                if(this.selectedRowKeys.indexOf(id) === -1){
                    this.selectedRowKeys.unshift(id)
                }
            }
        }else{
            if( _index > -1){
                selectedRowKeys[_index] = null
            }else{
                _index = this.selectedRowKeys.indexOf(id)
                this.selectedRowKeys.splice(_index,1)
            }
        }
        this.setState({ selectedRowKeys})
    }
    onSelectAll = (selected, _, changeRows) => {
        const { selectedRowKeys } = this.state
        let { productIds } = this.props
        let rows = changeRows.map(i => i.goods_id || i.id)
        rows.forEach(item => {
            let I = productIds.indexOf(item)
            if (selected) {
                // 放在原有的位置上x
                if (I > -1) {
                    selectedRowKeys[I] = item
                } else {
                    if(this.selectedRowKeys.indexOf(item) === -1){
                        this.selectedRowKeys.push(item)
                    }
                }
            }else {
                if(I > -1){
                    selectedRowKeys[I] = null
                }else{
                    I = this.selectedRowKeys.indexOf(item)
                    this.selectedRowKeys.splice(I,1)
                }
            }
        })
        this.setState({ selectedRowKeys})
    }
    
    onOk =(e)=>{
        e.preventDefault()
        let selectedRowKeys = this.state.selectedRowKeys.filter(i => i !== null)
        if (_.intersection(selectedRowKeys,this.selectedRowKeys).length > 0) {
            warning({
                title: '提示',
                content: '不能选择相同的商品',
            })
            return
        }
        selectedRowKeys = this.selectedRowKeys.concat(selectedRowKeys)
        if(selectedRowKeys.length>200){
            warning({
                title: '提示',
                content: '选择的商品不能超过200个',
            })
            return
        }
        this.props.onOk(selectedRowKeys.filter(i=>!isNaN(i)))
    }
    singleProduct = (e,id) => {
        e.preventDefault()
        this.props.onOk([id])
    }
    render() {
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

        const columns = [
            {
                title: '商品',
                dataIndex: 'goods',
                render: (goods, item) => {
                    let name = goods? goods.name : item.name
                    let string = this.showSpecs(name)
                    return <div className={styles.goods}>
                        <img src={ImageUrl + (item.cover_url? item.cover_url:item.goods.cover_url)} alt='' className={styles.goodsImg} />
                        <div className={styles.description}>
                            <div>{name}</div>
                            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#FA8910' }}>￥{numeral((item.price || item.price_low) / 100).format('0,00.00')}</span>
                                {string !== '' ?
                                    <Tooltip placement="bottom" title={string} arrowPointAtCenter>
                                        <span className={styles.specs}>{string}</span>
                                    </Tooltip>
                                    : ''
                                }
                            </div>
                        </div>
                    </div>
                }
            },
            {
                title: '状态',
                width:100,
                dataIndex: 'status',
                render: (value, item) => {
                    if ((item.goods && item.goods.status === 1) || value === 1) {
                        return <span style={{ color: 'rgb(107, 167, 37)' }}>已上架</span>
                    } else {
                        return <span>已下架</span>
                    }
                }
            }
        ]
        
        let filter = ['Banner','SingleImg']
        const { visible,model } = this.props
        const { goodsList } = this.props.shop_fitment
        let row_id = 'id'
        if (model.active && model.active !== 'tuijian') row_id = 'goods_id'
        const data = goodsList[model.active || 'default']
        const { getFieldDecorator } = this.props.form
        const {current,pageSize,total,loading,selectedKeys} = this.state
        
        const rowSelection = {
            selectedRowKeys:selectedKeys,
            onChange: this.onSelectChange,
            onSelect:this.onSelect,
            onSelectAll:this.onSelectAll
        }
        
        let _props = {
            columns: columns,
            dataSource: data,
            rowKey: row_id,
            loading: loading,
            pagination: false
        }
        if(filter.indexOf(model.name) === -1){
            _props.rowSelection = rowSelection
        }else{
            columns.push({
                title: '操作',
                width:100,
                dataIndex: 'opt',
                render: (_, item) => {
                    // eslint-disable-next-line jsx-a11y/anchor-is-valid
                    return <a onClick={(e)=> this.singleProduct(e,item.id) }>选择</a>
                }
            })
            _props.columns = columns
        }

        return (
            <Modal
                title='选择商品'
                destroyOnClose={true}
                visible={visible}
                onOk={this.onOk}
                onCancel={this.onCancel}
                width='800px'
                footer={
                    filter.indexOf(model.name) === -1? <div>
                        <Button onClick={this.onCancel}>取消</Button>
                        <Button onClick={this.onOk} disabled={!(selectedKeys.length && data.length)} type='primary'>确认</Button>
                    </div>:null
                }>
                {filter.indexOf(model.name) === -1?<p style={{color:'#9EA8B1'}}>确认后，商品展现为勾选的最新商品</p>:null} 
                {!model.active || model.active==='tuijian' ?<Row>
                    <Col span={20}>
                        <Form.Item label='商品名称' {...formItemLayout}>
                            {getFieldDecorator('input', {})(
                                <Input />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Button type='primary' style={{ marginTop: '4px' }} onClick={()=> this.onSearch(true)}>搜索</Button>
                    </Col>
                </Row>:null }
                
                <Table {..._props}/>
                <Row>
                    {pageSize && total > 0 ?
                        <Pagination
                            className="ant-table-pagination"
                            current={current}
                            total={total}
                            showTotal={(total) => `共 ${total} 条`}
                            showQuickJumper={true}
                            showSizeChanger={true}
                            pageSize={pageSize}
                            pageSizeOptions={['10', '20', '50', '100']}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goToPage} />
                        : null
                    }
                </Row>
            </Modal>
        )
    }
}