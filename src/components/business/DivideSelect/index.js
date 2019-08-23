/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/12
*/

import React from 'react'
import PropTypes from 'prop-types'
import {Select, Spin,} from 'antd'

const Option = Select.Option

export default class DivideSelect extends React.Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        data: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }

    static defaultProps = {
        cls: '',
        placeholder: '全部分组',
        selectedId: undefined,
        data: [],
        onChange: () => {},
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}

    componentWillUnmount() {}

    handleChange = (value) => {
        this.props.onChange(value)
    }

    render() {
        const { cls, placeholder, selectedId, data } = this.props

        return (
            <div className={cls}>
                <Select
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    allowClear
                    placeholder={placeholder}
                    style={{width: '100%'}}
                    onChange={this.handleChange}
                    value={selectedId}
                >
                    {
                        data.map((item) => {
                            return <Option
                                key={item.id}
                                value={item.id}
                            >
                                {item.title}
                            </Option>
                        })
                    }
                </Select>
            </div>
        )
    }
}
