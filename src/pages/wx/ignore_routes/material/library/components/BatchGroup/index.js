import React, {Component} from 'react'
import {connect} from 'dva/index'
import PropTypes from 'prop-types'
import {Modal, Form, TreeSelect, Icon, message} from 'antd'
import styles from './index.scss'

const FormItem = Form.Item

@connect(({loading}) => ({
    batchGroupLoading: loading.effects['wx_material_library/batchGroup']
}))
@Form.create()
export default class BatchGroup extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    static propTypes = {
        visible: PropTypes.bool,
        ids: PropTypes.array,
        tree: PropTypes.array,
        onOK: PropTypes.func,
        onCancel: PropTypes.func
    }

    static defaultProps = {
        visible: false,
        ids: [],
        tree: [],
        onOk: ()=>{},
        onCancel: ()=>{},
    }

    componentDidMount() {

    }

    handleSubmit = (e) => {
        if (this.props.batchGroupLoading) {
            return
        }
        e.preventDefault()
        this.props.form.validateFields({force: true},(err, values) => {
            if (!err) {
                const payload = {
                    body: this.getBody(values)
                }
                this.batchGroup(payload)
            }
        })
    }

    getBody = (values) => {
        return {
            category_id: parseInt(values.category_id, 10),
            media_ids: this.props.ids
        }
    }

    batchGroup = (payload) => {
        this.props.dispatch({
            type: 'wx_material_library/batchGroup',
            payload: payload,
            callback: () => {
                message.success('批量分组成功')
                this.props.onOk()
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    validateGroup = (rule, value, callback) => {
        if (!value) {
            callback('请选择分组')
            return
        }
        callback()
    }

    parseData = (data) => {
        if (data && data.length) {
            return data.map((item) => {
                return {
                    key: item.id.toString(),
                    value: item.id.toString(),
                    title: item.name,
                    children: item.children ? this.parseData(item.children) : [],
                }
            })
        }
        return []
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const {visible, tree, batchGroupLoading} = this.props
        const {getFieldDecorator} = this.props.form

        const treeData = this.parseData(tree)

        return (
            <Modal
                maskClosable={false}
                destroyOnClose={true}
                visible={visible}
                title="移至分组"
                confirmLoading={batchGroupLoading}
                okText="保存"
                onOk={this.handleSubmit}
                onCancel={this.handleCancel}
            >
                <Form>
                    <FormItem
                        {...formItemLayout}
                        label="分组"
                    >
                        {getFieldDecorator('category_id', {
                            rules: [
                                {
                                    required: true,
                                    validator: this.validateGroup,
                                }
                            ],
                        })(
                            <TreeSelect
                                showSearch
                                allowClear
                                placeholder='请选择分组'
                                searchPlaceholder='输入搜索'
                                treeNodeFilterProp="title"
                                dropdownClassName={styles.dropDown}
                                dropdownMatchSelectWidth={true}
                                style={{width: '100%'}}
                                treeData={treeData}
                            />
                        )}
                    </FormItem>
                </Form>
            </Modal>
        )
    }
}
