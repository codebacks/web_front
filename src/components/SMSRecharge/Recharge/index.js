import React, { Component, createRef } from 'react'
import { connect } from 'dva'
import { Modal, Button, InputNumber, Tabs, Radio, Table, Icon } from 'antd'
// import svg from '../../../assets/icons/alipay.svg'
import numeral from 'numeral'
import styles from './index.scss'
const TabPane = Tabs.TabPane



@connect(({ base }) => ({
    base
}))
class Recharge extends Component {
    constructor(props) {
        super()
        this.list = [
            {
                SMSPackage: '500元超值短信包',
                SMSNumber: 15152,
                price: 0.033,
                totalPrice: 500,
                total: 0
            },
            {
                SMSPackage: '5000元超值短信包',
                SMSNumber: 178572,
                price: 0.027,
                totalPrice: 5000,
                total: 0
            }
        ]
        this.state = {
            list: this.copy(this.list),
            smsNumber: 0,
            smsTotal: 0
        }
        this.debounce = true
        this.el = []
        this.input = createRef()
    }

    static defaultProps = {
        residue: 0
    }

    // Tab 1 input change
    onInputNumberChange = (value = 0, { SMSNumber, price, index }) => {
        if (this.debounce) {
            if (value === "") value = 0
            this.debounce = false
            const el = this.input.current
            if (value > 0) {
                this.refInputRest(el)
            }
            let list = this.state.list
            let smsNumber = 0
            let smsTotal = 0
            list[index].buyNumber = value * SMSNumber
            list[index].total = value * list[index].totalPrice
            list.forEach(i => {
                smsNumber += i.buyNumber ? i.buyNumber : 0
                smsTotal += i.total ? i.total : 0
            })
            this.setState({ list, smsNumber, smsTotal }, () => {
                setTimeout(_ => {
                    this.debounce = true
                }, 50)
            })
        }
    }

    // Tab 2 input change
    onInputChange = (value = 0) => {
        if (this.debounce) {
            this.debounce = false
            this.clearState()
            if (value === "") value = 0
            const ordinaryPrice = 0.033,
                discountsPrice = 0.027,
                astrict = 178572
            let val = 0
            value > astrict ? (val = value * discountsPrice) : (val = value * ordinaryPrice)
            this.setState({ smsNumber: value, smsTotal: val }, () => {
                setTimeout(_ => {
                    this.debounce = true
                }, 50)
            })
        }
    }
    refInputRest = el => {
        if (el && el.inputNumberRef && el.inputNumberRef.input) {
            el.inputNumberRef.input.setAttribute('value', '')
            el.inputNumberRef.onFocus()
            el.inputNumberRef.setState({
                inputValue: '',
                value: '',
                focused: false
            })
        }
    }
    clearState = () => {
        this.el.forEach(el => {
            this.refInputRest(el)
        })
        this.setState({
            list: this.copy(this.list)
        })
    }
    copy = json => {
        let copyJson = []
        try {
            copyJson = JSON.parse(JSON.stringify(json))
        } catch (e) {
            console.error(e)
        }
        return copyJson
    }
    onCancel = () => {
        let type = 1
        this.props.onCancel && this.props.onCancel(type)
    }
    onOk = () => {
        console.log(this.props)
        this.props.showRechargeResult && this.props.showRechargeResult(true)
        // this.props.onOk && this.props.onOk()
    }

    render() {
        const columns = [
            {
                title: '短信包',
                dataIndex: 'SMSPackage',
                key: 'SMSPackage',
                rowKey: 'SMSPackage'
            },
            {
                title: '包含短信（条）',
                dataIndex: 'SMSNumber',
                key: 'SMSNumber',
                rowKey: 'SMSNumber',
                render: (data) => numeral(data).format('0,0')
            },
            {
                title: '单价（元/条）',
                dataIndex: 'price',
                key: 'price',
                rowKey: 'price'
            },
            {
                title: '购买数量',
                dataIndex: 'buyNumber',
                key: 'buyNumber',
                rowKey: 'buyNumber',
                render: (data, item, index) => {
                    let { SMSNumber, price } = item
                    return (
                        <div>
                            <InputNumber
                                placeholder="请输入"
                                ref={el => (this.el[index] = el)}
                                onChange={e =>
                                    this.onInputNumberChange(e, {
                                        SMSNumber,
                                        price,
                                        index
                                    })
                                }
                                min={0}
                                step={1}
                            />
                        </div>
                    )
                }
            },
            {
                title: '总价（元）',
                dataIndex: 'total',
                key: 'total',
                rowKey: 'total',
                render: data => <span>{numeral(data).format('0,0')}</span>
            }
        ]
        const { list, smsNumber, smsTotal } = this.state
        const { visible, residue } = this.props
        // const Svg = () => ( require('../../../assets/icons/alipay.svg').default )
        // const PayIcon = (props) => (
        //     <Icon component={ Svg } {...props} />
        // )
        return (
            <Modal
                className={styles.modal_body_ctrl}
                visible={visible}
                title="购买短信"
                okText="支付"
                cancelText="取消"
                destroyOnClose={true}
                onCancel={this.onCancel}
                onOk={this.onOk}
                width={724}
            >
                <Tabs defaultActiveKey="1">
                    <TabPane tab="套餐购买" key="1">
                        <Table
                            rowKey={(record, index) => index}
                            dataSource={list}
                            columns={columns}
                            pagination={false}
                        />
                    </TabPane>
                    <TabPane tab="按条购买" key="2">
                        <p className="label_text_color_s">
                            购买数量在 17,8572条以内（含），每条单价 0.033 元；购买数量在 178,572 条以上，每条单价0.027元
                        </p>
                        <div>
                            <span className="label_text_ctrl">购买</span>
                            <InputNumber
                                min={0}
                                ref={this.input}
                                placeholder="请输入"
                                onChange={e => this.onInputChange(e)}
                                step={1}
                            />
                            <span
                                className="label_text_ctrl"
                                style={{ paddingLeft: 8 }}
                            >
                                条
                            </span>
                        </div>
                    </TabPane>
                </Tabs>
                <p className="label_text_color">
                    准备购买 <span> {smsNumber} </span> 条短信，待支付金额
                    <span> ¥{numeral(smsTotal).format('0,0.00')} </span>{' '}
                    元，购买后短信拥有条数
                    <span> {numeral(smsNumber + residue).format('0,0')} </span> 条
                </p>
                <div className="label_text_color">
                    付款方式：
                    <Radio checked={true} />
                    {/* <PayIcon /> */}
                </div>
                <br />
            </Modal>
        )
    }
}


export default Recharge
