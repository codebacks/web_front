/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/17
 */
import React, {PureComponent} from 'react'
import {
    InputNumber,
} from 'antd'
import PropTypes from 'prop-types'
import styles from './index.less'
import classNames from 'classnames'

export default class RangeInputNumber extends PureComponent {
    static displayName = 'leo-RangeInputNumber'

    static propTypes = {
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        style: PropTypes.object,
        classNames: PropTypes.string,
        onChange: PropTypes.func,
        startInputNumberOption: PropTypes.object,
        endInputNumberOption: PropTypes.object,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)

        this.state = {
            value: props.value || props.defaultValue || [],
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

    setInputNumberOption = (defaultDatePickerOption, datePickerOption) => {
        return Object.assign(defaultDatePickerOption, datePickerOption)
    }

    render() {
        let {
            style,
            className,
            startInputNumberOption,
            endInputNumberOption,
            ...otherProps
        } = this.props
        const {value} = this.state
        const cls = classNames(styles.rangeInputNumber, className)

        return (
            <div className={cls} style={{...style}}>
                <InputNumber
                    {...otherProps}
                    {...startInputNumberOption}
                    value={value[0]}
                    defaultValue={null}
                    onChange={this.startOnChange}
                />
                <span className={styles.sp}>~</span>
                <InputNumber
                    {...otherProps}
                    {...endInputNumberOption}
                    value={value[1]}
                    defaultValue={null}
                    onChange={this.endOnChange}
                />
            </div>
        )
    }
}
