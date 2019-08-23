import React from 'react'
import {
    Button,
    Form,
    Input,
    Row,
    Col,
    Radio,
    message,
} from 'antd'
import styles from './index.less'
import classNames from 'classnames'
import {connect} from 'dva'
import {filterContents, categoryContents} from './constant'
import router from 'umi/router'
import _ from 'lodash'
import PreviewModel from '../PreviewModel'

const {TextArea} = Input

@connect(({crm_customerGroup, loading}) => ({
    crm_customerGroup,
    detailsLoading: loading.effects['crm_customerGroup/details'],
    createCustomerGroupsLoading: loading.effects['crm_customerGroup/createCustomerGroups'],
}))
@Form.create()
export default class extends React.PureComponent {
    constructor() {
        super()

        this.state = {
            operation: 'must',
            selectContent: [],
        }
    }

    componentDidMount() {
        const {id} = this.props
        if(id) {
            this.props.dispatch({
                type: 'crm_customerGroup/details',
                payload: {
                    id,
                },
                callback: (data) => {
                    const params = data.params
                    if(params) {
                        const {
                            setFieldsValue,
                        } = this.props.form
                        const {
                            contentObj,
                            operation,
                        } = this.getOperation(params)

                        this.setState({
                            operation: operation,
                            selectContent: this.setSelectContent(contentObj),
                        })

                        setFieldsValue({
                            name: data.name,
                            description: data.description,
                        })
                    }
                },
            })
        }
    }

    getOperation = (params) => {
        const operations = ['must', 'should']
        let contentObj = {}
        let operation = ''
        operations.forEach((key) => {
            if(params[key]) {
                contentObj = params[key]
                operation = key
            }
        })

        return {
            contentObj,
            operation,
        }
    }

    setSelectContent = (params = {}) => {
        const selectContent = []
        Object.keys(params).forEach((key) => {
            if(filterContents[key]) {
                selectContent.push({
                    id: key,
                    ...params[key],
                })
            }
        })

        return selectContent
    }

    validateFrom = (callback) => {
        this.props.form.validateFieldsAndScroll({force: true}, (err, values) => {
            if(!err) {
                const {params, validated} = this.getParams()
                if(!validated) {
                    message.error('筛选条件必须选择一项!')
                    return
                }
                const payload = {
                    params,
                    name: values.name.trim(),
                    description: values.description.trim(),
                }
                callback(payload)
            }
        })
    }

    createMass = () => {
        this.handleSubmit(null, true)
    }

    handleSubmit = (e, toMass = false) => {
        e && e.preventDefault()

        this.validateFrom((payload) => {
            const {id} = this.props
            if(id) {
                payload.id = id
                this.props.dispatch({
                    type: 'crm_customerGroup/editCustomerGroups',
                    payload,
                    callback: (data) => {
                        message.success('编辑成功')
                        if(toMass) {
                            router.push(`/crm/customers/create_mass?group_id=${data.id}`)
                        }else {
                            router.push('/crm/customer_group')
                        }
                    },
                })
            }else {
                this.props.dispatch({
                    type: 'crm_customerGroup/createCustomerGroups',
                    payload,
                    callback: (data) => {
                        message.success('创建成功')
                        if(toMass) {
                            router.push(`/crm/customers/create_mass?group_id=${data.id}`)
                        }else {
                            router.push('/crm/customer_group')
                        }
                    },
                })
            }
        })
    }

    getParams = () => {
        const {selectContent, operation} = this.state
        const params = {
            [operation]: {},
        }
        const operationObj = params[operation]
        let validated = false
        selectContent.forEach((item) => {
            if(item.values && item.values.length) {
                validated = true
                const valuesToParams = _.get(filterContents, [item.id, 'valuesToParams'])
                let values = item.values.slice()
                if(typeof valuesToParams === 'function') {
                    values = valuesToParams(values)
                }
                operationObj[item.id] = {
                    op: item.op,
                    values,
                }
            }
        })

        return {
            params,
            validated,
        }
    }

    createNewContent = (item) => {
        return {
            id: item.id,
            values: [],
            op: 'include',
        }
    }

    categoryToggle = (item) => {
        const index = this.findIndexCategory(item.id)
        const {selectContent} = this.state
        const newSelectContent = selectContent.slice()
        if(index > -1) {
            newSelectContent.splice(index, 1)
        }else {
            newSelectContent.unshift(this.createNewContent(item))
        }

        this.setState({selectContent: newSelectContent})
    }

    findIndexCategory = (id) => {
        const {selectContent = []} = this.state
        return selectContent.findIndex(item => item.id === id)
    }

    renderCategoryContents = () => {
        return categoryContents.map((category, i) => {
            return (
                <div className={styles.category} key={`${i}`}>
                    <div className={styles.categoryTitle}>
                        {category.name}
                    </div>
                    {
                        category.categoryTags.map((item, i) => {
                            const filterOption = filterContents[item.id]

                            if(filterOption) {
                                const selected = this.findIndexCategory(item.id) > -1

                                const cls = classNames(
                                    styles.categoryTag,
                                    selected && styles.categoryActiveTag,
                                )

                                return (
                                    <div
                                        className={cls}
                                        key={item.id}
                                        onClick={() => {
                                            this.categoryToggle(item)
                                        }}
                                    >
                                        {filterOption.name}
                                        {
                                            selected && (
                                                <div className={styles.categorySelect}/>
                                            )
                                        }
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            )
        })
    }

    setFilterContentStateWarp = (item, index) => {
        return (newItem) => {
            const {selectContent = []} = this.state
            const newSelectContent = selectContent.slice()
            newSelectContent[index] = newItem

            this.setState({
                selectContent: newSelectContent,
            })
        }
    }

    renderFilterContents = () => {
        const {selectContent = []} = this.state

        return selectContent.map((item, index) => {
            const filterContent = filterContents[item.id]

            if(filterContent) {
                const Content = filterContent.Content
                const contentOption = filterContent.contentOption
                const newItem = _.cloneDeep(item)
                contentOption.op = newItem.op
                contentOption.tags = newItem.values
                contentOption.item = newItem
                contentOption.setFilterContentState = this.setFilterContentStateWarp(item, index)
                contentOption.title = filterContent.name
                contentOption.categoryDelete = () => {
                    const index = this.findIndexCategory(item.id)

                    if(index > -1) {
                        const {selectContent} = this.state
                        const newSelectContent = selectContent.slice()
                        newSelectContent.splice(index, 1)
                        this.setState({selectContent: newSelectContent})
                    }
                }

                return (
                    <Content
                        {...contentOption}
                        key={item.id}
                    />
                )
            }
        })
    }

    operationChange = (e) => {
        this.setState({
            operation: e.target.value,
        })
    }

    cancel = () => {
        router.push('/crm/customer_group')
    }

    render() {
        const {
            detailsLoading,
            createCustomerGroupsLoading,
            form,
        } = this.props

        const {getFieldDecorator} = form

        const formItemLayout = {
            labelCol: {
                span: 4,
                style: {
                    width: '118px',
                },
            },
            wrapperCol: {span: 8},
        }

        const {
            operation,
        } = this.state

        return (
            <div className={styles.content}>
                <Form layout={'horizontal'} onSubmit={this.handleSubmit}>
                    <Form.Item
                        {...formItemLayout}
                        required={true}
                        label="客户分组名称"
                    >
                        {
                            getFieldDecorator('name', {
                                rules: [
                                    {
                                        required: true,
                                        message: '必填!',
                                        transform: (str) => {
                                            if(str) {
                                                return str.trim()
                                            }
                                            return str
                                        },
                                    },
                                    {
                                        max: 30,
                                        message: '限30字以内!',
                                        transform: (str) => {
                                            if(str) {
                                                return str.trim()
                                            }
                                            return str
                                        },
                                    },
                                ],
                            })(
                                <Input placeholder="请输入分组名称30字以内"/>,
                            )
                        }
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        required={true}
                        label="客户分组名称"
                    >
                        {
                            getFieldDecorator('description', {
                                rules: [
                                    {
                                        required: true,
                                        message: '必填!',
                                        transform: (str) => {
                                            if(str) {
                                                return str.trim()
                                            }
                                            return str
                                        },
                                    },
                                    {
                                        max: 200,
                                        message: '限200字以内!',
                                        transform: (str) => {
                                            if(str) {
                                                return str.trim()
                                            }
                                            return str
                                        },
                                    },
                                ],
                            })(
                                <TextArea
                                    placeholder="请输入客户分组描述，限200字以内"
                                    rows="4"
                                />,
                            )
                        }
                    </Form.Item>
                    <Form.Item
                        {...formItemLayout}
                        required={true}
                        label="自定义筛选条件"
                    >
                    </Form.Item>
                    <Row
                        className={styles.filterContent}
                        type={'flex'}
                    >
                        <Col span={12}>
                            <div className={styles.filterContentLeft}>
                                {
                                    this.renderCategoryContents()
                                }
                            </div>
                        </Col>
                        <Col span={12}>
                            <div className={styles.filterContentRight}>
                                <div className={styles.title}>
                                    条件列表
                                </div>
                                <div className={styles.topFilterBar}>
                                    筛选条件：
                                    <Radio.Group
                                        value={operation}
                                        buttonStyle="solid"
                                        onChange={this.operationChange}
                                    >
                                        <Radio.Button
                                            value="must"
                                        >
                                            且
                                        </Radio.Button>
                                        <Radio.Button
                                            value="should"
                                        >
                                            或
                                        </Radio.Button>
                                    </Radio.Group>
                                </div>
                                {
                                    this.renderFilterContents()
                                }
                            </div>
                        </Col>
                    </Row>
                    <div>
                        <Button
                            loading={detailsLoading || createCustomerGroupsLoading}
                            type="primary"
                            htmlType="submit"
                            className={styles.btn}
                        >
                            保存
                        </Button>
                        <PreviewModel
                            previewModePayload={this.previewModePayload}
                            renderBtn={(setTrue) => {
                                return (
                                    <Button
                                        loading={detailsLoading || createCustomerGroupsLoading}
                                        className={styles.btn}
                                        type="primary"
                                        onClick={() => {
                                            this.validateFrom((payload) => {
                                                this.previewModePayload = payload
                                                setTrue()
                                            })
                                        }}
                                    >
                                        预览
                                    </Button>
                                )
                            }}
                        />
                        <Button
                            loading={detailsLoading || createCustomerGroupsLoading}
                            type="primary"
                            className={styles.btn}
                            onClick={this.createMass}
                        >
                            创建群发
                        </Button>
                        <Button
                            onClick={this.cancel}
                        >
                            取消
                        </Button>
                    </div>
                </Form>
            </div>
        )
    }
}
