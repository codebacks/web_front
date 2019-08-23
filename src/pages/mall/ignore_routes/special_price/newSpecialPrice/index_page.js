import { PureComponent } from 'react'
import Page from 'components/business/Page'
import { Button, Row, Col, Form, DatePicker, Icon, Input } from 'antd'
import styles from './index.less'
import SelectGoods from './Modal/SelectGoods'
import { connect } from 'dva'
import router from 'umi/router'
import DocumentTitle from 'react-document-title'
import numeral from 'numeral'
import moment from 'moment'

const ImageUrl = '//image.yiqixuan.com/'
const { RangePicker } = DatePicker

@Form.create()
@connect(({base, mall_special_price}) => ({
    base, mall_special_price
}))
export default class extends PureComponent {
    state = {
        type: '新增',
        visible: false,
        isSelect: false,
        img: '',
        name: '',
        goodDetail: {},
        isEdit: false,
        currentPage: 1,
        pageSize: 10,
        loading: false,
        searchStr: ''
    }

    componentDidMount () {
        let { id } = this.props.location.query
        if (id) {
            this.props.dispatch({
                type: 'mall_special_price/editGoodInfo',
                payload: {
                    id: id
                },
                callback: (data) => {
                    this.setState({
                        isSelect: true,
                        type: '编辑',
                        img: data.goods_sku.cover_url,
                        name: data.goods_sku.name,
                        isEdit: true,
                        goodDetail: data
                    })
                    this.props.form.setFieldsValue({'specialInput': numeral(data.price / 100).format('0,00.00')})
                    this.props.form.setFieldsValue({'originInput': numeral(data.goods_sku.price / 100).format('0,00.00')})
                    this.props.form.setFieldsValue({'rangePicker': [moment(data.begin_at),moment(data.end_at)]})
                }
            })
        }
    }

    /* 页面方法 */
    validateSelect = (rule, value, callback) => {
        const { id } = this.state.goodDetail
        if (!id) {
            callback('请选择商品')
        }
        callback()
    }

    validatePrice = (rule, value, callback) => {
        let { id } = this.props.location.query
        let price = ''
        if (id) {
            price = this.state.goodDetail.goods_sku.price
        }  else {
            price = this.state.goodDetail.price
        }
        if (value && !/^[0-9]+(.[0-9]{1,2})?$/.test(value)) {
            callback('价格必须是数字且最多保留两位小数')
        } else if (value && price && value * 100 >= price) {
            callback('特价价格必须小于商品原价')
        } else if (parseFloat(value) === 0) {
            callback('特价价格不能为0')
        }
        callback()
    }

    validateTimeRange = (rule, value, callback) => {
        let currentTime = moment().format()
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
            loading: true
        })
        this.props.dispatch({
            type: 'mall_special_price/searchGoodsList',
            payload: {
                page: this.state.currentPage - 1,
                per_page: this.state.pageSize
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
        this.setState({
            visible: true
        })
    }

    onCloseModal = (value) => {
        this.setState({
            visible: false,
            searchStr: '',
            currentPage: 1
        })
        if (value) {
            value.goods_sku_id = value.id
            this.setState({
                isSelect: true,
                img: value.cover_url,
                name: value.goods.name,
                goodDetail: value
            }, () => {
                this.props.form.setFieldsValue({'originInput': numeral(value.price / 100).format('0,00.00')})
                this.props.form.validateFields(['spacialInput','chooseGoods'],{force: true})
            })
        }
    }

    onCloseSelect = () => {
        this.props.form.setFieldsValue({
            'originInput': '',
            'rangePicker': [],
            'specialInput': ''
        })
        this.setState({
            isSelect: false,
            goodDetail: {}
        }, () => {
            this.props.form.validateFields(['chooseGoods'],{force: true})
        })
    }

    onSave = (e) => {
        e.preventDefault()

        let { id } = this.props.location.query, type = ''
        const { form } = this.props
        if (id) {
            type = 'saveEditGood'
        } else {
            type = 'saveNewGood'
        }
        form.validateFields((error,value) => {
            if (error) {
                return
            }
            const { goods_id, goods_sku_id } = this.state.goodDetail
            this.props.dispatch({
                type: `mall_special_price/${type}`,
                payload: {
                    begin_at: value.rangePicker[0].format('YYYY-MM-DD HH:mm:ss'),
                    end_at: value.rangePicker[1].format('YYYY-MM-DD HH:mm:ss'),
                    goods_id: goods_id,
                    id: this.state.goodDetail.id,
                    goods_sku_id: goods_sku_id,
                    price: value.specialInput * 100
                },
                callback: (data) => {
                    if (data.success) {
                        router.replace(`/mall/special_price`)
                    }
                }
            })
        })
        
    }

    onReturn = () => {
        router.replace('/mall/special_price')
    }

    /* 模态框事件 */

    handleChangeSize = (value, pageSize) => {
        const { searchStr } = this.state
        this.setState({
            pageSize: pageSize,
            currentPage: value,
            loading: true
        })
        this.props.dispatch({
            type: 'mall_special_price/searchGoodsList',
            payload: {
                page: value - 1,
                per_page: pageSize,
                goods_name: searchStr
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    goToPage = (page, pageSize) => {
        const { searchStr } = this.state
        this.setState({
            currentPage: page,
            loading: true
        })
        this.props.dispatch({
            type: 'mall_special_price/searchGoodsList',
            payload: {
                page: page - 1,
                per_page: this.state.pageSize,
                goods_name: searchStr
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    handleSearch = (value) => {
        this.setState({
            currentPage: 1,
            loading: true,
            searchStr: value
        })
        this.props.dispatch({
            type: 'mall_special_price/searchGoodsList',
            payload: {
                page: 0,
                per_page: this.state.pageSize,
                goods_name: value
            },
            callback: (data) => {
                this.setState({
                    loading: false
                })
            }
        })
    }

    render () {
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: {
                    width: '80px',
                },
            },
            wrapperCol: {
                span: 16,
            },
        }
        const selectLabel = <span className={styles.goodRequired}>选择商品</span>

        const { getFieldDecorator } = this.props.form
        const { searchGoodsList, count } = this.props.mall_special_price
        const {
            visible,
            isSelect,
            img,
            isEdit,
            type,
            currentPage,
            pageSize,
            loading
        } = this.state

        return (
            <DocumentTitle title={isEdit ? '编辑特价' : '新增特价'}>
                <Page>
                    <Page.ContentHeader
                        hasGutter={false}
                        breadcrumbData={[{
                            name: '特价',
                            path: '/mall/special_price'
                        },{
                            name: type
                        }]}
                    />
                    <div style={{marginTop: '24px'}}>
                        <Form onSubmit={this.onSave}>
                            <Form.Item label={selectLabel} {...formItemLayout}>
                                {getFieldDecorator('chooseGoods',{
                                    rules: [
                                        {
                                            validator: this.validateSelect
                                        }
                                    ]
                                })(
                                    <div>
                                        {isSelect ?
                                            <div className={styles.selectGood}>
                                                <img src={ImageUrl + img} alt='' />
                                                {!isEdit && <Icon
                                                    type="close-circle"
                                                    theme="filled"
                                                    className={styles.closeIcon}
                                                    onClick={this.onCloseSelect}
                                                />}
                                            </div>
                                            :
                                            <span className={styles.goodsBox} onClick={this.onOpenModal}>
                                                <Icon type='plus' style={{fontSize:'30px'}}/>
                                            </span>
                                        }
                                    </div>
                                )}
                            </Form.Item>
                            <Form.Item  label='特价' {...formItemLayout}>
                                {getFieldDecorator('specialInput',{
                                    rules: [
                                        {
                                            required: true,
                                            message: '请填写特价价格'
                                        },{
                                            validator: this.validatePrice
                                        }
                                    ]
                                })(
                                    <Input className={styles.input} />
                                )} 
                            </Form.Item>
                            <Form.Item  label='原价' {...formItemLayout}>
                                {getFieldDecorator('originInput',{
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择商品'
                                        }
                                    ]
                                })(
                                    <Input disabled={true} className={styles.input} />
                                )} 
                            </Form.Item>
                            <Form.Item  label='活动时间' {...formItemLayout}>
                                {getFieldDecorator('rangePicker',{
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择活动时间'
                                        },{
                                            validator: this.validateTimeRange
                                        }
                                    ]
                                })(
                                    <RangePicker
                                        showTime
                                        format="YYYY-MM-DD HH:mm:ss"
                                        style={{width: '320px'}}
                                    />
                                )} 
                            </Form.Item>
                            <Row>
                                <Col style={{marginLeft: '80px'}}>
                                    <Button type='primary' htmlType='submit'>保存</Button>
                                    <Button style={{marginLeft: '16px'}} onClick={this.onReturn}>返回</Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <SelectGoods
                        closeModal={this.onCloseModal}
                        data={searchGoodsList}
                        visible={visible}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalPage={count}
                        handleChangeSize={this.handleChangeSize}
                        goToPage={this.goToPage}
                        handleSearch={this.handleSearch}
                        loading={loading}
                    />
                </Page>
            </DocumentTitle>
        )
    }
}