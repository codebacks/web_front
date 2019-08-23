/**
 * @description 平台选择
 * @author liyan
 * @date 2018/12/19
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Select} from 'antd'
import {shopType} from '../../config'

const Option = Select.Option

export default class PlatformSelect extends Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        platform: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ),
        onChange: PropTypes.func,
    }

    static defaultProps = {
        cls: '',
        placeholder: '请选择',
        platform: undefined,
        onChange: () => {}
    };

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {

    }

    handleChange = (value, option) => {
        const name = option && option.props ? option.props.children : undefined
        this.props.onChange(value, name)
    }

    render() {
        const {cls, placeholder, platform} = this.props

        return (
            <Select placeholder={placeholder}
                value={platform}
                className={cls}
                onChange={this.handleChange}
            >
                <Option value="">全部平台</Option>
                {
                    shopType.map((item)=>{
                        return <Option value={item.value} key={item.value}>{item.name}</Option>
                    })
                }
            </Select>
        )
    }
}

