/**
 * @description 店铺选择
 * @author liyan
 * @date 2018/12/19
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Select,} from 'antd'
import {connect} from 'dva'
import safeSetState from "hoc/safeSetState"

// import styles from './index.scss'

const Option = Select.Option

@connect(({base, crm_shops}) => ({
    base, crm_shops,
}))
@safeSetState()
export default class extends Component {
    static propTypes = {
        cls: PropTypes.string,
        placeholder: PropTypes.string,
        platform: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ),
        shopId: PropTypes.oneOfType(
            [PropTypes.string, PropTypes.number]
        ),
        onChange: PropTypes.func,
    }
    static defaultProps = {
        cls: '',
        placeholder: '请选择',
        platform: undefined,
        shopId: undefined,
        onChange: () => {}
    }
    constructor(props) {
        super(props)
        this.state = {
            shops: [],
        }
    }

    componentDidMount() {
        this.loadShops()
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.platform !== prevProps.platform) {
            this.setShops(this.props.platform)
        }
    }

    setShops = (platform) => {
        const allShops = [...this.props.crm_shops.shops]
        let shops = []
        if(platform) {
            shops = allShops.filter((v)=>{
                if (platform === -1) {
                    return v.type === 2 || v.type === 3
                }
                return v.type === platform
            })
        } else {
            shops = allShops
        }
        this.setState({
            shops: shops
        })
    }

    loadShops = () => {
        this.props.dispatch({
            type: 'crm_shops/getShopListOauth',
            payload: {},
            callback: () => {
                this.setShops(this.props.platform)
            }
        })
    }

    handleChange = (value, option) => {
        const name = option && option.props ? option.props.children : undefined
        this.props.onChange(value, name)
    }

    isMatch = (shopId) => {
        const {shops} = this.state
        return shopId === '' || shops.find((v) => {
            return v.id === shopId
        })
    }

    render() {
        const {shops} = this.state
        const {cls, placeholder, shopId} = this.props

        return (
            <div className={cls}>
                <Select
                    allowClear
                    showSearch
                    placeholder={placeholder}
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    onChange={this.handleChange}
                    value={this.isMatch(shopId) ? shopId : undefined}
                >
                    <Option value="">全部店铺</Option>
                    {
                        shops.map((item)=>{
                            return <Option key={item.id} value={item.id}>{item.name}</Option>
                        })
                    }
                </Select>
            </div>
        )
    }
}

