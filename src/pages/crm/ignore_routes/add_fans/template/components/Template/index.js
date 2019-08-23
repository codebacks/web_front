
/** @description 加粉模板创建与编辑
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import {Col, Form, Input, Button, Icon, Radio, InputNumber,TimePicker, Tag , Modal, message, Spin,} from 'antd'
import {connect} from 'dva'
import router from 'umi/router'
import moment from 'moment'
import numeral from 'numeral'
import _ from 'lodash'
import DateRange from 'components/DateRange'
import PlatformSelect from '../../../components/PlatformSelect'
import ShopSelect from '../../../components/ShopSelect'
import config from 'crm/common/config'
import utils from '../../../utils'
import environmentConfig from 'crm/config'
import styles from './index.scss'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const { TextArea } = Input
const RadioButton = Radio.Button
const confirm = Modal.confirm

const {DateFormat} = config

const titleMaxLen = 20
const remarkMaxLen = 100
const verifyMaxLen = 50
const tagMaxLen = 18
const verifyVariablePlaceholder = {
    name: '<姓名>',
    shoppingAccount: '<购物账号>',
    shopName: '<店铺名称>',
}
const remarkVariablePlaceholder = {
    name: '<姓名>',
    shoppingAccount: '<购物账号>',
    mobile: '<手机号>',
}
const multipleMaxNumber = 10
const addFansMaxNum = 10
const timeFormat = 'HH:mm'

@connect(({ base, loading, crm_add_fans_template}) => ({
    base,
    crm_add_fans_template,
    createLoading: loading.effects['crm_add_fans_template/create'],
    updateLoading: loading.effects['crm_add_fans_template/update'],
    detailLoading: loading.effects['crm_add_fans_template/detail'],
}))

export default class Template extends Component {
    constructor(props) {
        super(props)
        this.state = {
            submit: false,
            body: {
                remarkOption: 1,
                remarkText: '',
                order_amount: '',
                average_amount: '',
                order_count: '',
                message_count: '',
                update_date_days: -1,
                is_filter_friend: 1,
                friendRemark: '',
                tags: [],
                verifyMessages: [''],
                periods: [{}]
            },
            error: {
                verifyMessages: [''],
                periods: [{}],
            },
            tagInputValue: ''
        }
    }

    componentDidMount() {
        this._isMounted = true
        const {id} = this.props.location.query
        if(id) {
            this.getTemplateDetail(id)
        }
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getTemplateDetail = (id) => {
        this.props.dispatch({
            type: 'crm_add_fans_template/detail',
            payload: {
                id: id
            },
            callback: (data) => {
                if(this._isMounted) {
                    this.initBody(data)
                    this.initError(data)
                }
            }
        })
    }

    initBody = (data) => {
        let body = _.cloneDeep(this.state.body)

        body.title = data.title
        // query_params
        const queryParams = data.query_params
        if(queryParams.platform_type) {
            body.platform_type = utils.platformToShop(queryParams.platform_type)
        } else {
            if (queryParams.data_from === 1) {
                body.platform_type = 999
            }
        }
        body.shop_id = queryParams.shop_id
        let remarkText = ''
        if (queryParams.hasOwnProperty('remark_include')) {
            remarkText = queryParams.remark_include
            body.remarkOption = 1
        } else {
            remarkText = queryParams.remark_not_include
            body.remarkOption = 0
        }
        body.remarkText = remarkText
        body.order_amount = this.joinQueryParams(queryParams, 'order_amount')
        body.average_amount = this.joinQueryParams(queryParams, 'average_amount')
        body.order_count = this.joinQueryParams(queryParams, 'order_count')
        body.message_count = this.joinQueryParams(queryParams, 'message_count')
        body.update_date_begin = queryParams.update_date_begin
        body.update_date_end = queryParams.update_date_end
        if (typeof queryParams.update_date_days === 'undefined') {
            if (body.update_date_begin || body.update_date_end) {
                body.update_date_days = 0
            } else {
                body.update_date_days = -1
            }
        } else {
            body.update_date_days = queryParams.update_date_days
        }
        body.is_filter_friend = data.is_filter_friend ? 1 : 0
        // verify_params
        const verifyParams = data.verify_params
        body.verifyMessages = verifyParams.verify_infos
        body.friendRemark = verifyParams.friend_remark
        // body.tags = verifyParams.friend_tag
        // periods
        body.periods = this.convertPeriods(data.periods)
        // console.log(body)
        this.setState({
            body: body
        })
    }

    initError = (data) => {
        const {verify_params: {verify_infos}, periods} = data
        let error = _.cloneDeep(this.state.error)
        if (verify_infos.length > 1) {
            error.verifyMessages = verify_infos.map(() => {
                return ''
            })
        }
        if (periods.length > 1) {
            error.periods = periods.map(() => {
                return {}
            })
        }
        this.setState({
            error: error
        })
    }

    joinQueryParams = (queryParams, key) => {
        let value = ''
        let startValue = queryParams[`${key}_begin`]
        let endValue = queryParams[`${key}_end`]
        if (startValue || endValue) {
            if(key.indexOf('amount') !== -1) {
                if(startValue) {
                    startValue = startValue / 100
                }
                if(endValue) {
                    endValue = endValue / 100
                }
            }
            value = `${startValue || ''},${endValue || ''}`
        }
        return value
    }

    convertPeriods = (periods) => {
        return periods.map((v) => {
            return {
                time: this.convertSeconds(v.seconds),
                num: v.limit_num,
            }
        })
    }

    convertSeconds = (seconds) => {
        const hourSeconds = 3600
        const round = Math.trunc(seconds / hourSeconds)
        const rest = seconds % hourSeconds
        let hour = round < 10 ? `0${round}` : round
        let minute = rest / 60
        if (minute) {
            minute = minute < 10 ? `0${minute}` : minute
        } else {
            minute = '00'
        }
        return `${hour}:${minute}`
    }

    handleSave = () => {
        let submit = this.state.submit
        if (!submit) {
            this.setState({
                submit: true
            })
        }
        if (this.checkSave()) {
            const {body} = this.state
            const {id} = this.props.location.query
            const payload = {
                id: id,
                body: this.getBody(body)
            }
            // console.log(payload)
            if (id) {
                this.updateTemplate(payload)
            } else {
                this.createTemplate(payload)
            }
        }
    }

    createTemplate = (payload) => {
        this.props.dispatch({
            type: 'crm_add_fans_template/create',
            payload: payload,
            callback: () => {
                message.success('新建成功')
                this.referer()
            }
        })
    }

    updateTemplate = (payload) => {
        this.props.dispatch({
            type: 'crm_add_fans_template/update',
            payload: payload,
            callback: () => {
                message.success('编辑成功')
                this.referer()
            }
        })
    }

    referer = () => {
        router.push('/crm/add_fans?type=3')
    }

    checkSave = () => {
        const {body} = this.state

        let error = _.cloneDeep(this.state.error)
        error = this.validateRequired(body, error)
        this.setState({
            error: error
        })
        if (this.check(error)) {
            const PeriodTotalNumError = this.validatePeriodTotalNum(body)
            error.periodTotalNum = PeriodTotalNumError
            this.setState({
                error: error
            })
            return !PeriodTotalNumError
        }
        return false
    }

    check = (error) => {
        let isCorrect = true
        const errorKeys = Object.keys(error)
        if (errorKeys.length) {
            for (let i = 0; i < errorKeys.length; i++) {
                let key = errorKeys[i]
                if (key === 'periodTotalNum') {
                    continue
                }
                let item = error[key]
                if (item && !(item instanceof Array) && !(item instanceof Object) ) {
                    isCorrect = false
                    break
                } else {
                    if(item instanceof Array) {
                        for (let j = 0; j < item.length; j++) {
                            let subItem = item[j]
                            let subKeys =  Object.keys(subItem)
                            for (let k = 0; k < subKeys.length; k++) {
                                let subKey = subKeys[k]
                                if (subItem[subKey]) {
                                    isCorrect = false
                                    break
                                }
                            }

                        }
                    }
                }
            }
        }
        return isCorrect
    }

    validateRequired = (body, error) => {
        // title
        error = this.validateTitle('title', body.title, error)
        // query_params
        error = this.validateUpdateDate('update_date_days', body, error)
        // verify
        const verifyVariables = this.getVariables(verifyVariablePlaceholder)
        let verifyMessagesError = _.cloneDeep(error.verifyMessages)
        for (let i = 0; i < body.verifyMessages.length; i++) {
            let value = body.verifyMessages[i]
            verifyMessagesError = this.validateVerifyMessage(value, verifyMaxLen, verifyVariables, i, verifyMessagesError)
        }
        error.verifyMessages = verifyMessagesError
        // period
        let periodsError = _.cloneDeep(error.periods)
        for (let i = 0; i < body.periods.length; i++) {
            let period = body.periods[i]
            periodsError = this.validatePeriodTime(period.time, i, periodsError)
            periodsError = this.validatePeriodNum(period.num, i, periodsError)
        }
        error.periods = periodsError
        return error
    }

    validatePeriodTotalNum = (body) => {
        const periods = body.periods
        const totalNum = periods.reduce((total, currentValue) => {
            return total + currentValue.num
        }, 0)
        if (totalNum > addFansMaxNum) {
            return `一天加粉数量不超过${addFansMaxNum}个`
        }
        return ''
    }

    getBody = (values) => {
        let body = {}
        // 标题
        body.title = values.title
        // query_params
        let queryParams = {}
        queryParams.platform_type = utils.shopToPlatform(values.platform_type)
        if (values.platform_type === 999) {
            queryParams.data_from = 1
        }
        queryParams.shop_id = values.shop_id
        let remarkText = values.remarkText
        if (values.remarkOption) {
            queryParams.remark_include = remarkText
        } else {
            queryParams.remark_not_include = remarkText
        }
        queryParams = this.parseSplitParams(values, queryParams, 'order_amount')
        queryParams = this.parseSplitParams(values, queryParams, 'average_amount')
        queryParams = this.parseSplitParams(values, queryParams, 'order_count')
        queryParams = this.parseSplitParams(values, queryParams, 'message_count')
        queryParams = this.parseUpdateTime(values, queryParams)
        body.query_params = queryParams
        body.is_filter_friend = !!values.is_filter_friend
        // verify_params
        let verifyParams = {}
        verifyParams.verify_infos = values.verifyMessages
        verifyParams.friend_remark = values.friendRemark
        // verifyParams.friend_tag = values.tags
        body.verify_params = verifyParams
        // periods
        body.periods = this.parsePeriods(values.periods)

        return body
    }

    parseSplitParams = (values, queryParams, key) => {
        let param = values[key]
        let startValue
        let endValue
        if (param) {
            let params = param.split(',')
            startValue = this.getRangeValue(params[0])
            endValue = this.getRangeValue(params[1])
            if(key.indexOf('amount') !== -1) {
                if(startValue) {
                    startValue = startValue * 100
                }
                if(endValue) {
                    endValue = endValue * 100
                }
            }
        }
        queryParams[`${key}_begin`] = startValue
        queryParams[`${key}_end`] = endValue
        return queryParams
    }

    getRangeValue = (value) => {
        if (typeof value === 'string') {
            if (value) {
                return Number(value)
            }
        }
    }

    parseUpdateTime = (values, queryParams) => {
        const days = values.update_date_days
        // 自定义
        if (days === 0) {
            queryParams.update_date_begin = values.update_date_begin
            queryParams.update_date_end = values.update_date_end
            return queryParams
        }
        if (days !== -1) {
            queryParams.update_date_days = days
        }
        return queryParams
    }

    parsePeriods = (periods) => {
        return periods.map((v) => {
            const seconds = this.getSeconds(v.time)
            return {
                seconds: seconds,
                limit_num: v.num
            }
        })
    }

    getSeconds = (time) => {
        if (time) {
            const date = moment(time, timeFormat)
            const hours = date.hours()
            const minutes = date.minutes()
            return hours * 3600 + minutes * 60
        }
        return 0
    }


    handleChange = (key, e) => {
        let value = ''
        if (e && e.target) {
            value = e.target.value
        } else {
            value = e
        }
        let body = {...this.state.body}
        if (key === 'platform_type') {
            body['shop_id'] = ''
        }
        let parseValue = typeof value === 'string' ? value.trim() : value
        body[key] = parseValue
        this.setState({
            body: body
        })
        this.validate(key, parseValue)
    }

    handleDateChange = (prefix, startValue, endValue) => {
        let body = {...this.state.body}
        body[`${prefix}_begin`] = startValue ? moment(startValue).format(DateFormat) + ' 00:00:00' : ''
        body[`${prefix}_end`] = endValue ? moment(endValue).format(DateFormat) + ' 23:59:59' : ''
        this.setState({
            body: body
        },()=> {
            if(prefix === 'update_date') {
                let error = {...this.state.error}
                error = this.validateUpdateDate('update_date_days', body, error)
                this.setState({
                    error: error
                })
            }
        })
    }

    handleDataSourceChange = (key, value, idx) => {
        let body = {...this.state.body}

        if(key === 'order_amount' || key === 'average_amount' || key === 'order_count' || key === 'message_count') {
            let t = body[key].split(',')
            t[idx] = value
            if(t.join(',').indexOf(',') === -1){
                body[key] = `${t.join(',')},`
            }else {
                body[key] = t.join(',')
            }
        } else {
            if (value && value.target) {
                body[key] = value.target.value
            } else {
                body[key] = value
            }
        }

        this.validate(key, value, idx)
        this.setState({
            body: body
        })
    }

    validate = (key, value, idx) => {
        let error  = _.cloneDeep(this.state.error)
        switch (key) {
            case 'title': error = this.validateTitle(key, value, error)
                break
            case 'update_date_days': error = this.validateUpdateDate(key, value, error)
                break
            case 'order_amount':
            case 'average_amount' :
                error = this.validateAmount(key, value, idx)
                break
            case 'order_count':
            case 'message_count':
                error = this.validateCount(key, value, idx)
                break
            default:
        }
        this.setState({
            error: error
        })
    }

    validateTitle = (key, value, error) => {
        if (!value) {
            error[key] = '请输入模板标题'
        } else if (error.length > titleMaxLen) {
            error[key] = '标题限制20字以内'
        } else {
            error[key] = ''
        }
        return error
    }

    validateAmount = (key, value, idx) => {
        const reg = /^(([1-9]\d{0,7})|0)(\.\d{0,2})?$/
        let body = {...this.state.body}
        let error = {...this.state.error}
        let amount = body[key]
        if (typeof value === 'undefined' || value === '' || value === null) {
            error[key] = ''
        } else {
            let nums = amount.split(',')
            let errorMsg = ''
            if (!reg.test(value)) {
                errorMsg = '请输入0.01 ~ 99999999.99区间内的数字，最多两位小数'
            } else {
                if (idx === 0) {
                    if (nums[1]) {
                        let end = nums[1]
                        if (numeral(value).subtract(end).value() > 0) {
                            errorMsg = '需小于等于结束金额'
                        }
                    }
                } else if (idx === 1) {
                    if (nums[0]) {
                        let start = nums[0]
                        if (numeral(start).subtract(value).value() > 0) {
                            errorMsg = '需大于等于开始金额'
                        }
                    }
                }
            }
            error[key] = errorMsg
        }
        this.setState({
            body: body
        })
        return error
    }

    validateCount = (key, value, idx) => {
        let body = {...this.state.body}
        let error = {...this.state.error}
        const reg = /^(0|([1-9]\d{0,7}))$/

        let count = body[key]
        let errorMsg = ''
        if (!value) {
            error[key] = ''
        } else {
            if (!reg.test(value)) {
                errorMsg = '请输入0 ~ 99999999区间内的数字'
            } else {
                let nums = count.split(',')
                if (idx === 0) {
                    if (nums[1]) {
                        let end = parseInt(nums[1], 10)
                        if (value > end) {
                            errorMsg = '需小于等于结束数量'
                        }
                    }
                } else if (idx === 1) {
                    if (nums[0]) {
                        let start = parseInt(nums[0], 10)
                        if (value < start) {
                            errorMsg = '需大于等于开始数量'
                        }
                    }
                }
            }
            error[key] = errorMsg
        }
        this.setState({
            body: body
        })
        return error
    }

    validateUpdateDate = (key, values, error) => {
        const {
            update_date_days: updateDateDays,
            update_date_begin: updateDateBegin,
            update_date_end: updateDateEnd,
        } = values
        if (updateDateDays === 0) {
            if (updateDateBegin || updateDateEnd) {
                error[key] = ''
            } else {
                error[key] = '请选择时间'
            }
        } else {
            error[key] = ''
        }
        return error
    }

    handleAddVerifyMessage = () => {
        let body = _.cloneDeep(this.state.body)
        let verifyMessages = _.cloneDeep(body.verifyMessages)
        let error = _.cloneDeep(this.state.error)
        let verifyMessagesError = _.cloneDeep(error.verifyMessages)
        verifyMessages.push('')
        verifyMessagesError.push('')
        body.verifyMessages = verifyMessages
        error.verifyMessages = verifyMessagesError
        this.setState({
            body: body,
            error: error
        })
    }

    handleRemoveVerifyMessage = (index) => {
        let body = _.cloneDeep(this.state.body)
        let verifyMessages = _.cloneDeep(body.verifyMessages)
        let error = _.cloneDeep(this.state.error)
        let verifyMessagesError = _.cloneDeep(error.verifyMessages)
        verifyMessages.splice(index, 1)
        verifyMessagesError.splice(index, 1)
        body.verifyMessages = verifyMessages
        error.verifyMessages = verifyMessagesError
        this.setState({
            body: body,
            error: error
        })
    }

    handleVerifyMessageChange = (e, index) => {
        let body = _.cloneDeep(this.state.body)
        let verifyMessages = _.cloneDeep(body.verifyMessages)

        let error = _.cloneDeep(this.state.error)
        let verifyMessagesError = _.cloneDeep(error.verifyMessages)

        let value = e.target.value.trim()
        verifyMessages[index] = value
        body.verifyMessages = verifyMessages
        const verifyVariables = this.getVariables(verifyVariablePlaceholder)
        verifyMessagesError = this.validateVerifyMessage(value, verifyMaxLen, verifyVariables, index, verifyMessagesError)
        error.verifyMessages = verifyMessagesError
        this.setState({
            body: body,
            error: error,
        })
    }

    handleFriendRemarkChange = (e) => {
        let body = _.cloneDeep(this.state.body)
        let value = e.target.value.trim()
        body.friendRemark = value
        const verifyVariables = this.getVariables(remarkVariablePlaceholder)
        this.validateFriendRemark(value, verifyMaxLen, verifyVariables)
        this.setState({
            body: body
        })
    }

    handleInsertVariable = (type, variable, index) => {
        if(type === 'verifyMessage') {
            this.insertVerifyVariable(variable, index)
        } else if(type === 'friendRemark'){
            this.insertFriendRemarkVariable(variable)
        }
    }

    getCursorPosition = (obj) => {
        let cursorIndex = 0
        if (document.selection) {
            obj.focus()
            const range = document.selection.createRange()
            range.moveStart('character', -obj.value.length)
            cursorIndex = range.text.length
        } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            cursorIndex = obj.selectionStart
        }
        return cursorIndex
    }

    insertVerifyVariable = (variable, index) => {
        let body = _.cloneDeep(this.state.body)
        const verifyMessages =_.cloneDeep(body.verifyMessages)
        let verifyMessage = verifyMessages[index]
        if (verifyMessage.indexOf(variable) !== -1) {
            message.warning(`变量${variable}已存在`)
            return
        }
        const ref = this[`verifyMessageRef${index}`]
        if (ref && ref.input) {
            const cursorPosition = this.getCursorPosition(ref.input)
            if (cursorPosition) {
                if (cursorPosition === verifyMessage.length) {
                    verifyMessage = `${verifyMessage}${variable}`
                } else {
                    verifyMessage = `${verifyMessage.substr(0, cursorPosition)}${variable}${verifyMessage.substr(cursorPosition - 1)}`
                }
            } else {
                verifyMessage = `${variable}${verifyMessage}`
            }
            verifyMessages[index] = verifyMessage
            body.verifyMessages = verifyMessages

            let error = _.cloneDeep(this.state.error)
            let verifyMessagesError = _.cloneDeep(error.verifyMessages)
            const verifyVariables = this.getVariables(verifyVariablePlaceholder)
            verifyMessagesError = this.validateVerifyMessage(verifyMessage, verifyMaxLen, verifyVariables, index, verifyMessagesError)
            error.verifyMessages = verifyMessagesError

            this.setState({
                body: body,
                error: error,
            })
        }
    }

    insertFriendRemarkVariable = (variable) => {
        let body = {...this.state.body}
        let friendRemark = body.friendRemark
        if (friendRemark.indexOf(variable) !== -1) {
            message.warning(`变量${variable}已存在`)
            return
        }
        const ref = this.friendRemarkRef
        if (ref && ref.input) {
            const cursorPosition = this.getCursorPosition(ref.input)
            if (cursorPosition) {
                if (cursorPosition === friendRemark.length) {
                    friendRemark = `${friendRemark}${variable}`
                } else {
                    friendRemark = `${friendRemark.substr(0, cursorPosition)}${variable}${friendRemark.substr(cursorPosition - 1)}`
                }
            } else {
                friendRemark = `${variable}${friendRemark}`
            }
            body.friendRemark = friendRemark
            this.setState({
                body: body
            })
        }
    }

    validateVerifyMessage = (value, verifyMaxLen, variables, index, verifyMessagesError) => {
        verifyMessagesError[index] = this.getVerifyMessageErrorMsg(value, verifyMaxLen, variables, true)
        return verifyMessagesError
    }

    validateFriendRemark = (value, verifyMaxLen, variables) => {
        let error = _.cloneDeep(this.state.error)
        error.friendRemark = this.getVerifyMessageErrorMsg(value, verifyMaxLen, variables, false)
        this.setState({
            error: error
        })
    }

    getVerifyMessageErrorMsg = (value, maxLength, variables, required) => {
        let errorMsg = ''
        let match = []
        if (required && !value) {
            errorMsg = '请输入验证信息'
        } else {
            variables.forEach((v) => {
                const matchReg = value.match(new RegExp(v, 'g'))
                if (matchReg && matchReg.length > 1) {
                    match.push(v)
                }
            })
            if (match.length) {
                errorMsg = '变量'
                if (match.length === 1) {
                    errorMsg += match[0]
                } else {
                    match.forEach((v, index) => {
                        return errorMsg += `${v}${index < match.length - 1 ? '、' : ''}`
                    })
                }
                errorMsg += '重复添加'
            } else {
                if (this.isOverExcludeVariables(value, maxLength, variables)) {
                    errorMsg = `输入限制${maxLength}个字`
                }
            }
        }
        return errorMsg
    }

    isOverExcludeVariables = (value, maxLength, variables) => {
        variables.forEach((v) => {
            value = value.replace(new RegExp(v, 'g'), '')
        })
        return value.length > maxLength
    }

    getVariables = (variablePlaceholder) => {
        return Object.values(variablePlaceholder)
    }

    handleTagInputChange = (e) => {
        let value = e && e.target ? e.target.value : e
        value = value.trim()
        this.setState({
            tagInputValue: value
        })
    }

    handleAddTag = (value) => {
        if (!value) {
            return
        }
        let body = {...this.state.body}
        const currentTags = [...body.tags]
        const has = currentTags.find((v) => {
            return v === value
        })
        if (has) {
            message.warning('标签已存在')
            return
        }
        currentTags.unshift(value)
        body.tags = currentTags
        this.setState({
            tagInputValue: '',
            body: body,
        })
    }

    removeTag = (tag) => {
        let body = {...this.state.body}
        const tags = [...body.tags]
        body.tags = tags.filter((v) => {
            return v !== tag
        })
        this.setState({
            body: body
        })
    }

    handleAddPeriod = () => {
        let body = _.cloneDeep(this.state.body)
        let periods = _.cloneDeep(body.periods)
        let error = _.cloneDeep(this.state.error)
        let periodsError = _.cloneDeep(error.periods)
        periods.push({})
        periodsError.push({})
        body.periods = periods
        error.periods = periodsError
        this.setState({
            body: body,
            error: error
        })
    }

    handleRemovePeriod = (index) => {
        let body = _.cloneDeep(this.state.body)
        let periods = _.cloneDeep(body.periods)
        let error = _.cloneDeep(this.state.error)
        let periodsError = _.cloneDeep(error.periods)
        periods.splice(index, 1)
        periodsError.splice(index, 1)
        body.periods = periods
        error.periods = periodsError
        this.setState({
            body: body,
            error: error
        })
    }

    handlePeriodTimeChange = (e, index) => {
        let body = _.cloneDeep(this.state.body)
        let periods = _.cloneDeep(body.periods)
        let error = _.cloneDeep(this.state.error)
        let periodsError = _.cloneDeep(error.periods)
        let time = e
        if (e) {
            time = e.format(timeFormat)
        }
        periods[index].time = time
        body.periods = periods
        periodsError = this.validatePeriodTime(time, index, periodsError)
        error.periods = periodsError
        this.setState({
            body: body,
            error: error
        })
    }

    validatePeriodTime = (value, index, periodsError) => {
        let periods = this.state.body.periods
        let periodTimeError = ''
        if (!value) {
            periodTimeError = '请选择时间'
        } else {
            let first = -1
            let some = periods.filter((v, index) => {
                let filter = v.time === value
                if (filter) {
                    if (first === -1) {
                        first = index
                    }
                }
                return filter
            })
            if (some.length && index !== first) {
                periodTimeError = '时间重复'
            }
        }
        periodsError[index].time = periodTimeError
        return periodsError
    }

    handlePeriodNumChange = (e, index) => {
        let body = _.cloneDeep(this.state.body)
        let periods = _.cloneDeep(body.periods)
        let error = _.cloneDeep(this.state.error)
        let periodsError = _.cloneDeep(error.periods)
        periods[index].num = e
        body.periods = periods
        periodsError = this.validatePeriodNum(e, index, periodsError)
        error.periods = periodsError
        this.setState({
            body: body,
            error: error,
        })
    }

    validatePeriodNum = (value, index, periodsError) => {
        let periodNumError = ''
        if (typeof value === 'undefined' || (!value && typeof value !== 'undefined' && value !== 0)) {
            periodNumError = '请输入加粉数量'
        } else {
            if (value > addFansMaxNum) {
                periodNumError = `上限为${addFansMaxNum}`
            }
        }
        periodsError[index].num = periodNumError
        return periodsError
    }

    showConfirm = () => {
        if (this.hasEdited()) {
            confirm({
                title: '编辑的内容尚未提交，确定取消？',
                okText: '确定',
                cancelText: '取消',
                onOk: () => {
                    this.referer()
                },
                onCancel: () => {
                },
            })
        } else {
            this.referer()
        }
    }

    hasEdited = () => {
        const {body} = this.state
        let hasEdited = false
        const keys = Object.keys(body)
        if (keys.length) {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i]
                let item = body[key]
                if (item && !(item instanceof Array) && !(item instanceof Object)) {
                    if (key === 'remarkOption') {
                        continue
                    }
                    if (key === 'update_date_days') {
                        if (item === -1) {
                            continue
                        }
                    }
                    hasEdited = true
                    break
                } else {
                    if(item instanceof Array) {
                        for (let j = 0; j < item.length; j++) {
                            let subItem = item[j]
                            let subKeys =  Object.keys(subItem)
                            for (let k = 0; k < subKeys.length; k++) {
                                let subKey = subKeys[k]
                                if (subItem[subKey]) {
                                    hasEdited = true
                                    break
                                }
                            }

                        }
                    }
                }
            }
        }
        return hasEdited
    }

    getErrMsg = (key) => {
        const {error} = this.state
        if (error[key]) {
            return <p className={styles.errMsg}>{error[key]}</p>
        }
        return null
    }

    getErrMsgByIndex = (key, index) => {
        const {error} = this.state
        if (error[key]) {
            if(error[key][index]) {
                return <p className={styles.errMsg}>{error[key][index]}</p>
            }
        }
        return null
    }

    getPeriodMsgByIndex = (key, index) => {
        const {error} = this.state
        if (error[key] && error[key][index]) {
            const item = error[key][index]
            if(item.time || item.num) {
                return <p className={`${styles.errMsg} ${styles.periodErrMsg}`}>
                    <span>{item.time}</span>
                    <span>{item.num}</span>
                </p>
            }
        }
        return null
    }

    render() {
        const {createLoading, updateLoading, detailLoading} = this.props
        const {body, tagInputValue} = this.state

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 16},
        }

        const timePeriodFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 18},
        }

        const amountParser = (value) => {
            return value.replace(/[^\d.]/g, '')
        }

        const countParser = (value) => {
            return value.replace(/[^\d]/g, '').replace(/0*(\d+)/,'$1')
        }

        const getVal = (key, idx) => {
            if (body[key]) {
                let t = body[key].split(',')
                if (t.length > idx) {
                    return t[idx]
                }
                return ''
            }
            return ''
        }

        return (
            <Spin spinning={!!detailLoading}>
                <Col span={12}>
                    <Form>
                        <FormItem {...formItemLayout}
                            label="模板标题"
                            required={true}
                        >
                            <Input placeholder={`请输入模板标题，限制${titleMaxLen}个字`}
                                maxLength={titleMaxLen}
                                value={body.title}
                                onChange={(e)=>{this.handleChange('title', e)}}
                            />
                            {this.getErrMsg('title')}
                        </FormItem>
                        <h4 className={styles.subTitle}>数据来源<span className={styles.titleDesc}>取用户池的数据，按照最后更新时间越近的越先加</span></h4>
                        <FormItem {...formItemLayout}
                            label="平台"
                        >
                            <PlatformSelect
                                placeholder="请选择"
                                platform={body.platform_type}
                                onChange={(value)=>{this.handleChange('platform_type', value)}}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="店铺"
                        >
                            <ShopSelect
                                placeholder="请选择"
                                platform={body.platform_type}
                                shopId={body.shop_id}
                                onChange={(value)=>{this.handleChange('shop_id', value)}}
                            />
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="备注"
                        >
                            <div className={styles.remarkWrap}>
                                <div className={styles.option}>
                                    <RadioGroup value={body.remarkOption}
                                        buttonStyle="solid"
                                        size="small"
                                        onChange={(e)=>{this.handleChange('remarkOption', e)}}
                                    >
                                        <RadioButton value={1}>包含</RadioButton>
                                        <RadioButton value={0}>不包含</RadioButton>
                                    </RadioGroup>
                                </div>
                                <div className={styles.remark}>
                                    <TextArea placeholder="请输入用户池备注信息"
                                        value={body.remarkText}
                                        maxLength={remarkMaxLen}
                                        onChange={(e)=>{this.handleChange('remarkText', e)}}
                                    />
                                </div>
                            </div>
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="订单总额"
                        >
                            <div className={styles.inputNumberWrap}>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="元"
                                    min={0.01}
                                    max={99999999.99}
                                    parser={amountParser}
                                    value={getVal('order_amount', 0)}
                                    onChange={(e)=>{this.handleDataSourceChange('order_amount', e, 0)}}
                                />
                                <span className={styles.space}>~</span>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="元"
                                    min={0.01}
                                    max={99999999.99}
                                    parser={amountParser}
                                    value={getVal('order_amount', 1)}
                                    onChange={(e)=>{this.handleDataSourceChange('order_amount', e, 1)}}
                                />
                            </div>
                            {this.getErrMsg('order_amount')}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="平均单价"
                        >
                            <div className={styles.inputNumberWrap}>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="元"
                                    min={0.01}
                                    max={999999999.99}
                                    parser={amountParser}
                                    value={getVal('average_amount', 0)}
                                    onChange={(e)=>{this.handleDataSourceChange('average_amount', e, 0)}}

                                />
                                <span className={styles.space}>~</span>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="元"
                                    min={0.01}
                                    max={99999999.99}
                                    parser={amountParser}
                                    value={getVal('average_amount', 1)}
                                    onChange={(e)=>{this.handleDataSourceChange('average_amount', e, 1)}}
                                />
                            </div>
                            {this.getErrMsg('average_amount')}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="订单总量"
                        >
                            <div className={styles.inputNumberWrap}>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="个"
                                    min={0}
                                    max={99999999}
                                    parser={countParser}
                                    value={getVal('order_count', 0)}
                                    onChange={(e)=>{this.handleDataSourceChange('order_count', e, 0)}}
                                />
                                <span className={styles.space}>~</span>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="个"
                                    min={0}
                                    max={99999999}
                                    parser={countParser}
                                    value={getVal('order_count', 1)}
                                    onChange={(e)=>{this.handleDataSourceChange('order_count', e, 1)}}
                                />
                            </div>
                            {this.getErrMsg('order_count')}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="最后更新时间"
                            required={body.update_date_days === 0}
                        >
                            <RadioGroup style={{whiteSpace: 'noWrap'}}
                                value={body.update_date_days}
                                onChange={(e)=>{this.handleChange('update_date_days', e)}}
                            >
                                <Radio value={-1}>不限</Radio>
                                <Radio value={3}>近3天</Radio>
                                <Radio value={7}>近7天</Radio>
                                <Radio value={15}>近15天</Radio>
                                <Radio value={30}>近30天</Radio>
                                <Radio value={0}>自定义</Radio>
                            </RadioGroup>
                            {
                                body.update_date_days === 0 ? <DateRange {...this.props}
                                    ref={(ref)=>{this.createTime = ref}}
                                    startValue={body.update_date_begin ? moment(body.update_date_begin, DateFormat) : ''}
                                    endValue={body.update_date_end ? moment(body.update_date_end, DateFormat) : ''}
                                    onChange={(startValue, endValue)=>{this.handleDateChange('update_date', startValue, endValue)}}
                                    maxToday={true}/> : null
                            }
                            {this.getErrMsg('update_date_days')}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="已发短信数"
                        >
                            <div className={styles.inputNumberWrap}>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="条"
                                    min={0}
                                    max={99999999}
                                    parser={countParser}
                                    value={getVal('message_count', 0)}
                                    onChange={(e)=>{this.handleDataSourceChange('message_count', e, 0)}}
                                />
                                <span className={styles.space}>~</span>
                                <InputNumber className={styles.inputNumber}
                                    placeholder="条"
                                    min={0}
                                    max={99999999}
                                    parser={countParser}
                                    value={getVal('message_count', 1)}
                                    onChange={(e)=>{this.handleDataSourceChange('message_count', e, 1)}}
                                />
                            </div>
                            {this.getErrMsg('message_count')}
                        </FormItem>
                        <FormItem {...formItemLayout}
                            label="是否过滤已有好友"
                        >
                            <RadioGroup value={body.is_filter_friend}
                                onChange={(e)=>{this.handleChange('is_filter_friend', e)}}>
                                <Radio value={1}>是</Radio>
                                <Radio value={0}>否</Radio>
                            </RadioGroup>
                        </FormItem>
                        <h4 className={styles.subTitle}>验证设置</h4>
                        <FormItem {...formItemLayout}
                            label="验证信息"
                            required={true}
                        >
                            <div className={styles.verifyMessagesWrap}>
                                {
                                    body.verifyMessages.map((item, index)=>{
                                        return <div key={index} className={styles.item}>
                                            <div className={styles.inputWrap}>
                                                <Input ref={(ref)=>{this[`verifyMessageRef${index}`] = ref}}
                                                    placeholder={`输入限制${verifyMaxLen}个字`}
                                                    value={item}
                                                    onChange={(e)=>{this.handleVerifyMessageChange(e, index)}}
                                                />
                                                {
                                                    index ?
                                                        <Icon type="delete"
                                                            className={styles.deleteIcon}
                                                            onClick={()=>{this.handleRemoveVerifyMessage(index)}}
                                                        /> : null
                                                }
                                            </div>
                                            <p className={styles.variables}>
                                                {
                                                    Object.keys(verifyVariablePlaceholder).map((key, idx)=>{
                                                        const value = verifyVariablePlaceholder[key]
                                                        return  <span key={idx} className={styles.variable}
                                                            onClick={()=>{
                                                                this.handleInsertVariable('verifyMessage', value, index)
                                                            }}
                                                        >{value}</span>
                                                    })
                                                }
                                            </p>
                                            {this.getErrMsgByIndex('verifyMessages', index)}
                                        </div>
                                    })
                                }
                                <div className={styles.addWrap}>
                                    <Button type="dashed"
                                        className={styles.addBtn}
                                        disabled={body.verifyMessages.length >= multipleMaxNumber}
                                        onClick={this.handleAddVerifyMessage}
                                    ><Icon type="plus"/>添加验证信息</Button>
                                </div>
                                <p className={styles.tip}>设置多条将随机发送</p>
                            </div>
                        </FormItem>

                        <FormItem {...formItemLayout}
                            label="好友备注"
                        >
                            <Input ref={(ref)=>{this.friendRemarkRef = ref}}
                                placeholder={`输入限制${verifyMaxLen}个字`}
                                value={body.friendRemark}
                                onChange={(e)=>{this.handleFriendRemarkChange(e)}}
                            />
                            <p className={styles.variables}>
                                {
                                    Object.keys(remarkVariablePlaceholder).map((key, index)=>{
                                        const value = remarkVariablePlaceholder[key]
                                        return  <span key={index} className={styles.variable}
                                            onClick={()=>{
                                                this.handleInsertVariable('friendRemark', value)
                                            }}
                                        >{value}</span>
                                    })
                                }
                            </p>
                            {this.getErrMsg('friendRemark')}
                        </FormItem>
                        {/*<FormItem {...formItemLayout}*/}
                        {/*label="好友标签"*/}
                        {/*>*/}
                        {/*<Input placeholder={`输入限制${tagMaxLen}个字`}*/}
                        {/*value={tagInputValue}*/}
                        {/*onChange={this.handleTagInputChange}*/}
                        {/*onPressEnter={()=>{this.handleAddTag(tagInputValue)}}*/}
                        {/*/>*/}
                        {/*<div className={styles.tagsWrap}>*/}
                        {/*<p className={styles.tip}>若无此标签，将创建一个</p>*/}
                        {/*<div className={styles.tags}>*/}
                        {/*{*/}
                        {/*body.tags.map((tag)=>{*/}
                        {/*return <Tag key={tag}*/}
                        {/*closable={true}*/}
                        {/*color="blue"*/}
                        {/*className={styles.tag}*/}
                        {/*onClose={()=>{this.removeTag(tag)}}*/}
                        {/*>{tag}</Tag>*/}
                        {/*})*/}
                        {/*}*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</FormItem>*/}
                        <h4 className={styles.subTitle}>其他设置</h4>

                        <FormItem {...formItemLayout}
                            label='加粉数量'
                            required={true}
                        >
                            <p className={styles.desc}>为避免频繁加粉骚扰客户，每日每个微信号最多主动加{addFansMaxNum}个粉（不管加粉成功与否，均计1个）</p>
                            {/*<p className={`${styles.tip} ${styles.stress}`}>微信限制手机号搜索好友次数一天为{addFansMaxNum}个，为避免被封号，一天加粉数量请勿超过{addFansMaxNum}个</p>*/}
                        </FormItem>
                        <FormItem {...timePeriodFormItemLayout} label=" " colon={false}>

                            {
                                body.periods.map((item, index)=>{
                                    return  <div key={index} className={styles.item}>
                                        <div className={styles.timePeriodWrap}>
                                            <TimePicker
                                                className={styles.timepicker}
                                                minuteStep={environmentConfig.isTestEnvironment ? 5 : 30}
                                                format={timeFormat}
                                                value={item.time ? moment(item.time, timeFormat) : null}
                                                onChange={(e)=>{this.handlePeriodTimeChange(e, index)}}
                                            />
                                            <span className={styles.space}>执行加粉操作，加粉数量</span>
                                            <InputNumber className={styles.input}
                                                min={1}
                                                max={addFansMaxNum}
                                                parser={countParser}
                                                value={item.num}
                                                onChange={(e)=>{this.handlePeriodNumChange(e, index)}}
                                            />
                                            {
                                                index ? <Icon type="delete"
                                                    className={styles.deleteIcon}
                                                    onClick={()=>{this.handleRemovePeriod(index)}}
                                                /> : null
                                            }
                                        </div>
                                        {this.getPeriodMsgByIndex('periods', index)}
                                    </div>
                                })
                            }
                            <div className={styles.addWrap}>
                                <Button type="dashed"
                                    disabled={body.periods.length >= multipleMaxNumber}
                                    className={styles.addBtn}
                                    onClick={this.handleAddPeriod}
                                ><Icon type="plus"/>添加加粉配置</Button>
                            </div>
                            {this.getErrMsg('periodTotalNum')}
                        </FormItem>
                        <FormItem {...formItemLayout} label=" " colon={false} className={styles.btns}>
                            <Button type="primary"
                                icon={(createLoading || updateLoading) ? 'loading' : null}
                                disabled={createLoading || updateLoading}
                                onClick={this.handleSave}
                            >保存</Button>
                            <Button onClick={this.showConfirm}>取消</Button>
                        </FormItem>
                    </Form>
                </Col>
            </Spin>
        )
    }
}
