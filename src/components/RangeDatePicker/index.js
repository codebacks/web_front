/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/17
 */
import React, {PureComponent} from 'react'
import {DatePicker} from 'antd'
import PropTypes from 'prop-types'
import styles from './index.less'
import classNames from 'classnames'
import moment from "moment"

const errorMoment = 'Invalid date'

export function timeToMoment(val) {
    val = moment(val)

    if(val.format() === errorMoment) {
        return null
    }

    return val
}

export default class Index extends PureComponent {
    static displayName = 'leo-RangeDatePicker'

    static propTypes = {
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        style: PropTypes.object,
        classNames: PropTypes.string,
        onChange: PropTypes.func,
        startDatePickerOption: PropTypes.object,
        endDatePickerOption: PropTypes.object,
    }

    static defaultProps = {
        startDatePickerOption: {},
        endDatePickerOption: {},
    }

    constructor(props) {
        super(props)

        this.state = {
            value: props.value || props.defaultValue || [],
            endOpen: false,
        }
    }

    static getDerivedStateFromProps(nextProps) {
        if('value' in nextProps) {
            return {
                value: nextProps.value || [],
            }
        }
        return null
    }

    disabledStartDate = (startValue) => {
        const {maxRangeDays, maxToday} = this.props
        const endValue = this.state.value[1]
        let maxRange = false, today = false
        if(maxToday) {
            today = startValue && startValue.isAfter(moment())
        }
        if(!startValue || !endValue) {
            return maxToday ? today : false
        }
        if(maxRangeDays) {
            maxRange = endValue.diff(startValue, 'days') > maxRangeDays
        }
        return startValue.valueOf() > endValue.valueOf() || maxRange || today
    }

    disabledEndDate = (endValue) => {
        const {maxRangeDays, maxToday} = this.props
        const startValue = this.state.value[0]
        let maxRange = false, today = false
        if(maxToday) {
            today = endValue && endValue.isAfter(moment())
        }
        if(!endValue || !startValue) {
            return maxToday ? today : false
        }
        if(maxRangeDays) {
            maxRange = endValue.diff(startValue, 'days') > maxRangeDays
        }
        return endValue.valueOf() < startValue.valueOf() || maxRange || today
    }

    onChange = (value) => {
        if(!('value' in this.props)) {
            this.setState({value})
        }

        const {onChange} = this.props
        if(onChange) {
            onChange(value)
        }
    }

    handleStartOpenChange = (open) => {
        if(!open) {
            this.setState({endOpen: true})
        }
    }

    handleEndOpenChange = (open) => {
        this.setState({endOpen: open})
    }

    startOnChange = (startValue) => {
        const {value} = this.state
        value[0] = startValue
        this.onChange(value)
    }

    endOnChange = (endValue) => {
        const {value} = this.state
        value[1] = endValue
        this.onChange(value)
    }

    setDatePickerOption = (defaultDatePickerOption, datePickerOption) => {
        return Object.assign(defaultDatePickerOption, datePickerOption)
    }

    render() {
        let {
            style,
            className,
            startDatePickerOption,
            endDatePickerOption,
            ...otherProps
        } = this.props
        const {endOpen, value} = this.state
        const cls = classNames(styles.leoRangeDatePicker, className)

        startDatePickerOption = this.setDatePickerOption({
            disabledDate: this.disabledStartDate,
        }, startDatePickerOption)

        endDatePickerOption = this.setDatePickerOption({
            disabledDate: this.disabledEndDate,
        }, endDatePickerOption)

        return (
            <div className={cls} style={{...style}}>
                <DatePicker
                    {...otherProps}
                    {...startDatePickerOption}
                    value={value[0]}
                    defaultValue={null}
                    onChange={this.startOnChange}
                    onOpenChange={this.handleStartOpenChange}
                />
                <span className={styles.sp}>~</span>
                <DatePicker
                    {...otherProps}
                    {...endDatePickerOption}
                    value={value[1]}
                    defaultValue={null}
                    onChange={this.endOnChange}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                />
            </div>
        )
    }
}