/**
 * @Description
 * @author XuMengPeng
 * @date 2019/3/18
 */

import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import { Form, Row, Col, TreeSelect, message, } from 'antd'
import PropTypes from "prop-types"
import {hot} from 'react-hot-loader'

const FormItem = Form.Item
const TreeNode = TreeSelect.TreeNode

@toggleModalWarp({
    title: '移动分类',
    width: 560,
    destroyOnClose: true,
    maskClosable: false,
})

@hot(module)
export default class MoveQuestionModal extends PureComponent {
    static propTypes = {
        onOk: PropTypes.func.isRequired,
        treeData: PropTypes.array.isRequired,
    }
    static defaultProps = {
        onOk: () => {},
        treeData: [],
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedValue: undefined,
        }
        props.setModalOkFn(this.handleOk)
    }

    renderTreeNodes = (treeData) => {
        if(!treeData) {
            return null
        }else{
            return treeData.map((item, index) => {
                if(item.children) {
                    return (
                        <TreeNode value={item.id} title={item.name} key={item.name} dataRef={item} >
                            {this.renderTreeNodes(item.children)}
                        </TreeNode>
                    )
                }else {
                    <TreeNode value={item.id} title={item.name} key={item.name} dataRef={item} />
                }
            })
        }
    }

    onChange = (selectedValue) => {
        this.setState({selectedValue})
    }

    handleOk = () => {
        const { onOk } = this.props
        const { selectedValue } = this.state
        if(!selectedValue) {
            message.warning('请先选择分类！')
            return
        }
        onOk && onOk(selectedValue)
        this.props.onModalCancel()
    }

    render() {
        const { treeData } = this.props
        const { selectedValue } = this.state
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
        }
        return (
            <div>
                <Row>
                    <Col span={20}>
                        <FormItem {...formItemLayout} label="分类：" colon={false}>
                            <TreeSelect
                                style={{ width: 300 }}
                                value={selectedValue}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                placeholder="请选择分类"
                                onChange={this.onChange}
                            >
                                {this.renderTreeNodes(treeData)}
                            </TreeSelect>
                        </FormItem>
                    </Col>
                </Row>
            </div>
        )
    }
}