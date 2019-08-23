/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/19
 */
import React, {PureComponent} from 'react'
import {DatePicker} from 'antd'
import PropTypes from 'prop-types'
import styles from './index.less'
import classNames from 'classnames'
import moment from "moment"
import _ from 'lodash'

const errorMoment = 'Invalid date'

export function timeToMoment(val) {
    val = moment(val)

    if(val.format() === errorMoment) {
        return null
    }

    return val
}

export function objMomentToTime(params, cb = (value)=>{
    return moment(value).startOf('day').format('YYYY-MM-DD')
}) {
    const res = {}
    for(const [key, value] of Object.entries(params)) {
        if(moment.isMoment(value)) {
            res[key] = cb(value)
        }else {
            res[key] = value
        }
    }
    return res
}

function setCommonOptions(options, commonOptions) {
    if(!options || !commonOptions){
        return
    }

    Object.keys(commonOptions).forEach((key)=>{
        if(typeof options[key] === 'undefined'){
            options[key] = commonOptions[key]
        }
    })
}

export default class Index extends PureComponent {
    static displayName = 'leo-DateRange'

    static propTypes = {
        startDatePickerOptions: PropTypes.object,
        endDatePickerOptions: PropTypes.object,
        commonOptions: PropTypes.object,
        style: PropTypes.object,
        classNames: PropTypes.string,
    }

    static defaultProps = {
        commonOptions: {
            format: 'YYYY-MM-DD',
            showTime: false,
            showToday: false,
        },
        startDatePickerOptions: {
        },
        endDatePickerOptions: {
        },
    }

    state = {
        endOpen: false,
    }

    handleStartOpenChange = (open) => {
        if(!open) {
            this.setState({endOpen: true})
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({endOpen: open})
    }

    formatValue = (option) => {
        if(typeof option.formatValue === 'function') {
            option.value = option.formatValue(option.value)
        }else {
            option.value = timeToMoment(option.value)
        }
    }

    disabledStartDate = (startValue) => {
        const endValue = _.get(this, 'props.endDatePickerOptions.value')
        if(!endValue || !startValue) {
            return false
        }

        return startValue.valueOf() > endValue.valueOf()
    }

    disabledEndDate = (endValue) => {
        const startValue = _.get(this, 'props.startDatePickerOptions.value')
        if(!endValue || !startValue) {
            return false
        }

        return endValue.valueOf() <= startValue.valueOf()
    }

    setDefaultDisabledDate = (option, name)=>{
        if(typeof option.disabledDate === 'undefined'){
            option.disabledDate = this[name]
        }
    }

    render() {
        const {startDatePickerOptions, endDatePickerOptions, style, className, commonOptions} = this.props
        const {endOpen} = this.state
        const cls = classNames(styles.leoDateRange, className)

        setCommonOptions(startDatePickerOptions, commonOptions)
        setCommonOptions(endDatePickerOptions, commonOptions)
        this.formatValue(startDatePickerOptions)
        this.formatValue(endDatePickerOptions)
        this.setDefaultDisabledDate(startDatePickerOptions, 'disabledStartDate')
        this.setDefaultDisabledDate(endDatePickerOptions, 'disabledEndDate')

        return (
            <div className={cls} style={{...style}}>
                <DatePicker
                    {...startDatePickerOptions}
                    onOpenChange={this.handleStartOpenChange}
                />
                <span className={styles.sp}>~</span>
                <DatePicker
                    {...endDatePickerOptions}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                />
            </div>
        )
    }
}