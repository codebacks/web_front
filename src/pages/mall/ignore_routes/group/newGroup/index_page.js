import { PureComponent } from 'react'
import Page from 'components/business/Page'
import { Button, Row, Col, Form, DatePicker, Input, Radio, Table, Popover, message, Modal, Icon } from 'antd'
import styles from './index.less'
import SelectGoods from './Modal/SelectGoods'
import DocumentTitle from 'react-document-title'
import { connect } from 'dva'
import numeral from 'numeral'
import moment from 'moment'
import router from 'umi/router'
import BatchPopover from './BatchPopover/BatchPopover'
import _ from 'lodash'
import PlusSvg from '../../../../../assets/font_icons/plus.svg'

const RadioGroup = Radio.Group
const confirm = Modal.confirm
const ImageUrl = '//image.yiqixuan.com/'
const { RangePicker } = DatePicker

@Form.create()
@connect(({ base, mall_group }) => ({
    base, mall_group
}))
export default class extends PureComponent {
    state = {
        visible: false,
        isEdit: false,
        value: 1,
        tableData: [],
        selectedRowKeys: [],
        goods_id: 0,
        groupDetail: {},
        loading: false,
        subLoading: false,
        disDeletBatch: true,
        disEditBatch: true,
        popoverVisible: false,
        currentPage: 1,
        pageSize: 10,
        searchStr: ''
    }

    componentDidMount () {
        let { id } = this.props.location.query
        if (id) {
            this.setState({
                isEdit: true,
                loading: true
            })
            this.props.dispatch({
                type: 'mall_group/groupDetail',
                payload: {
                    id: id
                },
                callback: (data) => {
                    this.dealTableData(data)
                    this.setState({
                        groupDetail: data,
                        goods_id: data.goods.id,
                        value: data.is_owner_free
                    })
                    this.props.form.setFieldsValue({
                        'rangePicker': [moment(data.begin_at),moment(data.end_at)],
                        'invalidTime': data.expire,
                        'minCount': data.min_join_count,
                        'buyLimit': data.buy_limit_count
                    })
                }
            })
        }
    }

    /* 页面方法 */

    dealTableData = (value) => {
        if (value.id && value.name) { // 将商品信息请求数据处理为表格数据
            for (let i = 0, len = value.sku.length; i < len; i++) {
                value.sku[i].name = value.name
                value.sku[i].sku_description = this.showSpecs(value.sku[i])
            }
            this.setState({
                tableData: value.sku,
                goods_id: value.id,
                loading: false
            })
        } else { // 将拼团信息请求数据处理为表格数据
            for (let i = 0, len = value.skus.length; i < len; i++) {
                value.skus[i].name = value.goods.name
                value.skus[i].cover_url = value.goods.cover_url
                value.skus[i].specialPrice = parseFloat(value.skus[i].price / 100)
                value.skus[i].price = value.skus[i].origin_price
            }
            this.setState({
                tableData: value.skus,
                loading: false
            })
        }
    }

    showSpecs (value) {
        if (value.spec_c) {
            return value.spec_a + ':' + value.property_a + ',' + value.spec_b + ':' + value.property_b + ',' + value.spec_c + ':' + value.property_c + ';'
        } else if (value.spec_b) {
            return value.spec_a + ':' + value.property_a + ',' + value.spec_b + ':' + value.property_b + ';'
        } else if (value.spec_a) {
            return value.spec_a + ':' + value.property_a + ';'
        } else {
            return ''
        }
    }

    /* 表单验证 */
    validateRangePicker = (rule, value, callback) => {
        const currentTime = moment().format()
        if (value && value.length && value[0].format() <= currentTime) {
            callback('活动开始时间必须大于当前时间')
        } else if (value && value.length && value[0].format() === value[1].format()) {
            callback('开始结束时间请勿一样')
        }
        callback()
    }

    /* 事件处理 */
    onOpenModal = () => {
        this.setState({
            subLoading: true
        })
        this.props.dispatch({
            type: 'mall_group/selectGoods',
            payload: {
                per_page: 10
            },
            callback: () => {
                this.setState({
                    subLoading: false
                })
            }
        })
        this.setState({
            visible: true
        })
    }

    onCloseModal = (value) => {
        this.setState({
            visible: false
        })
        if (value) {
            this.setState({
                loading: true,
                selectedRowKeys: [],
                disDeletBatch: true,
                disEditBatch: true
            })
            this.props.dispatch({
                type: 'mall_group/goodDetail',
                payload: {
                    id: value
                },
                callback: (data) => {
                    this.dealTableData(data)
                }
            })
        }
    }

    onChangePrice = (event, index) => {
        let tempData = JSON.parse(JSON.stringify(this.state.tableData))
        tempData[index].specialPrice = event.target.value
        this.setState({
            tableData: tempData
        })
    }

    onDeleteItem = (item, index) => {
        const { selectedRowKeys, isEdit } = this.state
        let deleteId = isEdit ? item.goods_sku_id : item.id
        let newSelectedRow = _.difference(selectedRowKeys, [deleteId])
        let tempArr = JSON.parse(JSON.stringify(this.state.tableData))
        tempArr.splice(index,1)
        if (newSelectedRow.length) {
            this.setState({
                tableData: tempArr,
                selectedRowKeys: newSelectedRow
            })
        } else {
            this.setState({
                tableData: tempArr,
                selectedRowKeys: newSelectedRow,
                disEditBatch: true,
                disDeletBatch: true
            })
        }
    }

    onChangeSelect = (selectedRowKeys) => {
        if (selectedRowKeys.length) {
            this.setState({
                selectedRowKeys: selectedRowKeys,
                disDeletBatch: false,
                disEditBatch: false
            })
        } else {
            this.setState({
                selectedRowKeys: selectedRowKeys,
                disDeletBatch: true,
                disEditBatch: true
            })
        }
    }

    onSaveBatch = (value) => {
        const { form } = this.props
        const { tableData, isEdit, selectedRowKeys } = this.state
        for (let i = 0, leng = tableData.length; i < leng; i++) {
            for (let j = 0, len = selectedRowKeys.length; j < len; j++) {
                if (isEdit) {
                    if (selectedRowKeys[j] === tableData[i].goods_sku_id) {
                        form.setFieldsValue({
                            [`specialPrice${tableData[i].goods_sku_id}`]: value
                        })
                    }
                } else {
                    if (selectedRowKeys[j] === tableData[i].id) {
                        form.setFieldsValue({
                            [`specialPrice${tableData[i].id}`]: value
                        })
                    }
                }
            }
            
        }
        this.setState({
            popoverVisible: false
        })
    }

    onCancelPopVisi = () => {
        this.setState({
            popoverVisible: false
        })
    }

    onDeleteBatch = () => {
        let that = this
        let { selectedRowKeys, tableData, isEdit } = this.state
        confirm({
            title: '确认删除选中规格？',
            onOk() {
                let tempArr = JSON.parse(JSON.stringify(tableData))
                for (let j = tableData.length - 1; j >= 0; j--) {
                    for (let i = 0, leng = selectedRowKeys.length; i < leng; i++) {
                        if (isEdit) {
                            if (selectedRowKeys[i] === tableData[j].goods_sku_id) {
                                tempArr.splice(j, 1)
                            }
                        } else {
                            if (selectedRowKeys[i] === tableData[j].id) {
                                tempArr.splice(j, 1)
                            }
                        }
                    }
                }
                that.setState({
                    tableData: tempArr,
                    selectedRowKeys: [],
                    disDeletBatch: true,
                    disEditBatch: true
                })
            },
        })
        
    }

    // 提交数据
    onSubmit = (e) => {
        e.preventDefault()
        
        const { form } = this.props
        const { isEdit, groupDetail, goods_id } = this.state

        form.validateFields((error,value) => {
            if (error) {
                return
            }
            const datas = JSON.parse(JSON.stringify(this.state.tableData)).map(item => {
                if (isEdit) {
                    return {
                        goods_sku_id: item.goods_sku_id,
                        origin_price: item.origin_price,
                        sku_description: item.sku_description,
                        price: value[`specialPrice${item.goods_sku_id}`] * 100
                    }
                } else {
                    return {
                        goods_sku_id: item.id,
                        origin_price: item.price,
                        sku_description: item.sku_description,
                        price: value[`specialPrice${item.id}`] * 100
                    }
                }
            })
            let params = {
                begin_at: value.rangePicker[0].format('YYYY-MM-DD HH:mm:ss'),
                end_at: value.rangePicker[1].format('YYYY-MM-DD HH:mm:ss'),
                buy_limit_count: value.buyLimit,
                expire: parseFloat(value.invalidTime),
                goods_id: goods_id,
                is_owner_free: value.radio,
                min_join_count: value.minCount,
                sku: datas
            }
            if (isEdit && !error) {
                if (datas.length) {
                    this.props.dispatch({
                        type: 'mall_group/editGroup',
                        payload: {
                            params: params,
                            id: groupDetail.id
                        },
                        callback: (data) => {
                            if (data.success) {
                                router.replace(`/mall/group`)
                            }
                        }
                    })
                } else {
                    message.warning('请设置规格')
                }
            } else {
                if (datas.length) {
                    this.props.dispatch({
                        type: 'mall_group/addGroup',
                        payload: params,
                        callback: (data) => {
                            if (data.success) {
                                router.replace(`/mall/group`)
                            }
                        }
                    })
                } else {
                    message.warning('请新增商品')
                }
            }
        })
    }

    onAddSku = () => {
        const { goods_id } = this.state
        this.setState({
            loading: true
        })
        this.props.dispatch({
            type: 'mall_group/goodDetail',
            payload: {
                id: goods_id
            },
            callback: (data) => {
                const { tableData } = this.state
                const newSkus = data.sku.map(item => ({
                    created_at: item.created_at,
                    deleted_at: item.deleted_at,
                    goods_sku_id: item.id,
                    cover_url: item.cover_url,
                    name: data.name,
                    origin_price: item.price,
                    price: item.price,
                    sku_description: this.showSpecs(item),
                    stock_count: item.stock_count,
                    updated_at: item.updated_at
                }))
                const newData = _.unionBy(tableData, newSkus, 'goods_sku_id')
                this.setState({
                    tableData: newData,
                    loading: false
                })
            }
        })
    }

    /* 模态框事件 */

    handleChangeSize = (value, pageSize) => {
        const { searchStr } = this.state
        this.setState({
            pageSize: pageSize,
            currentPage: value,
            subLoading: true
        })
        this.props.dispatch({
            type: 'mall_group/selectGoods',
            payload: {
                page: value - 1,
                per_page: pageSize,
                goods_name: searchStr
            },
            callback: (data) => {
                this.setState({
                    subLoading: false
                })
            }
        })
    }

    goToPage = (page, pageSize) => {
        const { searchStr } = this.state
        this.setState({
            currentPage: page,
            subLoading: true
        })
        this.props.dispatch({
            type: 'mall_group/selectGoods',
            payload: {
                page: page - 1,
                per_page: this.state.pageSize,
                goods_name: searchStr
            },
            callback: () => {
                this.setState({
                    subLoading: false
                })
            }
        })
    }

    handleSearch = (value) => {
        this.setState({
            currentPage: 1,
            searchStr: value,
            subLoading: true
        })
        this.props.dispatch({
            type: 'mall_group/selectGoods',
            payload: {
                page: 0,
                per_page: this.state.pageSize,
                goods_name: value
            },
            callback: () => {
                this.setState({
                    subLoading: false
                })
            }
        })
    }

    render () {
        const formItemLayout = {
            labelCol: {
                span: 8,
                style: {
                    width: '136px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }

        const {
            visible,
            loading,
            subLoading,
            tableData,
            isEdit,
            disDeletBatch,
            disEditBatch,
            selectedRowKeys,
            popoverVisible,
            currentPage,
            pageSize
        } = this.state

        const columns = [
            {
                title: '商品',
                dataIndex: 'name',
                render: (value,{ cover_url }) => {
                    return (
                        <div className={styles.goods}>
                            <img src={ImageUrl + cover_url} alt='' className={styles.goodsImg}/>
                            <span style={{marginLeft: '10px'}}>{value}</span>
                        </div>
                    )
                }
            },
            {
                title: '规格',
                dataIndex: 'sku_description'
            },
            {
                title: '库存',
                dataIndex: 'stock_count'
            },
            {
                title: '原价',
                dataIndex: 'price',
                render: (value) => {
                    return <span>{numeral(value/100).format('0,0.00')}</span>
                }
            },
            {
                title: '拼团价格',
                dataIndex: 'specialPrice',
                width: '185px',
                render: (value, item, index) => {
                    return (
                        <Form.Item>
                            {getFieldDecorator(isEdit ? `specialPrice${item.goods_sku_id}` : `specialPrice${item.id}`,{
                                rules: [
                                    {
                                        required: true,
                                        message: '请输入拼团价格'
                                    },{
                                        validator: (rules, value, callback) => {
                                            if (value && !/^[0-9]+(.[0-9]{1,2})?$/.test(value)) {
                                                callback('价格必须是数字且最多保留两位小数')
                                            } else if (value && value <= 0) {
                                                callback('价格不能为0')
                                            }
                                            callback()
                                        }
                                    }
                                ],
                                initialValue: value
                            })(
                                <Input style={{width: '102px'}}/>
                            )}
                        </Form.Item>

                    )
                }
            },
            {
                title: '操作',
                dataIndex: 'action',
                render: (value, item, index) => {
                    return <a href='javascript:;' style={{textDecoration: 'none'}} onClick={() => this.onDeleteItem(item, index)}>删除</a>
                }
            },
        ]
        const { getFieldDecorator } = this.props.form

        const content = (
            <div className={styles.popover}>
                <BatchPopover tableData={tableData} onSaveBatch={this.onSaveBatch}  onCancel={this.onCancelPopVisi}/>
            </div>
        )
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onChangeSelect
        }

        const { selectGoods, count } = this.props.mall_group

        return (
            <DocumentTitle title={isEdit ? '编辑拼团' : '创建拼团'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '拼团',
                            path: '/mall/group'
                        },{
                            name: isEdit ? '编辑' :'新增'
                        }]}
                    />
                    <Form onSubmit={this.onSubmit}>
                        <Page.ContentBlock title='基础设置'>
                            <div style={{overflow: 'hidden', marginBottom: '10px'}}>
                                <Form.Item label='团长免单' {...formItemLayout}>
                                    {getFieldDecorator(`radio`,{
                                        rules: [
                                            {required: true}
                                        ],
                                        initialValue: this.state.value
                                    })(
                                        <RadioGroup>
                                            <Radio value={1}>不免单</Radio>
                                            <Radio value={2}>免单</Radio>
                                        </RadioGroup>
                                    )}
                                </Form.Item>
                                <Form.Item  label='活动起止时间' {...formItemLayout}>
                                    {getFieldDecorator('rangePicker',{
                                        rules: [
                                            {
                                                required: true,
                                                message: '请选择活动起止时间'
                                            },{
                                                validator: this.validateRangePicker
                                            }
                                        ]
                                    })(
                                        <RangePicker style={{width: '320px'}} showTime format="YYYY-MM-DD HH:mm:ss" />
                                    )} 
                                </Form.Item>
                                <Form.Item  label='拼团失效时间' {...formItemLayout}>
                                    {getFieldDecorator('invalidTime',{
                                        rules: [
                                            {
                                                required: true,
                                                message: '请设置拼团失效时间'
                                            },{
                                                validator: (rule, value, callback) => {
                                                    if (!/^\+?[1-9][0-9]*$/.test(value) || value > 24) {
                                                        callback('拼团失效时间必须为整数且在1-24之间')
                                                    }
                                                    callback()
                                                }
                                            }
                                        ]
                                    })(
                                        <Input className={styles.formInput} suffix='小时' placeholder='拼团失效时间为1-24小时' />
                                    )} 
                                </Form.Item>
                                <Form.Item  label='开团人数' {...formItemLayout}>
                                    {getFieldDecorator('minCount',{
                                        rules: [
                                            {
                                                required: true,
                                                message: '请设置开团人数'
                                            },{
                                                validator: (rule, value, callback) => {
                                                    if (!/^\+?[1-9][0-9]*$/.test(value) || value < 2) {
                                                        callback('开团人数必须为正整数且最少2人')
                                                    }
                                                    callback()
                                                }
                                            }
                                        ]
                                    })(
                                        <Input className={styles.formInput} suffix='人' placeholder='开团人数至少为2人' />
                                    )} 
                                </Form.Item>
                                <Form.Item  label='单个用户购买上限' {...formItemLayout}>
                                    {getFieldDecorator('buyLimit',{
                                        rules: [
                                            {
                                                required: true,
                                                message: '请设置单个用户购买上限'
                                            },{
                                                validator: (rules, value, callback) => {
                                                    if (!/^\d+$/.test(value)) {
                                                        callback('单个用户购买上限必须是大于或等于0的整数')
                                                    }
                                                    callback()
                                                }
                                            }
                                        ]
                                    })(
                                        <Input className={styles.formInput} suffix='件' placeholder='设置为0表示不设上限' />
                                    )} 
                                </Form.Item>
                            </div>
                        </Page.ContentBlock>
                        <Page.ContentBlock title='商品设置'>
                            <Row style={{marginBottom: '16px'}}>
                                {isEdit ?
                                    <Button type='primary' onClick={this.onAddSku}>
                                        <Icon component={PlusSvg} style={{fontSize: '16px'}} />
                                        添加规格
                                    </Button>
                                    :
                                    <Button type='primary' onClick={this.onOpenModal}>
                                        <Icon component={PlusSvg} style={{fontSize: '16px'}} />
                                        添加商品
                                    </Button>
                                }
                                <Popover
                                    content={content}
                                    trigger="click"
                                    placement="bottomLeft"
                                    arrowPointAtCenter={true}
                                    visible={popoverVisible}
                                    onVisibleChange={(visible) => {this.setState({popoverVisible: visible})}}

                                >
                                    <Button className={styles.marginLeft} disabled={disEditBatch}>批量修改</Button>
                                </Popover>
                                <Button className={styles.marginLeft} disabled={disDeletBatch} onClick={this.onDeleteBatch}>批量删除</Button>
                            </Row>
                            <Table
                                columns={columns}
                                loading={loading}
                                dataSource={tableData}
                                rowSelection={rowSelection}
                                pagination={false}
                                rowKey={isEdit ? 'goods_sku_id' : 'id'}
                            />
                            <Row>
                                <Col style={{marginTop: '16px'}}>
                                    <Button type='primary' htmlType='submit'>保存</Button>
                                    <Button style={{marginLeft: '16px'}} onClick={() => {router.replace('/mall/group')}}>返回</Button>
                                </Col>
                            </Row>
                        </Page.ContentBlock>
                    </Form>
                    <SelectGoods
                        data={selectGoods}
                        loading={subLoading}
                        closeModal={this.onCloseModal}
                        visible={visible}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalPage={parseFloat(count)}
                        handleChangeSize={this.handleChangeSize}
                        goToPage={this.goToPage}
                        handleSearch={this.handleSearch}
                    />                
                </Page>
            </DocumentTitle>
        )
    }
}