/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/12
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from "react-hot-loader"
import { Select, Form, Row, Col, message, Spin } from 'antd'
import {connect} from 'dva'
import styles from './index.less'

const Option = Select.Option
const FormItem = Form.Item

@connect(({wechats, loading}) => ({
    wechats,
}))
@hot(module)
@toggleModalWarp({
    title: '设置分组',
    width: 520,
    destroyOnClose: true,
    maskClosable: false,
})
export default class SetDivideModal extends PureComponent {
    static propTypes = {
        type: PropTypes.string.isRequired, // 'group' or 'friend' or 'wechat'
        selectedRows: PropTypes.array,
        data: PropTypes.array.isRequired,
        onOk: PropTypes.func,
    }

    static defaultProps = {
        type: '',
        selectedRows: [],
        data: [],
        onOk: () => {},
        checkWorkGroupInfo: undefined,
        checkWorkGroupLoading: false,
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedId: undefined, // 选中的option_id
        }
        props.setModalOkFn(this.handlOnOk)
    }

    componentDidMount() {}

    componentWillUnmount() {}

    handlOnOk = () => {
        const { onOk, onModalCancel , selectedRows } = this.props
        const { selectedId, } = this.state
        if(typeof selectedId === 'undefined' || !selectedRows.length) {
            message.warning('请选择分组！')
            return
        }
        onOk && onOk(selectedId, selectedRows)
        onModalCancel()
    }

    handleChange = (value) => {
        this.setState({selectedId: value})
    }

    render() {
        const { data, type, selectedRows } = this.props
        const { selectedId } = this.state


        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 14},
        }

        return (
            <div className={styles.setDivideWrap}>
                <Spin spinning={this.props.checkWorkGroupLoading}>
                    <div className={styles.top}>
                        已选择{selectedRows.length}个{type === 'group' ? '群': type === 'friend' ? '好友': type === 'wechat' ? '微信号': ''}
                        {
                            type === 'group' ? `，自动过滤 ${this.props.checkWorkGroupInfo?.count_quit || 0} 个退出群` : null
                        }
                    </div>
                    <Row>
                        <Col>
                            <FormItem{...formItemLayout} label="分组：" colon={false}>
                                <Select
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    allowClear
                                    placeholder='请选择分组'
                                    style={{width: '100%'}}
                                    onChange={this.handleChange}
                                    value={selectedId}
                                    // getPopupContainer={() => this.setDivideRef}
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
                            </FormItem>
                        </Col>
                    </Row>
                </Spin>
            </div>
        )
    }
}
