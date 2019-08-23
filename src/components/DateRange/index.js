'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2018/5/3
 */
import React, {PureComponent} from 'react'
import {DatePicker} from 'antd'
import moment from 'moment'
import Styles from './index.scss'

class DateRange extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            startValue: props.startValue && props.startValue.format() !== 'Invalid date' ? props.startValue : null,
            endValue: props.endValue && props.endValue.format() !== 'Invalid date' ? props.endValue : null,
            format: props.format ? props.format : 'YYYY-MM-DD',
            endOpen: false,
            showTime: false,
            maxToday: props.maxToday ? props.maxToday : false,
            maxRangeDays: props.maxRangeDays ? props.maxRangeDays : 0,
            startPlaceholder: props.startPlaceholder || '开始时间',
            endPlaceholder: props.endPlaceholder || '截止时间',
        }
    }

    componentDidMount() {
    }

    disabledStartDate = (startValue) => {
        const {endValue, maxRangeDays, maxToday} = this.state
        let maxRange = false, today = false
        if (maxToday) {
            today = startValue && startValue.isAfter(moment(), 'day')
        }
        if (!startValue || !endValue) {
            return maxToday ? today : false
        }
        if (maxRangeDays) {
            // maxRange = endValue.diff(startValue, 'days') >= maxRangeDays - 1
            maxRange = endValue.diff(startValue, 'days') > maxRangeDays
        }
        return startValue.isAfter(endValue, 'day') || maxRange || today
    };

    disabledEndDate = (endValue) => {
        const {startValue, maxRangeDays, maxToday} = this.state
        let maxRange = false, today = false
        if (maxToday) {
            today = endValue && endValue.isAfter(moment(), 'day')
        }
        if (!endValue || !startValue) {
            return maxToday ? today : false
        }
        if (maxRangeDays) {
            maxRange = endValue.diff(startValue, 'days') > maxRangeDays
        }
        return endValue.isBefore(startValue, 'day') || maxRange || today
    };

    onChange = (field, value) => {
        this.setState({
            [field]: value,
        })
    };

    onStartChange = (value) => {
        this.onChange('startValue', value)
        this.props.onChange(value, this.state.endValue)
    };

    onEndChange = (value) => {
        this.onChange('endValue', value)
        this.props.onChange(this.state.startValue, value)
    };

    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({endOpen: true})
        }
    };

    handleEndOpenChange = (open) => {
        this.setState({endOpen: open})
    };

    setDate = (startValue, endValue) => {
        this.setState({
            startValue: startValue,
            endValue: endValue,
        })
    };

    render() {
        const {startValue, endValue, endOpen, format, showTime, maxRangeDays, startPlaceholder, endPlaceholder} = this.state
        return (
            <div className={Styles.dateRange} style={{...this.props.style}}>
                <DatePicker
                    disabledDate={this.disabledStartDate}
                    showTime={showTime}
                    format={format}
                    value={startValue}
                    placeholder={startPlaceholder}
                    onChange={this.onStartChange}
                    onOpenChange={this.handleStartOpenChange}
                    showToday={false}
                    renderExtraFooter={() => maxRangeDays ? <div>与截止时间最大间距{maxRangeDays}天</div> : ''}
                />
                <span className={Styles.sp}>~</span>
                <DatePicker
                    disabledDate={this.disabledEndDate}
                    showTime={showTime}
                    format={format}
                    value={endValue}
                    placeholder={endPlaceholder}
                    onChange={this.onEndChange}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                    showToday={false}
                    renderExtraFooter={() => maxRangeDays ? <div>与开始时间最大间距{maxRangeDays}天</div> : ''}
                />
            </div>
        )
    }
}

export default DateRange

