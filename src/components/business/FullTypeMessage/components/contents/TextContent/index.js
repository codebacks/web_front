/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import {
    Form,
    Row,
    Checkbox,
    message, Input,
} from 'antd'
import PropTypes from "prop-types"
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'
import Editor from 'components/Face/components/Editor'
import {initValidator, validate, validateAll, getErrorMessage} from 'utils/formTools'
import LibModalWarp from 'business/FullTypeMessage/components/LibModalWarp'
import AddBlock from '../../AddBlock'
import {FaceHtml} from 'components/Face/createFaceHtml'
import {
    sourceTypeMap,
    sourceTypeArray,
    setInitSource,
} from '../../../constant'
import {
    setStateFromProps,
} from '../../../utils'
import _ from "lodash"

const FormItem = Form.Item

function setValues(values, oldValues) {
    const newValues = Object.assign({}, oldValues, values)
    newValues.content = Editor.msgToHtml(newValues.content)

    return newValues
}

const wxPlaceholder = `<好友微信昵称>`

@consumerHoc({
    mapStoreToProps: (
        {
            typeValue,
            setStoreDeep,
            assignStoreByPath,
            setStoreByPath,
            setStore,
            contextProps,
            materialLibOption,
            store: {
                tabsActiveKey,
                index,
            },
        },
        props,
    ) => {
        const tabProps = props.tabProps || {}

        return {
            ...props,
            ...tabProps,
            ...{
                contextProps,
                tabsActiveKey,
                ref: props.tabRef,
                materialLibOption: tabProps.materialLibOption || contextProps.materialLibOption,
                materialLibModalOption: tabProps.materialLibModalOption || contextProps.materialLibModalOption,
            },
        }
    },
})
export default class TextContent extends React.PureComponent {
    static propTypes = {
        maxLen: PropTypes.number,
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        useInsertWxPlaceholder: PropTypes.bool,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            content: PropTypes.string.isRequired,
        }),
        sourceType: PropTypes.oneOf(sourceTypeArray),
    }

    static defaultProps = {
        maxLen: 1500,
        useInsertWxPlaceholder: false,
        materialLibOption: {
            load: async (params) => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const qs = require('qs')

                    const {data} = await request(`${api.media.url}?${qs.stringify(params)}`)
                    if (data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch (e) {
                    message.error('请求错误')
                }
            },
            loadTags: async () => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const {data} = await request(api.tags.url)

                    if (data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch (e) {
                    message.error('请求错误')
                }
            },
        },
    }

    constructor(props) {
        super(props)
        const {validator, formStates} = this.initValidator()

        this.validator = validator

        this.state = {
            formStates,
            sourceData: {},
            values: {
                content: '',
            },
            saveLib: false,
            ...setInitSource(props),
        }

        this.inputRef = React.createRef()
    }

    static getDerivedStateFromProps(props, state) {
        let newState = null

        newState = setStateFromProps({
            name: 'values',
            preName: 'prevPropsValues',
            newState,
            props,
            state,
            setNewStateValue: (value) => {
                return setValues(value)
            },
        })

        newState = setStateFromProps({
            name: 'sourceType',
            preName: 'prevPropsSourceType',
            newState,
            props,
            state,
        })

        newState = setStateFromProps({
            name: 'sourceData',
            preName: 'prevPropsSourceData',
            newState,
            props,
            state,
        })

        return newState
    }

    initValidator = () => {
        return initValidator({
            content: (rule, value, callback, source, options) => {
                const len = Editor.computeMsgLength(value)
                const {maxLen} = this.props

                if (len === 0) {
                    callback('必填')
                }else if (len > maxLen) {
                    callback(`限制${maxLen}字`)
                }else {
                    callback()
                }
            },
        })
    }

    componentDidMount() {
        this.validate()
    }

    componentDidUpdate(prevProps, prevState) {
        this.validate(prevState.values)
        // if(prevProps.maxLen !== this.props.maxLen){
        //     this.validate({content: prevState.content})
        // }
    }

    componentWillUnmount() {

    }

    getValues = () => {
        return new Promise((resolve, reject) => {
            const {values} = this.state

            validateAll({
                validator: this.validator,
                formData: values,
                beforeValidate: (formStates) => {
                    this.setState({
                        formStates,
                    })
                },
                callback: (errors, fields, formStates) => {
                    const newValues = this.setOutputValues()

                    if (errors) {
                        reject(this.setError(errors, newValues))
                    }else {
                        resolve(newValues)
                    }

                    this.setState({
                        formStates,
                    })
                },
            })
        })
    }

    setOutputValues = () => {
        const {
            values,
            saveLib,
            sourceType,
            sourceData = {},
        } = this.state
        const newValues = Object.assign({}, values)
        if (this.showSaveLib()) {
            newValues.saveLib = saveLib
        }

        newValues.content = Editor.htmlToMsg(newValues.content)

        return {
            values: newValues,
            sourceData,
            sourceType,
        }
    }

    showSaveLib = () => {
        return sourceTypeMap.MATERIAL_LIB !== this.state.sourceType
    }

    setError = (errors, values) => {
        return {
            message: getErrorMessage(errors),
            data: {
                values,
                errors,
            },
        }
    }

    validate(oldForm) {
        const {values} = this.state
        validate({
            validator: this.validator,
            newForm: values,
            oldForm,
            beforeValidate: (formStates) => {
                this.setState({
                    formStates,
                })
            },
            callback: (errors, fields, formStates) => {
                this.setState({
                    formStates,
                })
            },
        })
    }

    onValuesChange = (newValues, source) => {
        const newState = {
            values: Object.assign({}, this.state.values, newValues),
        }

        if (Editor.Quill.sources.USER === source) {
            newState.sourceType = sourceTypeMap.USER
            newState.sourceData = {}
        }

        this.setState(newState)
    }

    handleCheckChange = (e) => {
        this.setState({
            saveLib: e.target.checked,
        })
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        return (
            <FaceHtml
                className={styles.materialLibCell}
                values={item.desc}
            />
        )
    }

    materialLibOk = (checkedItem) => {
        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                content: checkedItem.desc,
            }),
        })
    }

    handleInsertClick = (e) => {
        const getQuill = _.get(this, 'inputRef.current.getQuill')
        if (getQuill) {
            const quillRef = getQuill()
            if (quillRef) {
                quillRef.focus()
                const range = quillRef.getSelection()
                quillRef.insertText(range.index, wxPlaceholder)
                this.setState({
                    sourceType: sourceTypeMap.USER,
                    sourceData: {},
                })
            }
        }
    }

    render() {
        const {
            formStates,
            values: {
                content,
            },
            saveLib,
        } = this.state
        const {
            maxLen,
            materialLibOption,
            materialLibModalOption,
            type,
            useInsertWxPlaceholder,
        } = this.props

        const formItemLayout = {
            labelCol: {span: 0},
            wrapperCol: {span: 24},
        }

        const materialLibWarpOption = {
            ...materialLibOption,
            columnWidth: 324,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            type,
            renderCell: this.renderMaterialLibCell,
            handleOk: this.materialLibOk,
        }

        return (
            <Row className={styles.TextContent}>
                <div className={styles.left}>
                    <div>
                        <FormItem
                            {...formItemLayout}
                            validateStatus={formStates.content.validateStatus}
                            help={formStates.content.help}
                            required={true}
                        >
                            <Editor
                                ref={this.inputRef}
                                className={styles.editor}
                                placeholder={`限制${maxLen}字`}
                                disableKeyDown={true}
                                onChange={(value, _, source) => {
                                    this.onValuesChange({
                                        content: value,
                                    }, source)
                                }}
                                value={content}
                            />
                        </FormItem>
                    </div>
                    <div className={styles.onlyBar}>
                        {
                            this.showSaveLib() && (
                                <Checkbox
                                    value={saveLib}
                                    className={styles.mine}
                                    onChange={this.handleCheckChange}
                                >
                                    保存到素材库
                                </Checkbox>
                            )
                        }
                    </div>
                    {
                        useInsertWxPlaceholder && (
                            <div className={styles.insertWxName}>
                                {`插入`}
                                <span
                                    onClick={this.handleInsertClick}
                                    className={styles.wxMark}
                                >
                                    {wxPlaceholder}
                                </span>
                            </div>
                        )
                    }
                </div>
                <div className={styles.right}>
                    <AddBlock
                        buttons={[
                            {
                                render: (renderBtn) => {
                                    return (
                                        <LibModalWarp
                                            key={'materialLib'}
                                            renderBtn={(setTrue) => {
                                                return renderBtn({
                                                    name: '从素材库选择',
                                                    onClick: setTrue,
                                                })
                                            }}
                                            {...materialLibWarpOption}
                                            modalOption={{
                                                title: '文本素材选择',
                                                ...materialLibModalOption,
                                            }}
                                        />
                                    )
                                },
                            },
                        ]}
                    />
                </div>
            </Row>
        )
    }
}
