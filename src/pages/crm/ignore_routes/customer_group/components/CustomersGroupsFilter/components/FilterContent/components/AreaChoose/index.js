/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/17
 */
import React, {PureComponent} from 'react'
import {
    Col,
    Row,
    Select,
} from 'antd'
import PropTypes from 'prop-types'
import styles from './index.less'
import classNames from 'classnames'
import {province as provinceData} from './data/province'
import {city as cityData} from './data/city'

const Option = Select.Option

export default class AreaChoose extends PureComponent {
    static displayName = 'leo-AreaChoose'

    static propTypes = {
        defaultValue: PropTypes.array,
        value: PropTypes.array,
        style: PropTypes.object,
        classNames: PropTypes.string,
        onChange: PropTypes.func,
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

    handleChange = (key, e) => {
        const val = e
        const {value} = this.state

        if(key === 'province') {
            if(val.key === '') {
                value[1] = {key: '', label: '未知'}
            }else {
                value[1] = {key: '0', label: '全部[城市]'}
            }

            value[0] = val
        }else if(key === 'city') {
            value[1] = val
        }

        this.onChange(value)
    }

    createProvinceOptions = () => {
        const provinceOptions = [
            <Option value="0" key="0">全部[省份]</Option>,
            <Option value="" key="-1">未知</Option>,
        ]

        provinceData.forEach((province) => {
            provinceOptions.push(
                <Option
                    key={province.id}
                    value={province.id}
                >
                    {province.name}
                </Option>,
            )
        })

        return provinceOptions
    }

    createCityOptions = (province = {}) => {
        let provinceId = province.key
        if(typeof provinceId == "undefined") {
            provinceId = ''
        }

        if(provinceId === '0') {
            return [
                <Option value="0" key="0">全部[城市]</Option>,
            ]
        }else if(provinceId === '') {
            return [
                <Option value="" key="-1">未知</Option>,
            ]
        }else {
            const cityOptions = [
                <Option value="0" key="0">全部[城市]</Option>,
                <Option value="" key="-1">未知</Option>,
            ]

            const data = cityData[provinceId] || []

            data.forEach((city) => {
                cityOptions.push(
                    <Option
                        key={city.id}
                        value={city.name}
                    >
                        {city.name}
                    </Option>,
                )
            })

            return cityOptions
        }
    }

    render() {
        let {
            style,
            className,
        } = this.props
        const {value} = this.state
        const cls = classNames(styles.areaChoose, className)

        return (
            <Row
                gutter={10}
                className={cls}
                style={{...style}}
            >
                <Col span={12}>
                    <Select
                        allowClear={false}
                        placeholder="省"
                        labelInValue
                        value={value[0]}
                        onChange={(e) => this.handleChange('province', e)}
                    >
                        {this.createProvinceOptions()}
                    </Select>
                </Col>
                <Col span={12}>
                    <Select
                        allowClear={false}
                        labelInValue
                        placeholder="市"
                        value={value[1]}
                        onChange={(e) => this.handleChange('city', e)}
                    >
                        {this.createCityOptions(value[0])}
                    </Select>
                </Col>
            </Row>
        )
    }
}
