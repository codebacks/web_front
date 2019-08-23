import React from 'react'
import { Modal, Radio, Icon } from 'antd'
import { setSetting } from '../../../services/wechat-customer'
import styles from './index.less'
import IconAttention from '@/assets/category_icons/icon_attention.svg'

export default class Index extends React.PureComponent {

    state = {
        value: 1,
        loading: false
    }

    componentDidMount() {
        const {
            mode
        } = this.props

        this.setState({
            value: mode
        })
    }

    onOkHandler = () => {
        const mode = this.state.value
        this.setState({
            loading: true
        })
        setSetting(mode).then(() => {
            const { onOk } = this.props
            onOk && onOk(mode)
        }).catch(()=>{
            
        }).finally(() => {
            this.setState({
                loading: false
            })
        })
        
    }

    onCancelHandler = () => {
        if(!this.state.loading){
            const { onCancel } = this.props
            onCancel && onCancel()
        }
    }

    onChangeHandler = (e) => {
        this.setState({
            value: e.target.value
        })
    }

    render() {
        const {
            visiable,
        } = this.props

        return <Modal
            title = "展示设置"
            visible = {visiable}
            onOk = {this.onOkHandler}
            onCancel = {this.onCancelHandler}
            confirmLoading={ this.state.loading }
        >
            <div className={styles.setting}>
                <div className={styles.tip}>
                    <Icon component={IconAttention} style={{fontSize: '24px', verticalAlign: '-7px'}} /> 此设置更改后，将对所有用户生效
                </div>
                <Radio.Group value={this.state.value} onChange={this.onChangeHandler}>
                    <div>
                        <Radio value={1}>按订单付款统计</Radio>
                        <p>
                            按照下单且付款的订单统计维度，销售统计展示付款客户，付款订单，付款金额
                        </p>
                    </div>
                    <div>
                        <Radio value={2}>按订单成功交易统计</Radio>
                        <p>
                            按照订单完成的订单统计维度，销售统计展示成功交易客户，成功交易订单，成功交易金额
                        </p>
                    </div>
                </Radio.Group>
            </div>
        </Modal>
    }
}

