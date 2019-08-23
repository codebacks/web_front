/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/17
 */
import React, {PureComponent} from 'react'
import {TimePicker} from 'antd'
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
    static displayName = 'leo-RangeTimePicker'

    static propTypes = {
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        style: PropTypes.object,
        classNames: PropTypes.string,
        onChange: PropTypes.func,
        startTimePickerOption: PropTypes.object,
        endTimePickerOption: PropTypes.object,
    }

    static defaultProps = {}

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

    fillArr = (start, end) => {
        const data = []
        for(; start < end; start++) {
            data.push(start)
        }
        return data
    }

    disabledStartHours = () => {
        const endValue = this.state.value[1]
        if(endValue) {

            return this.fillArr(endValue.hour(), 24)
        }
        return []
    }

    disabledEndHours = () => {
        const startValue = this.state.value[0]
        if(startValue) {

            return this.fillArr(0, startValue.hour())
        }
        return []
    }

    disabledStartMinutes = (selectedHour) => {
        const endValue = this.state.value[1]
        if(endValue) {
            const endHour = endValue.hour()
            if(endHour < selectedHour) {
                return this.fillArr(endValue.minute(), 60)
            }
            if(endHour > selectedHour) {
                return []
            }else {
                return this.fillArr(endValue.minute(), 60)
            }
        }
        return []
    }

    disabledEndMinutes = (selectedHour) => {
        const startValue = this.state.value[0]
        if(startValue) {
            const startHour = startValue.hour()
            if(startHour > selectedHour) {
                return this.fillArr(startValue.minute(), 60)
            }
            if(startHour < selectedHour) {
                return []
            }else {
                return this.fillArr(0, startValue.minute())
            }
        }
        return []
    }

    disabledStartSeconds = (selectedHour, selectedMinute) => {
        const endValue = this.state.value[1]
        if(endValue) {
            const endMinute = endValue.hour() * 60 + endValue.minute()
            const startMinute = selectedHour * 60 + selectedMinute
            if(endMinute < startMinute) {
                return this.fillArr(endValue.second(), 60)
            }
            if(endMinute > startMinute) {
                return []
            }else {
                return this.fillArr(endValue.second(), 60)
            }
        }
        return []
    }

    disabledEndSeconds = (selectedHour, selectedMinute) => {
        const startValue = this.state.value[0]
        if(startValue) {
            const startMinute = startValue.hour() * 60 + startValue.minute()
            const endMinute = selectedHour * 60 + selectedMinute
            if(startMinute > endMinute) {
                return this.fillArr(startValue.second(), 60)
            }
            if(startMinute < endMinute) {
                return []
            }else {
                return this.fillArr(0, startValue.second())
            }
        }
        return []
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

    setTimePickerOption = (defaultDatePickerOption, datePickerOption) => {
        return Object.assign(defaultDatePickerOption, datePickerOption)
    }

    render() {
        let {
            style,
            className,
            startTimePickerOption,
            endTimePickerOption,
            ...otherProps
        } = this.props
        const {endOpen, value} = this.state
        const cls = classNames(styles.leoRangeTimePicker, className)

        startTimePickerOption = this.setTimePickerOption({
            disabledHours: this.disabledStartHours,
            disabledMinutes: this.disabledStartMinutes,
            disabledSeconds: this.disabledStartSeconds,
        }, startTimePickerOption)

        endTimePickerOption = this.setTimePickerOption({
            disabledHours: this.disabledEndHours,
            disabledMinutes: this.disabledEndMinutes,
            disabledSeconds: this.disabledEndSeconds,
        }, endTimePickerOption)

        return (
            <div className={cls} style={{...style}}>
                <TimePicker
                    {...otherProps}
                    {...startTimePickerOption}
                    value={value[0]}
                    defaultValue={null}
                    onChange={this.startOnChange}
                    onOpenChange={this.handleStartOpenChange}
                />
                <span className={styles.sp}>~</span>
                <TimePicker
                    {...otherProps}
                    {...endTimePickerOption}
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