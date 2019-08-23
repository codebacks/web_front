/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/19
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

    handleEndOpenChange = (open) => {
        this.setState({endOpen: open})
    }

    render() {
        const {
            style,
            className,
            startTimePickerOption,
            endTimePickerOption,
            ...otherProps
        } = this.props
        const {endOpen, value} = this.state
        const cls = classNames(styles.leoRangeTimePicker, className)

        return (
            <div className={cls} style={{...style}}>
                <TimePicker
                    {...otherProps}
                    {...startTimePickerOption}
                    value={value[0]}
                    defaultValue={null}
                    onOpenChange={this.handleStartOpenChange}
                />
                <span className={styles.sp}>~</span>
                <TimePicker
                    {...otherProps}
                    {...endTimePickerOption}
                    value={value[1]}
                    defaultValue={null}
                    open={endOpen}
                    onOpenChange={this.handleEndOpenChange}
                />
            </div>
        )
    }
}