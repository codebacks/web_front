/**
 **@Description:晒图红包-创建/编辑活动
 **@author: wangchunting
 */

import React, { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, DatePicker, Select, Radio, Row, Col, Switch, Button, InputNumber, Icon, Upload, Modal, Popover, Table, Badge } from 'antd'
import styles from "../index.less"
import router from 'umi/router'
import { LIMIT_TYPE, GUIDE_TYPE, getWxCodeQrCodeUrl, AUDIT_MODE, GOODS_RULE } from '../../../services/blueprint'
import { SHOP_TYPE_BLUEPRINT, SHOP_TYPE_ENUM } from '@/common/shopConf'
import moment from 'moment'
import { getImageAbsoulteUrl } from '../../../../../utils/resource'
import classnames from 'classnames'
import _ from 'lodash'
import Success from './success'
import AddGoods from '../modals/add_goods'
import { jine } from '../../../../../utils/display'
import HzInput from '@/components/HzInput'
import TextAreaCount from 'components/TextAreaCount'

@connect(({ base, platform_blueprint }) => ({
    base, platform_blueprint
}))
export default class Create_page extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isGetDataFinish: false,
            ladderData: [""],
            newLadderData: [""],
            guideTypeValue: 3,
            previewVisible: false,
            previewImage: '',
            drainage: false,
            fileList: [],
            shops: '',
            visible: false,
            Img: "",
            qrCodeId: "",
            image_count: "",
            id: "",
            isEdit: false,
            guide_qrcode_img: "",
            explain: "",
            limtValue: 3,
            show: 'create',
            downloadItemID: "",
            downloadItemName: "",
            endOpen: false,
            startValue: null,
            endValue: null,
            isShopsDataLoading: false,
            shop_type: undefined,
            shop_ids: '',
            audit_mode: 1,
            audit_condition: 1,
            shopTypeData: [],
            selectShopType: '',
            selectShops: '',
            red_packet_value: 1,
            shopType: [],
            goodsDetailData: [],
            priceValue: '',
            goods_rule: 1,
            activity_goods_rule_del_ids: [],
            isgoodsEditId: '',
            addGoodsVisible: false,
            goodsKeyRandom: ''
        }
    }

    componentDidMount() {
        this.setState({
            isGetDataFinish: false,
            ladderData: [""],
            newLadderData: [""],
            guideTypeValue: 3,
            previewVisible: false,
            previewImage: '',
            drainage: false,
            fileList: [],
            shop_ids: '',
            shops: '',
            visible: false,
            Img: "",
            qrCodeId: "",
            image_count: "",
            id: "",
            isEdit: false,
            guide_qrcode_img: "",
            explain: "",
            limtValue: 3,
            show: 'create',
            downloadItemID: "",
            downloadItemName: "",
            endOpen: false,
            startValue: null,
            endValue: null,
            isShopsDataLoading: false,
            shop_type: undefined,
            audit_mode: 1,
            audit_condition: 1,
            shopTypeData: [],
            selectShopType: '',
            selectShops: '',
            red_packet_value: 1,
            shopType: []
        })

        this.getshopsData()
        this.getQrcodesData()
        this.getToken()
        // 修改-获取当条修改数据id
        const { id } = this.props.match.params
        if (id) {
            this.setState({
                id,
                isEdit: true,
            }, () => {
                this.getEditData(id)
            })
            this.props.form.setFieldsValue({
                fileList: [{
                    url: '',
                }],
            })
        }
    }

    getEditData = (id) => {
        this.props.dispatch({
            type: 'platform_blueprint/activitiesDetail',
            payload: {
                id: id
            },
            callback: (detailData) => {
                let data = detailData.data
                let detailArr = []
                // 参与商品
                this.setState({
                    goods_rule: data.goods_rule,
                    shop_type: data.shop_type
                })
                // 添加商品
                if (data.activity_goods_rule && data.activity_goods_rule.length) {
                    data.activity_goods_rule.forEach(item => {
                        if (item.goods) {
                            let rule = {
                                id: item.id,
                                amount: Number((item.amount / 100).toFixed(2)),
                                pic_url: item.goods.pic_url,
                                name: item.goods.name,
                                price: item.goods.price,
                                status: item.goods.status,
                                goods_id: item.goods.id,
                                number: item.goods.number,
                                shop_id: item.goods.shop_id,
                                shop_name: item.shop_name
                            }
                            detailArr.push(rule)
                            this.setState({
                                goodsDetailData: detailArr,
                                isgoodsEditId: item.id
                            })
                        }
                    })
                }
            }
        })
    }

    //token
    getToken() {
        this.props.dispatch({
            type: 'platform_blueprint/getToken',
            payload: {
                type: 'image',
            },
        })
    }

    // 新码列表
    getQrcodesData = () => {
        this.props.dispatch({
            type: 'platform_blueprint/qrcodes',
            payload: {
                limit: 6,
                status: 1
            }
        })
    }

    //选择店铺
    handleShopsChange = (values, option) => {
        const lastValue = _.last(values)
        if (lastValue === 'all') {
            setTimeout(() => {
                this.props.form.setFieldsValue({
                    shop_ids: ['all']
                })
                this.setState({
                    shop_ids: ['all']
                })
            }, 100)
        } else {
            const newValues = values.filter(v => v !== 'all')
            const set = () => {
                this.props.form.setFieldsValue({
                    shop_ids: newValues
                })
                this.setState({
                    shop_ids: newValues
                })
            }
            if (newValues.length > 0) {
                setTimeout(() => {
                    set()
                }, 100)
            } else {
                set()
            }
        }
    }

    // 上传截图
    handleImageChange = (v) => {
        const value = v - 0
        this.setState({
            image_count: isNaN(value) || value > 9 ? '' : value
        })
    }


    // 活动引流
    handleSynChange = (e) => {
        this.setState({
            guideTypeValue: e.target.value,
        }, () => {
            this.props.form.validateFields(['guide_qrcode_url', 'guide_qrcode_img', 'guide_words'], { force: true })
        })
    }

    //活动引流-选择新码
    handleCodeChange = (value) => {
        this.setState({
            qrCodeId: value,
            Img: getWxCodeQrCodeUrl('/public/qrcodes/' + value + '.png')
        })
    }

    //活动引流-Switch
    handleSwitchChange = (checked) => {
        this.setState({
            drainage: checked,
            guideTypeValue: ''
        })
    }

    //upload
    handleChange = (info) => {
        let fileList = info.fileList
        if (fileList && fileList.length > 0) {
            if (fileList[0].status === 'done') {
                this.setState({
                    guide_qrcode_img: fileList[0].response.key,
                })
            }
        } else {
            this.setState({
                guide_qrcode_img: '',
            })
        }
        this.setState({ fileList })
    }

    handlePreview = (file) => {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        })
    }

    handlePictureCardRemoveHandler = () => {
        this.props.form.validateFields(['guide_qrcode_img'], { force: true })
    }

    handleCancel = () => this.setState({ previewVisible: false })

    // 添加阶梯
    addLadderData() {
        if (this.state.ladderData.length < 5) {
            this.state.newLadderData.push('')
            this.setState({
                ladderData: this.state.newLadderData
            })
        }
    }
    delLadderData(index) {
        var ladderList = this.state.ladderData
        ladderList.splice(index, 1)
        this.setState({
            ladderData: ladderList
        })
    }

    // 提交
    handleSubmit = (e) => {
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let data = {
                    activity_time: '',
                    begin_at: '',
                    end_at: '',
                    order_begin_at: '',
                    order_end_at: '',
                    rule_amount: [],
                    amount: 0,
                    limit_value: 0,
                    is_parallel: 1,
                    guide_type: 3,
                    guide_qrcode_url: '',
                    fixed_amount: '',
                    guide_qrcode_img: this.state.guide_qrcode_img,
                    shop_ids: values.shop_ids,
                    guide_words: '',
                    audit_mode: this.state.audit_mode,
                    goods_rule: this.state.goods_rule,
                    activity_goods_rule: [],
                    activity_goods_rule_del_ids: [],
                    audit_condition: ''
                }

                if (this.state.audit_mode === AUDIT_MODE.automaticAudit) {
                    data.audit_condition = this.state.audit_condition
                }

                if (values.guide_words) {
                    data.guide_words = values.guide_words
                }
                // 店铺
                if (values.shop_ids[0] === 'all') {
                    // const { shopsData } = this.props.platform_blueprint
                    data.shop_ids = this.state.shopTypeData.map(item => item.id)
                }

                // 活动时间
                if (values.activity_time) {
                    const rangeActivityTime = values.activity_time.map(item => item.format('YYYY-MM-DD HH:mm'))
                    data.begin_at = rangeActivityTime[0]
                    data.end_at = rangeActivityTime[1]
                }

                //订单时间
                if (this.state.startValue) {
                    data.order_begin_at = this.state.startValue.format('YYYY-MM-DD HH:mm:ss')
                }
                if (this.state.endValue) {
                    data.order_end_at = this.state.endValue.format('YYYY-MM-DD HH:mm:ss')
                }

                // 红包类型
                if (values.fix_amount) {
                    data.fixed_amount = Number((values.fix_amount * 100).toFixed(2))
                }

                if (values.red_packet_type === 2) {
                    let rule = {
                        min_amount: Number((values.rule_min_random * 100).toFixed(2)),
                        max_amount: Number((values.rule_max_random * 100).toFixed(2))
                    }
                    data.rule_amount.push(rule)
                } else if ((values.red_packet_type === 3)) {

                    for (var i = 0; i < values.rule_min_amount.length; i++) {
                        var rule = {
                            min_amount: Number((values.rule_min_amount[i] * 100).toFixed(2)),
                            max_amount: Number((values.rule_max_amount[i] * 100).toFixed(2)),
                            amount: Number((values.count_amount[i] * 100).toFixed(2))
                        }
                        data.rule_amount.push(rule)
                    }
                }

                // 参与限制
                const limit_type = this.state.limtValue
                data.limit_type = limit_type
                if (limit_type === LIMIT_TYPE.limitDayValue) {
                    data.limit_value = values.limit_day_value
                } else if (limit_type === LIMIT_TYPE.limitSecondValue) {
                    data.limit_value = values.limit_second_value
                }

                // 活动过滤
                if (values.is_parallel === true) {
                    data.is_parallel = 2
                } else {
                    data.is_parallel = 1
                }


                // 活动引流
                const guide_radio_type = this.state.guideTypeValue
                if (values.guide_type === false) {
                    data.guide_type = 3
                } else if (guide_radio_type === GUIDE_TYPE.syncCode) {
                    data.guide_type = 1
                    data.guide_qrcode_url = '' + values.guide_qrcode_url
                } else if (guide_radio_type === GUIDE_TYPE.custom) {
                    data.guide_type = 2
                    if (values.guide_qrcode_img) {
                        data.guide_qrcode_url = data.guide_qrcode_img
                    }
                }

                if (this.state.isEdit) {
                    data.activity_goods_rule_del_ids = this.state.activity_goods_rule_del_ids
                }

                if (this.state.goods_rule === GOODS_RULE.appointGoods) {
                    const { goodsDetailData } = this.state
                    goodsDetailData.forEach((item, index) => {
                        if (this.state.isEdit) {
                            let rule = {
                                goods_id: item.goods_id,
                                amount: Number((values.amount[item.goods_id] * 100).toFixed(2)),
                                number: item.number,
                                id: this.state.isgoodsEditId,
                                shop_name: item.shop_name,
                                shop_id: item.shop_id
                            }
                            data.activity_goods_rule.push(rule)

                        } else {
                            let rule = {
                                goods_id: item.goods_id,
                                amount: Number((values.amount[item.goods_id] * 100).toFixed(2)),
                                number: item.number,
                                shop_name: item.shop_name,
                                shop_id: item.shop_id
                            }
                            data.activity_goods_rule.push(rule)
                        }

                    })
                }


                data = {
                    ...values,
                    ...data,
                }

                if (this.state.isEdit) {
                    this.getUpdateData(data)
                } else {
                    this.getCreateData(data)
                }
            }
        })
    }

    getUpdateData = (data) => {
        this.props.dispatch({
            type: 'platform_blueprint/update',
            payload: {
                data: { ...data, id: this.state.id }
            },
            callback: (data) => {
                this.setState({
                    show: 'success',
                    downloadItemID: data.id,
                    downloadItemName: data.name,
                })
            }
        })
    }

    // 创建
    getCreateData = (data) => {
        this.props.dispatch({
            type: 'platform_blueprint/create',
            payload: {
                data: data
            },
            callback: (data) => {
                this.setState({
                    show: 'success',
                    downloadItemID: data.id,
                    downloadItemName: data.name
                })
            }
        })
    }

    // 取消
    handleCreateCancel = () => {
        router.push(`/platform/blueprint`)
    }
    // 示例文案
    handleTextChange = () => {
        this.props.form.setFieldsValue({
            explain: `1.打开手机淘宝，发表15字以上五星好评并且截屏。\n2.填写购物订单号并提交对应的图片，即可参与活动。\n3.符合活动条件的订单号，将获得一定的现金奖励（直接发放到您的微信零钱）。\n4.提交成功后还需人工审核，1-3个工作日内将会发放相应奖励。\n5.若由于微信原因无法领取红包，请及时与我们联系。`,
        })
        this.setState({
            explain: `1.打开手机淘宝，发表15字以上五星好评并且截屏。\n2.填写购物订单号并提交对应的图片，即可参与活动。\n3.符合活动条件的订单号，将获得一定的现金奖励（直接发放到您的微信零钱）。\n4.提交成功后还需人工审核，1-3个工作日内将会发放相应奖励。\n5.若由于微信原因无法领取红包，请及时与我们联系。`
        })
    }
    //活动说明限制
    textAreaChange = (e) => {
        this.setState({
            explain: e.target.value,
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.isGetDataFinish !== prevState.isGetDataFinish) {
            const { activitiesDetailData } = nextProps.platform_blueprint
            if (activitiesDetailData) {
                const { activity_amount_rule, red_packet_type, guide_type, limit_type, guide_qrcode_url, explain, order_begin_at, order_end_at, audit_mode, shop_type, audit_condition } = activitiesDetailData
                let newState = {
                    drainage: guide_type !== 3,
                    guideTypeValue: guide_type === 2 ? 2 : 1,
                    isGetDataFinish: true,
                    isInitData: false,
                    limtValue: limit_type,
                    explain: explain,
                    audit_mode: audit_mode,
                    audit_condition: audit_condition,
                    shop_type: shop_type
                }

                if (order_begin_at) {
                    newState.startValue = moment(order_begin_at)
                }

                if (order_end_at) {
                    newState.endValue = moment(order_end_at)
                }

                if (activity_amount_rule && red_packet_type === 3) {
                    if (activity_amount_rule.format_rule.length) {
                        newState.ladderData = activity_amount_rule.format_rule.map(item => ({
                            min_amount: Number((item.min_amount / 100).toFixed(2)),
                            max_amount: Number((item.max_amount / 100).toFixed(2)),
                            amount: Number((item.amount / 100).toFixed(2))
                        }))
                    } else {
                        newState.ladderData = [""]
                    }
                }

                if (guide_type === GUIDE_TYPE.custom && guide_qrcode_url) {
                    newState.fileList = [{
                        uid: '-1',
                        name: 'xxx.png',
                        status: 'done',
                        url: getImageAbsoulteUrl(guide_qrcode_url),
                    }]
                    newState.guide_qrcode_img = guide_qrcode_url
                }
                return newState
            }

        }
        return null
    }

    formatterPoint = (value) => {
        const reg = /^(\-)*(\d+)\.(\d\d).*$/
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 200)) {
            return !isNaN(Number(value)) ? value.replace(reg, '$1$2.$3') : ''
        } else if (typeof value === 'number' && (Number(value) >= 1 && Number(value) <= 200)) {
            return !isNaN(value) ? String(value).replace(reg, '$1$2.$3') : ''
        } else {
            return ''
        }
    }

    // 输入1~9整数
    formatterInt = (value) => {
        const reg = /[^\d]/g
        let count = ''
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 9)) {
            count = !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 9)) {
            count = !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            count = ''
        }

        return count
    }

    // 输入限制天数
    formatterDay = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 9999)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 9999)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    // 输入限制次数
    formatterSecond = (value) => {
        const reg = /[^\d]/g
        if (typeof value === 'string' && (Number(value) >= 1 && Number(value) <= 10)) {
            return !isNaN(Number(value)) ? value.replace(reg, '') : ''
        } else if ((typeof value === 'number') && (value >= 1 && value <= 10)) {
            return !isNaN(value) ? String(value).replace(reg, '') : ''
        } else {
            return ''
        }
    }

    // 参与限制
    validateDayValue = (rule, value, callback) => {
        if (this.state.limtValue === 1 && !value) {
            callback('请填写参与限制！')
            return
        }
        callback()
    }

    validateSecondValue = (rule, value, callback) => {
        if (this.state.limtValue === 2 && !value) {
            callback('请填写参与限制！')
            return
        }
        callback()
    }

    handleLimitChange = (e) => {
        this.setState({
            limtValue: e.target.value,
        }, () => {
            this.props.form.validateFields(['limit_day_value', 'limit_second_value'], { force: true })
        })
    }

    // 活动引流-未输入判断
    validateQrcodeUrl = (rule, value, callback) => {
        if (this.state.guideTypeValue === 1 && !value) {
            callback('请选择新码！')
            return
        }
        callback()
    }

    validateQrcodeImg = (rule, value, callback) => {
        if (this.state.guideTypeValue === 2 && !this.state.guide_qrcode_img) {
            callback('请上传二维码！')
            return
        }
        callback()
    }

    validateGuideWords = (rule, value, callback) => {
        if (this.state.guideTypeValue === 2 && !value) {
            callback('请输入引流话术!')
            return
        }
        callback()
    }

    // 活动名称-限制12位
    validatename = (rule, value, callback) => {
        if (!value) {
            callback('请输入活动名称!')
            return
        } else if (value.length > 12) {
            callback('活动名称限12字以内')
            return
        }
        callback()
    }

    // 未添加店铺
    validateChooseBtn = (rule, value, callback) => {
        if (!this.state.goodsDetailData.length) {
            callback('请选择商品!')
            return
        }
        callback()
    }

    // 订单时间
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue
        if (!startValue || !endValue) {
            return false
        }
        return startValue.valueOf() > endValue.valueOf()
    }

    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue
        if (!endValue || !startValue) {
            return false
        }
        return endValue.valueOf() <= startValue.valueOf()
    }

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        })
    }

    onStartChange = (value) => {
        this.onChange('startValue', value)
    }

    onEndChange = (value) => {
        this.onChange('endValue', value)
    }

    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({ endOpen: true })
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({ endOpen: open })
    }

    // 店铺列表
    getshopsData = () => {
        this.props.dispatch({
            type: 'platform_blueprint/shops',
            payload: {
                limit: 9999,
            },
            callback: (data) => {
                this.getShop()

                this.setState({
                    isShopsDataLoading: true
                }, () => {
                    if (this.state.isEdit) {
                        setTimeout(() => {
                            const value = this.props.platform_blueprint.activitiesDetailData.shop_type
                            this.getShopType(value)
                        }, 100)
                    } else {
                        this.getShopType(this.state.shop_type)
                    }
                })
            }
        })
    }

    // 选择店铺类型
    handleShopTypeChange = (value) => {
        this.setState({
            shop_type: value,
            goodsDetailData: []
        }, () => {
            this.props.form.setFieldsValue({
                shop_ids: ['all']
            })

            this.getShopType(value)

            if (!this.isTaoBaoOrTianMaoShopType(value)) {
                this.setState({
                    audit_mode: AUDIT_MODE.manualAudit,
                    goods_rule: GOODS_RULE.allGoods
                })
            }
        })
    }

    getShop = () => {
        const data = this.props.platform_blueprint.shopsData

        const shopTypeValues = data.map(item => item.type === SHOP_TYPE_ENUM.TianMao.value ?  SHOP_TYPE_ENUM.TaoBaoTianMao.value : item.type)
        const displayShopTypes = SHOP_TYPE_BLUEPRINT.filter(item => shopTypeValues.some(v => v === item.value))

        if (displayShopTypes.length > 0) {
            this.setState({
                shopType: displayShopTypes,
                shop_type: displayShopTypes[0].value
            }, () => {
                this.getShopType(displayShopTypes[0].value)
            })
        }
    }


    isTaoBaoOrTianMaoShopType = (shopTypeValue) => {
        // return shopTypeValue === SHOP_TYPE_ENUM.TaoBao.value || shopTypeValue === SHOP_TYPE_ENUM.TianMao.value
        return shopTypeValue === SHOP_TYPE_ENUM.TaoBaoTianMao.value
    }


    getShopType = (value) => {
        const data = this.props.platform_blueprint.shopsData
        let shops = []
        if (data && data.length > 0) {
            // shops = data.filter(item => item.type === value).map(item => ({ id: item.id, name: item.name }))

            shops = data.filter(item => value === SHOP_TYPE_ENUM.TaoBaoTianMao.value ?
                item.type === SHOP_TYPE_ENUM.TaoBao.value || item.type === SHOP_TYPE_ENUM.TianMao.value :
                item.type === value).map(item => ({ id: item.id, name: item.name }))

        }

        this.setState({
            shopTypeData: shops
        })
    }

    onAuditModeChange = (e) => {
        if (e.target.value === AUDIT_MODE.automaticAudit) {
            Modal.info({
                title: '提示',
                content: (
                    <div>
                        为保证自动审核功能正常使用，请务必及时对买家评价进行回评！
                    </div>
                ),
            })
        }

        this.setState({
            audit_mode: e.target.value
        }, () => {
            if (e.target.value === AUDIT_MODE.automaticAudit && this.state.red_packet_value === 3) {
                this.props.form.resetFields(`red_packet_type`, [])
                this.setState({
                    red_packet_value: 1
                })
            }

            if (e.target.value === AUDIT_MODE.automaticAudit) {
                this.setState({
                    audit_condition: 1
                })
            }
        })
    }

    //审核条件
    onAuditConditionChange = (e) => {
        this.setState({
            audit_condition: e.target.value
        })
    }

    onRedPacketChange = (e) => {
        this.setState({
            red_packet_value: e.target.value
        })
    }

    //----晒图二期----
    // 参与商品
    onGoodsRuleChange = (e) => {
        this.setState({
            goods_rule: e.target.value,
            shop_ids: ['all']
        })
        this.props.form.setFieldsValue({
            shop_ids: ['all']
        })
    }

    // 添加商品
    chooseGoodsHandler = () => {
        this.setState({
            addGoodsVisible: true,
            goodsKeyRandom: Math.random()
        })
    }

    hideaddGoodsModal = () => {
        this.setState({
            addGoodsVisible: false
        })
    }

    //返现金额
    priceValueChange = (good, e) => {

        let value = e.target.value
        // let index = parseInt(e.target.getAttribute("data-index"))
        let detailData = this.state.goodsDetailData

        detailData.forEach((item, i) => {
            if (item.goods_id === good.goods_id) {
                item.amount = value
            }
        })
        this.setState({
            goodsDetailData: [...detailData]
        })
    }

    handleOk = (detailData) => {
        this.setState({
            addGoodsVisible: false,
            goodsDetailData: detailData
        }, () => {
            this.props.form.validateFields(['chooseGood'], { force: true })
        })
    }

    validateCommissionValue = (rule, value, callback) => {
        if (!value) {
            callback('请输入返现金额!')
            return
        }
        callback()
    }

    onPriceValueChange = (value) => {
        this.setState({
            priceValue: value || ''
        })
    }

    // 删除添加商品
    deletConfirm = (record, index, e) => {
        e.stopPropagation()
        e.preventDefault()

        let del_id = []
        const { goodsDetailData, activity_goods_rule_del_ids } = this.state
        goodsDetailData.forEach((item, index) => {
            if (item.goods_id === record.goods_id) {
                del_id = goodsDetailData.splice(index, 1)
            }
        })
        activity_goods_rule_del_ids.push(del_id[0].id)

        this.setState({
            activity_goods_rule_del_ids: activity_goods_rule_del_ids
        }, () => {
            this.props.form.validateFields(['chooseGood'], { force: true })
        })
    }

    render() {
        const { shopsData, qrcodesData } = this.props.platform_blueprint
        const { startValue, endValue, endOpen } = this.state
        const FormItem = Form.Item
        const Option = Select.Option
        const RadioGroup = Radio.Group
        const { TextArea } = Input
        const { getFieldDecorator, getFieldValue } = this.props.form
        const formItemLayout = {
            labelCol: {
                span: 6,
                style: { width: '80px' }
            },
            wrapperCol: {
                // span: 15
            }
        }

        // 活动时间
        const { RangePicker } = DatePicker

        // 活动引流
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        }
        const radioLimitStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '39px',
        }

        //上传二维码
        const { previewVisible, previewImage, fileList } = this.state
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">上传二维码</div>
            </div>
        )

        const uploadProps = {
            name: 'file',
            action: '//upload.qiniup.com/',
            accept: 'image/*',
            headers: {},
            data: {
                token: this.props.platform_blueprint.token
            },
            onChange: this.handleChange,
        }

        // 商品列表
        const columns = [{
            title: '商品',
            dataIndex: 'goods',
            width: 280,
            render: (text, record) => {
                return <div style={{ display: 'flex' }}>
                    <div>
                        {
                            record.pic_url ? <img src={record.pic_url} width="64" height="64" alt="宝贝图片" /> : <div style={{ width: 64, height: 64, lineHeight: '64px' }}>暂无图片</div>
                        }
                    </div>
                    <div className='hz-margin-small-left' style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div className={styles.textEllipsis}>{record.name}</div>
                        <div style={{ fontSize: 14, color: '#556675', fontWeight: 'bold' }}>￥{jine(record.price, '0,0.00', 'Fen')}</div>
                    </div>
                </div>
            }
        }, {
            title: '状态',
            width: 80,
            dataIndex: 'status',
            render: (text, record) => {
                switch (text) {
                    case 1:
                        return <Badge status="processing" text='在售'></Badge>
                    case 2:
                        return <Badge status="default" text='下架'></Badge>
                    default:
                        return
                }
            }
        },
        {
            title: '所属店铺',
            width: 120,
            dataIndex: 'shop_name',
            render: (text, record) => {
                return <div>{text && text.length > 6 ?
                    <Popover placement="top" content={text}>
                        <div className={styles.ellipsis}>{text}</div>
                    </Popover>
                    : <div>{text}</div>
                }</div>
            }
        },
        {
            title: '返现金额（元）',
            width: 180,
            dataIndex: 'goodsAmount',
            render: (text, record, index) => {
                return <Form.Item style={{ marginBottom: '0' }}>
                    {getFieldDecorator(`amount[${record.goods_id}]`, {
                        rules: [{ validator: this.validateCommissionValue }],
                        initialValue: record.amount,
                    })(
                        <InputNumber
                            min={1} max={200}
                            formatter={this.formatterPoint}
                            parser={this.formatterPoint}
                            placeholder="输入金额1~200.00"
                            style={{ width: '100%' }}
                            onBlur={(e) => this.priceValueChange(record, e)}
                            data-index={index}
                        // onChange={this.onPriceValueChange}
                        />
                    )}
                </Form.Item>
            }
        }, {
            title: '操作',
            key: 'actions',
            render: (text, record, index) => (
                <a href="#" onClick={(e) => this.deletConfirm(record, index, e)}>删除</a>
            )
        }]

        return (
            <div>
                <Row>
                    {
                        this.state.show === 'create' &&
                        <Col span={15} style={{ width: '780px' }}>
                            <Form>
                                <FormItem {...formItemLayout} label="活动名称" wrapperCol={{ span: 12 }}>
                                    {getFieldDecorator('name', {
                                        rules: [
                                            { required: true, validator: this.validatename }]
                                    })(
                                        <HzInput
                                            placeholder="12字以内"
                                            maxLength={12}
                                        />
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label="活动时间" wrapperCol={{ span: 12 }}>
                                    {getFieldDecorator('activity_time', {
                                        rules: [{
                                            required: true, message: '请选择活动时间!',
                                        }],
                                    })(
                                        <RangePicker
                                            // showTime={{ format: 'HH:mm' }}
                                            showTime={{
                                                hideDisabledOptions: true,
                                                defaultValue: [moment('00:00', 'HH:mm'), moment('00:00', 'HH:mm')],
                                            }}
                                            format="YYYY-MM-DD HH:mm"
                                            placeholder={['开始时间', '结束时间']}
                                        />
                                    )}
                                </FormItem>
                                {
                                    this.state.isShopsDataLoading && shopsData && shopsData.length === 0 ?
                                        <FormItem key="emptyshops" {...formItemLayout} label="选择店铺" wrapperCol={{ span: 12 }}
                                            help="您当前没有店铺，请先创建店铺！"
                                            validateStatus="error"
                                            required={true}
                                        >
                                            {getFieldDecorator('shop_emptyids', {
                                                rules: [{ required: true, message: '您当前没有店铺，请先创建店铺！' }],
                                            })(
                                                <Select
                                                    placeholder="您当前没有店铺，请先创建店铺！"
                                                    mode="multiple"
                                                    style={{ width: '100%' }}
                                                >
                                                </Select>
                                            )}
                                        </FormItem>
                                        : <FormItem key="defaultshops" {...formItemLayout} label={<span><span className="hz-text-require">*</span> 选择店铺</span>} wrapperCol={{ span: 12 }} >
                                            <Row gutter={12}>
                                                <Col span={8}>
                                                    <FormItem style={{ marginBottom: '0' }}>
                                                        {getFieldDecorator('shop_type', {
                                                            rules: [{ required: true }],
                                                            initialValue: this.state.shop_type
                                                        })(
                                                            <Select
                                                                placeholder="店铺类型"
                                                                onChange={this.handleShopTypeChange}
                                                            >
                                                                {this.state.shopType && this.state.shopType.map((item) => {
                                                                    return <Option key={item.value} value={item.value}>{item.text}</Option>
                                                                })}
                                                            </Select>
                                                        )}
                                                    </FormItem>
                                                </Col>
                                                <Col span={16}>
                                                    <FormItem style={{ marginBottom: '0' }}>
                                                        {getFieldDecorator('shop_ids', {
                                                            rules: [
                                                                { required: true, message: '请选择店铺!' },

                                                            ],
                                                            initialValue: ['all']
                                                        })(
                                                            <Select
                                                                onChange={this.handleShopsChange}
                                                                mode="multiple"
                                                                disabled={this.state.goods_rule === GOODS_RULE.appointGoods}
                                                            >
                                                                <Option value="all">全部店铺</Option>
                                                                {this.state.shopTypeData.map((item) => {
                                                                    return <Option key={item.id} value={item.id}>{item.name}</Option>
                                                                })}
                                                            </Select>
                                                        )}
                                                    </FormItem>
                                                </Col>
                                            </Row>
                                        </FormItem>
                                }
                                <FormItem {...formItemLayout} label="上传截图" wrapperCol={{ span: 12 }}>
                                    {getFieldDecorator('image_count', {
                                        rules: [{ required: true, message: '请上传截图!' }],
                                    })(
                                        <InputNumber min={1} max={9} formatter={this.formatterInt} placeholder="1~9" onChange={this.handleImageChange} />
                                    )}
                                    <span style={{ marginLeft: "12px" }}>张</span>
                                    <span style={{ marginLeft: "16px" }} className={styles.textColorSecondary}>上传指定张数的截图方可提交成功</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label="订单时间" wrapperCol={{ span: 15 }}>
                                    <div>
                                        <DatePicker
                                            disabledDate={this.disabledStartDate}
                                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                                            format="YYYY-MM-DD HH:mm:ss"
                                            value={startValue}
                                            placeholder="开始时间"
                                            onChange={this.onStartChange}
                                            onOpenChange={this.handleStartOpenChange}
                                        />
                                        <span className="hz-margin-small-left-right">~</span>
                                        <DatePicker
                                            disabledDate={this.disabledEndDate}
                                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                                            format="YYYY-MM-DD HH:mm:ss"
                                            value={endValue}
                                            placeholder="结束时间"
                                            onChange={this.onEndChange}
                                            open={endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                        />
                                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>订单时间即买家下单后的创建时间<br></br>温馨提示：<br />淘宝、天猫平台的预售活动产生的订单，<br />其创建时间和支付时间相距较长，<br />商家设置订单时间时需考虑是否允许此类买家参与</div>}>
                                            <Icon className={styles.questionCircle} type="question-circle" />
                                        </Popover>
                                    </div>
                                </FormItem>
                                <FormItem {...formItemLayout} label="参与商品">
                                    <RadioGroup onChange={this.onGoodsRuleChange} value={this.state.goods_rule}>
                                        <Radio value={1}>所有商品</Radio>
                                        {this.isTaoBaoOrTianMaoShopType(this.state.shop_type) ? <Radio value={2}>指定商品</Radio> : <Radio value={2} disabled>指定商品</Radio>}
                                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>当前仅支持天猫和淘宝类型的已授权店铺选择指定商品参与活动</div>}>
                                            <Icon className={styles.questionCircle} type="question-circle" />
                                        </Popover>
                                    </RadioGroup>
                                </FormItem>
                                {
                                    this.isTaoBaoOrTianMaoShopType(this.state.shop_type) && this.state.goods_rule === GOODS_RULE.appointGoods ? <div>
                                        <FormItem {...formItemLayout}
                                            style={{ display: 'flex' }}
                                            label="添加商品">
                                            {getFieldDecorator('chooseGood', {
                                                rules: [
                                                    { required: true, validator: this.validateChooseBtn }]
                                            })(
                                                <Button type="primary" ghost onClick={() => this.chooseGoodsHandler()}>
                                                    <Icon type="plus" /> 选择商品 </Button>
                                            )}
                                            <span className='hz-margin-small-left'>最多可以选择 <span style={{ color: '#4391FF' }}>5</span> 个商品</span>
                                        </FormItem>
                                        {
                                            this.state.goodsDetailData && this.state.goodsDetailData.length ?
                                                <Table
                                                    columns={columns}
                                                    dataSource={this.state.goodsDetailData}
                                                    pagination={false}
                                                    rowKey="goods_id"
                                                /> : ''
                                        }
                                    </div>
                                        : ''
                                }
                                {
                                    this.state.goods_rule === GOODS_RULE.allGoods &&
                                    <FormItem {...formItemLayout} label="红包类型">
                                        {getFieldDecorator('red_packet_type', {
                                            rules: [{
                                                required: true
                                            }],
                                            initialValue: this.state.red_packet_value
                                        })(
                                            <RadioGroup onChange={this.onRedPacketChange}>
                                                <Radio value={1}>固定金额红包</Radio>
                                                <Radio value={2}>随机金额红包</Radio>
                                                {this.state.audit_mode === AUDIT_MODE.manualAudit ? <Radio value={3}>阶梯金额红包</Radio> : ''}
                                            </RadioGroup>
                                        )}
                                    </FormItem>
                                }
                                {
                                    this.state.goods_rule === GOODS_RULE.allGoods &&
                                    <FormItem {...formItemLayout} label="红包金额" wrapperCol={{ span: 21 }}>
                                        {
                                            getFieldValue('red_packet_type') === 1 && (
                                                <div>
                                                    {getFieldDecorator('fix_amount', {
                                                        rules: [{ required: true, message: '请输入红包金额!' }],
                                                    })(
                                                        <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" className={styles.inputNumberWidth} />
                                                    )}
                                                </div>
                                            )
                                        }
                                        {
                                            getFieldValue('red_packet_type') === 2 && (
                                                <div style={{ display: 'flex' }}>
                                                    <FormItem style={{ marginBottom: '0' }}>
                                                        {getFieldDecorator('rule_min_random', {
                                                            rules: [{ required: true, message: '请输入红包金额!' }],
                                                        })(
                                                            <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" className={styles.inputNumberWidth} />
                                                        )}
                                                    </FormItem>
                                                    <span className='hz-margin-small-left-right' style={{ marginBottom: '0' }}>~</span>
                                                    <FormItem style={{ marginBottom: '0' }}>
                                                        {getFieldDecorator('rule_max_random', {
                                                            rules: [{ required: true, message: '请输入红包金额!' }],
                                                        })(
                                                            <InputNumber min={0} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" className={styles.inputNumberWidth} />
                                                        )}
                                                    </FormItem>
                                                </div>
                                            )
                                        }
                                        {this.state.audit_mode === AUDIT_MODE.manualAudit ?
                                            getFieldValue('red_packet_type') === 3 && (
                                                <div>
                                                    {
                                                        this.state.ladderData && this.state.ladderData.map((item, i) => {
                                                            return (
                                                                <div key={i} style={{ display: 'flex' }}>
                                                                    <span className='hz-margin-small-right'>实付在</span>
                                                                    <FormItem style={{ marginBottom: '0' }}>
                                                                        {getFieldDecorator(`rule_min_amount[${i}]`, {
                                                                            initialValue: item.min_amount,
                                                                            rules: [{ required: true, message: '请输入订单金额!' }],
                                                                        })(
                                                                            <InputNumber min={0.01} placeholder="输入订单金额" className={styles.inputNumberWidth} />
                                                                        )}
                                                                    </FormItem>
                                                                    <span className='hz-margin-small-left-right'>~</span>
                                                                    <FormItem style={{ marginBottom: '0' }}>
                                                                        {getFieldDecorator(`rule_max_amount[${i}]`, {
                                                                            initialValue: item.max_amount,
                                                                            rules: [{ required: true, message: '请输入订单金额!' }],
                                                                        })(
                                                                            <InputNumber min={0.01} placeholder="输入订单金额" className={styles.inputNumberWidth} />
                                                                        )}
                                                                    </FormItem>
                                                                    <span className='hz-margin-small-left-right'>元的订单返现</span>
                                                                    <FormItem style={{ marginBottom: '0' }}>
                                                                        {getFieldDecorator(`count_amount[${i}]`, {
                                                                            initialValue: item.amount,
                                                                            rules: [{ required: true, message: '请输入红包金额!' }],
                                                                        })(
                                                                            <InputNumber min={0.03} max={200} formatter={this.formatterPoint} parser={this.formatterPoint} placeholder="输入金额1~200.00" className={styles.inputNumberWidth} />
                                                                        )}
                                                                    </FormItem>
                                                                    <span className='hz-margin-small-left'>元</span>
                                                                    {
                                                                        i < 1 ? '' : <span ><Icon type="delete" className='hz-margin-small-left' style={{ color: "#F02417" }} onClick={() => this.delLadderData(i)} /></span>
                                                                    }
                                                                </div>
                                                            )
                                                        })

                                                    }
                                                    <div>
                                                        <Button onClick={(e) => { this.addLadderData() }}>
                                                            <Icon type="plus" /> 添加阶梯
                                                        </Button>
                                                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>可最多指定5个订单金额区间设置红包金额。<br></br>金额设置规则，大于设置的金额最小值，小<br />于等于设置金额的最大值。</div>}>
                                                            <Icon className={styles.questionCircle} type="question-circle" />
                                                        </Popover>

                                                    </div>
                                                </div>
                                            ) : ''
                                        }
                                    </FormItem>
                                }

                                <FormItem {...formItemLayout} label="审核方式">
                                    <RadioGroup onChange={this.onAuditModeChange} value={this.state.audit_mode}>
                                        <Radio value={1}>手动审核</Radio>
                                        {this.isTaoBaoOrTianMaoShopType(this.state.shop_type) ? <Radio value={2}>自动审核</Radio> : <Radio value={2} disabled>自动审核</Radio>}
                                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>除淘宝、天猫外的其他类型店铺无法获取评价信息，<br></br>因此不可使用自动审核功能。为保证自动审核功能<br />正常使用，请务必及时对买家评价进行回评！</div>}>
                                            <Icon className={styles.questionCircle} type="question-circle" />
                                        </Popover>
                                    </RadioGroup>
                                </FormItem>
                                {this.state.audit_mode === 2 ?
                                    <FormItem {...formItemLayout} label="审核条件">
                                        <RadioGroup onChange={this.onAuditConditionChange} value={this.state.audit_condition}>
                                            <Radio value={1}>双方互评且好评</Radio>
                                            <Radio value={2}>买家评价即返现</Radio>
                                            <Radio value={3}>订单完成即返现</Radio>
                                        </RadioGroup>
                                        <Popover className="hz-margin-small-left" placement="bottomLeft" content={<div>双方互评且好评：需卖家回评，且买家订单所有商品全部好评<br></br>买家评价即返现：需买家对所有商品评价，但不要求全部好评<br />订单完成即返现：需买家收货，但不校验订单是否存在退货退款</div>}>
                                            <Icon className={styles.questionCircle} type="question-circle" />
                                        </Popover>
                                    </FormItem> : ''
                                }
                                <FormItem {...formItemLayout} label="参与限制" wrapperCol={{ span: 15 }}>
                                    <RadioGroup onChange={this.handleLimitChange} defaultValue={this.state.limtValue} value={this.state.limtValue}>
                                        <Radio style={radioLimitStyle} value={3}>无限制</Radio>
                                        <Radio style={radioLimitStyle} value={1} className={classnames("hz-margin-small-bottom", styles.radiolineformitem)}>
                                            <span className={styles.radiolineformitemcontain}>
                                                <span>同一微信用户</span>
                                                <span className={styles.radiolineformitemformitem}>
                                                    <FormItem>
                                                        {getFieldDecorator('limit_day_value', {
                                                            rules: [{ validator: this.validateDayValue }],
                                                        })(
                                                            <InputNumber formatter={this.formatterDay} parser={this.formatterDay} placeholder="1-9999" className='hz-margin-small-left-right' min={0} max={9999} />
                                                        )}
                                                    </FormItem>
                                                </span>
                                                <span>天内可参与一次</span>
                                            </span>
                                        </Radio>
                                        <Radio style={radioLimitStyle} value={2} className={classnames("hz-margin-base-bottom", styles.radiolineformitem)}>
                                            <span className={styles.radiolineformitemcontain}>
                                                <span>同一微信用户活动期间可参与</span>
                                                <span >
                                                    <FormItem>
                                                        {getFieldDecorator('limit_second_value', {
                                                            rules: [{ validator: this.validateSecondValue }],
                                                        })(
                                                            <InputNumber formatter={this.formatterSecond} parser={this.formatterSecond} placeholder="1-10" className='hz-margin-small-left-right' min={0} max={10} />
                                                        )}
                                                    </FormItem>
                                                </span>
                                                <span>次</span>
                                            </span>
                                        </Radio>
                                    </RadioGroup>
                                </FormItem>
                                <FormItem {...formItemLayout} label="活动说明" wrapperCol={{ span: 12 }} style={{ marginBottom: 0 }}>
                                    {getFieldDecorator('explain', {
                                        rules: [{ required: true, message: '请输入活动说明!' }],
                                    })(
                                        // height: '130px', 'overflowY': 'auto', 'resize': 'none'
                                        <TextAreaCount
                                            placeholder="请输入或粘贴客户需要了解的活动规则，文字可换行，您可以在右侧预览活动规则的大致展示效果。"
                                            style={{ width: 390 }}
                                            rows={5}
                                            limitSize={300}
                                            onChange={this.textAreaChange} />
                                    )}
                                </FormItem>
                                <FormItem >
                                    <a href="javascript:;" style={{ float: "left", marginLeft: 80 }} onClick={this.handleTextChange}>示例文字</a>
                                </FormItem>
                                <FormItem {...formItemLayout} label="活动过滤">
                                    {getFieldDecorator('is_parallel', {
                                        valuePropName: 'checked',
                                        rules: [{ required: false }],
                                    })(
                                        <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                                    )}
                                    <span className={`${styles.textColorSecondary} hz-margin-small-left`}>参与过其他促销活动的手机号码或订单不可以参与本次活动</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label="活动引流" >
                                    <div>
                                        {getFieldDecorator('guide_type', {
                                            valuePropName: 'checked',
                                            rules: [{ required: false }],
                                        })(
                                            <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={this.handleSwitchChange} />
                                        )}
                                        <span className={`${styles.textColorSecondary} hz-margin-small-left`}>开启后提交申请成功会引导客户参与引流活动</span>
                                        <div style={{ width: '340px' }}>
                                            {this.state.drainage &&
                                                <RadioGroup onChange={this.handleSynChange} className={styles.activeDrainage} defaultValue={this.state.guideTypeValue}>
                                                    <Row>
                                                        <Col span={7}>
                                                            <Radio value={1} className={styles.synRadio}>同步新码</Radio>
                                                        </Col>
                                                        <Col span={13}>
                                                            <FormItem>
                                                                {getFieldDecorator('guide_qrcode_url', {
                                                                    rules: [{ validator: this.validateQrcodeUrl }],
                                                                })(
                                                                    <Select
                                                                        placeholder="选择新码"
                                                                        onChange={this.handleCodeChange}
                                                                    >
                                                                        {qrcodesData.map((item) => {
                                                                            return <Option key={item.id} value={item.id}>{item.name}</Option>
                                                                        })}
                                                                    </Select>
                                                                )}
                                                            </FormItem>
                                                        </Col>
                                                    </Row>
                                                    <div>
                                                        <Radio style={radioStyle} value={2} className={styles.guideQrcodeWidth}>自定义</Radio>
                                                        <Row hidden={this.state.guideTypeValue !== 2}>
                                                            <Col span={9}>
                                                                <div className="clearfix">
                                                                    <FormItem>
                                                                        {getFieldDecorator('guide_qrcode_img', {
                                                                            rules: [{ validator: this.validateQrcodeImg }],
                                                                        })(
                                                                            <Upload
                                                                                listType="picture-card"
                                                                                fileList={fileList}
                                                                                {...uploadProps}
                                                                                onPreview={this.handlePreview}
                                                                                onRemove={this.handlePictureCardRemoveHandler}
                                                                            >
                                                                                {fileList.length >= 1 ? null : uploadButton}
                                                                            </Upload>
                                                                        )}
                                                                        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                                                                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                                                        </Modal>
                                                                    </FormItem>
                                                                </div>
                                                            </Col>
                                                            <Col span={15}>
                                                                <FormItem>
                                                                    {getFieldDecorator('guide_words', {
                                                                        rules: [{ validator: this.validateGuideWords }],
                                                                    })(
                                                                        <TextAreaCount
                                                                            placeholder="输入引流话术，不超过25个字（可在右侧预览效果）"
                                                                            limitSize={25}
                                                                            style={{ height: 100, width: 240, 'overflowY': 'auto' }}
                                                                        />
                                                                    )}
                                                                </FormItem>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </RadioGroup>
                                            }
                                        </div>
                                    </div>

                                </FormItem>
                                <div className='hz-margin-base-bottom'>
                                    <Button type="primary" htmlType="submit" onClick={() => this.handleSubmit()} >保存</Button>
                                    <Button style={{ marginLeft: 16 }} onClick={() => this.handleCreateCancel()}>取消</Button>
                                </div>
                            </Form>
                        </Col>}
                    {
                        this.state.show === 'success' &&
                        <Col span={15}>
                            <Success downloadItemID={this.state.downloadItemID}
                                downloadItemName={this.state.downloadItemName}></Success>
                        </Col>
                    }
                    <Col span={6}>
                        <div className={styles.phoneWrap}>
                            <div className={styles.phoneContent}>
                                <img src={require('../../../assets/images/buleprintBanner.png')} alt="" className={styles.phoneBanner} />
                                <div className={styles.phoneOrderInput}>
                                    <label htmlFor="" className={styles.phoneOrder}>订单号</label>
                                    <input type="text" className={styles.phoneInPut} placeholder="请粘贴或输入您的订单号" />
                                </div>
                                <div className={styles.phoneUpload}>
                                    <div>
                                        <div style={{ color: '#FFAA15', marginBottom: '12px' }}>需上传 {this.state.image_count} 张图片</div>
                                        <div className={styles.uploadBg} >
                                            <img src={require('../../../assets/images/buleprintUpload.png')} alt="" />
                                        </div>
                                        <button>提交</button>
                                        <div style={{ overflow: 'hidden', color: '#F75D5F', marginTop: 8 }}>
                                            <span style={{ float: 'left' }}>活动历史>></span>
                                            <span style={{ float: 'right' }}>活动规则>></span>
                                        </div>
                                    </div>
                                </div>
                                {/* MODAL */}
                                {this.state.guideTypeValue === 1 && this.state.qrCodeId ?
                                    <div className={styles.qrcodeMoal}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 'bold' }}>提交成功</div>
                                            <div style={{ fontSize: 12, paddingTop: '10px' }}>扫码加微信,好礼享不停！</div>
                                            <div className={styles.qrImg}>
                                                <img src={this.state.Img} alt="" />
                                            </div>
                                            <button className={styles.qrColse} >我知道了</button>
                                        </div>
                                    </div> : ""
                                }
                                {this.state.guideTypeValue === 2 && this.state.guide_qrcode_img ?
                                    <div className={styles.qrcodeMoal}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 'bold' }}>提交成功</div>
                                            <div style={{ fontSize: 12 }}>{this.props.form.getFieldValue('guide_words')}</div>
                                            <div className={styles.qrImg}>
                                                <img src={getImageAbsoulteUrl(this.state.guide_qrcode_img)} alt="" />
                                            </div>
                                            <button className={styles.qrColse} >我知道了</button>
                                        </div>
                                    </div> : ""
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
                <AddGoods
                    visible={this.state.addGoodsVisible}
                    onClose={this.hideaddGoodsModal}
                    onOk={this.handleOk}
                    shop_type={this.state.shop_type}
                    key={this.state.goodsKeyRandom}
                    goodsDetailData={this.state.goodsDetailData}
                ></AddGoods>
            </div >
        )
    }
}


