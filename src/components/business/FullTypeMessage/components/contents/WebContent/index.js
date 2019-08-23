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
    message,
    Input,
    notification,
    Icon,
} from 'antd'
import PropTypes from "prop-types"
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'
import {initValidator, validate, validateAll, getErrorMessage} from 'utils/formTools'
import LibModalWarp from 'business/FullTypeMessage/components/LibModalWarp'
import AddBlock from '../../AddBlock'
import {getThumbLimit, parseWxMessage, setStateFromProps} from '../../../utils'
import EllipsisPopover from 'components/EllipsisPopover'
import QiniuUpload from 'components/QiniuUpload'
import safeSetStateDecorator from 'hoc/safeSetState'
import _ from "lodash"
import {
    webMaxSize,
    webType,
    sourceTypeMap,
    sourceTypeArray,
    setInitSource,
} from "components/business/FullTypeMessage/constant"
import ImgBlock from "components/business/FullTypeMessage/components/ImgBlock"
import WxToTaoLibModalWarp from '../../../components/WxToTaoLibModalWarp'
import numeral from "numeral"

const FormItem = Form.Item

function setValues(values) {
    const newValues = Object.assign({}, values)

    return newValues
}

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
                wxToTaoLibOption: tabProps.wxToTaoLibOption || contextProps.wxToTaoLibOption,
                wxToTaoLibModalOption: tabProps.wxToTaoLibModalOption || contextProps.wxToTaoLibModalOption,
            },
        }
    },
})
@safeSetStateDecorator()
export default class WebContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        wxToTaoLibOption: PropTypes.object,
        wxToTaoLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            title: PropTypes.string.isRequired,//标题
            des: PropTypes.string.isRequired,//摘要
            url: PropTypes.string.isRequired,//链接url
            thumb_url: PropTypes.string.isRequired,//缩略图
        }),
        getThumbLimit: PropTypes.func,
        articlesExtract: PropTypes.func.isRequired,
        sourceType: PropTypes.oneOf(sourceTypeArray),
    }

    static defaultProps = {
        getThumbLimit,
        articlesExtract: async (params = {}) => {
            try {
                const api = require('common/api/media').default
                const {request} = require('utils')
                const {data} = await request(api.articlesExtract.url, {
                    method: api.articlesExtract.type,
                    body: params.body,
                })

                if (data) {
                    return data
                }else {
                    throw new Error('请求错误')
                }
            }catch (e) {
                message.error('请求错误')
            }
        },
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
        wxToTaoLibOption: {
            load: async (params) => {
                try {
                    const api = require('common/api/goods').default
                    const {request} = require('utils')
                    const qs = require('qs')

                    const {data} = await request(`${api.getGoodsList.url}?${qs.stringify(params)}`)
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
            values: {
                title: '',
                des: '',
                url: '',
                thumb_url: '',
            },
            fileList: [],
            uploading: false,
            saveLib: false,
            articlesExtractLoading: false,
            ...setInitSource(props),
        }

        this.lastArticlesExtract = null

        this.uploadRef = React.createRef()
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
            title: (rule, value, callback, source, options) => {
                const len = value.length

                if (len === 0) {
                    callback('必填')
                }else if (len > 40) {
                    callback(`限制40字`)
                }else {
                    callback()
                }
            },
            des: (rule, value, callback, source, options) => {
                const len = value.length

                if (len === 0) {
                    callback('必填')
                }else if (len > 100) {
                    callback(`限制100字`)
                }else {
                    callback()
                }
            },
            url: (rule, value, callback, source, options) => {
                if (this.isWxToTaoSourceType()) {
                    callback()
                    return
                }

                const len = value.length
                if (len === 0) {
                    callback('必填')
                }else {
                    callback()
                }
            },
            thumb_url: (rule, value, callback, source, options) => {
                if (!value) {
                    callback('必填')
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

        return {
            values: newValues,
            sourceData,
            sourceType,
        }
    }

    handleUrlBlur = async () => {
        const {
            formStates,
            values,
            sourceType,
        } = this.state
        if (sourceType === sourceTypeMap.USER && (!formStates.url.validateStatus) && (this.lastArticlesExtract !== values.url)) {
            try {
                this.lastArticlesExtract = values.url
                this.setState({
                    articlesExtractLoading: true,
                })
                const data = await this.props.articlesExtract({
                    body: {
                        url: values.url,
                    },
                })
                if (data && (sourceType === sourceTypeMap.USER)) {
                    this.setState({
                        values: {
                            title: data.title || values.title,
                            thumb_url: data.cover ||values.thumb_url,
                            des: data.desc || values.des,
                            url: values.url,
                        },
                    })
                }
            }catch (e) {

            }finally {
                this.setState({
                    articlesExtractLoading: false,
                })
            }
        }
    }

    showSaveLib = () => {
        return sourceTypeMap.MATERIAL_LIB !== this.state.sourceType && !this.isWxToTaoSourceType()
    }

    isWxToTaoSourceType = () => {
        return sourceTypeMap.WX_TO_TAO === this.state.sourceType
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

    onValuesChange = (newFormData, user = true) => {
        const newState = {
            values: Object.assign({}, this.state.values, newFormData),
        }

        if (!this.isWxToTaoSourceType() && user) {
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

    getThumbLimit = (url, size) => {
        if (this.props.getThumbLimit) {
            return this.props.getThumbLimit(url, size)
        }
        return url
    }

    renderWxToTaoLibCell = ({item, columnWidth, style}) => {
        const {
            name = '',
            pic_url = '',
            price = '',
        } = item

        return (
            <div
                className={styles.wxToTaoLibCell}
            >
                <div className={styles.title}>
                    <EllipsisPopover
                        lines={2}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={name}
                    />
                </div>
                <div className={styles.content}>
                    <div className={styles.contentLeft}>
                        <EllipsisPopover
                            lines={3}
                            style={{
                                'maxWidth': '100%',
                            }}
                            content={`价格：${numeral(price / 100).format('0,0.00')}`}
                        />
                    </div>
                    <div className={styles.contentImg}>
                        <ImgBlock
                            imgSrc={this.getThumbLimit(pic_url, 62)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        const {
            title = '',
            thumb_url = '',
            des = '',
        } = _.get(item, 'mergeContent', {})

        return (
            <div
                className={styles.materialLibCell}
            >
                <div className={styles.title}>
                    <EllipsisPopover
                        lines={2}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={title}
                    />
                </div>
                <div className={styles.content}>
                    <div className={styles.contentLeft}>
                        <EllipsisPopover
                            lines={3}
                            style={{
                                'maxWidth': '100%',
                            }}
                            content={des}
                        />
                    </div>
                    <div className={styles.contentImg}>
                        <ImgBlock
                            imgSrc={this.getThumbLimit(thumb_url, 62)}
                        />
                    </div>
                </div>
            </div>
        )
    }

    materialLibOk = (checkedItem) => {
        const {
            title = '',
            thumb_url = '',
            des = '',
            url = '',
        } = _.get(checkedItem, 'mergeContent', {})
        this.resetFileList(true)

        this.lastArticlesExtract = null
        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            articlesExtractLoading: false,
            values: setValues({
                title,
                thumb_url,
                des,
                url,
            }),
        })
    }

    wxToTaoLibOk = (checkedItem) => {
        const {
            name = '',
            pic_url = '',
        } = checkedItem
        this.resetFileList(true)

        this.setState({
            sourceType: sourceTypeMap.WX_TO_TAO,
            sourceData: checkedItem,
            values: setValues({
                title: name,
                thumb_url: pic_url,
                des: '',
                url: '',
            }),
        })
    }

    getListFile = (info) => {
        const fileList = _.get(info, 'fileList')
        return fileList[fileList.length - 1]
    }

    handleChange = (info) => {
        this.setState({fileList: info.fileList})
        const fileList = this.getListFile(info)
        if (!fileList) {
            this.setState({uploading: false})
            return
        }
        if (fileList.status === 'uploading') {
            this.setState({uploading: true})
            return
        }
        if (fileList.status === 'done') {
            this.setState({uploading: false})
            this.onValuesChange({
                thumb_url: _.get(fileList, 'response.url', ''),
            })
        }
    }

    resetFileList = (clearAll = false) => {
        const {fileList} = this.state
        const upload = _.get(this, 'uploadRef.current')
        const lastIndex = fileList.length - 1
        if (upload) {
            fileList.forEach((file, index) => {
                if (index !== lastIndex) {
                    upload.handleManualRemove(file)
                }else if (clearAll) {
                    upload.handleManualRemove(file)
                }
            })
        }
    }

    uploadRemove = () => {
        this.resetFileList(true)
        this.onValuesChange({
            thumb_url: '',
        })
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const typeOk = webType.includes(file.type)

            if (!typeOk) {
                const typeStr = webType.join(',')
                notification.error({
                    message: '图片格式错误',
                    description: `仅能上传${typeStr}格式图片`,
                })
                reject(new Error(`仅能上传${typeStr}格式图片`))
            }
            const sizeOk = file.size <= 1024 * 1024 * webMaxSize
            if (!sizeOk) {
                notification.error({
                    message: '图片大小超出限制',
                    description: `图片大小不能超过${webMaxSize}`,
                })
                reject(new Error(`图片大小不能超过${webMaxSize}`))
            }

            this.resetFileList()
            resolve()
        })
    }

    conversionItem = (item) => {
        if (item) {
            const {type} = this.props
            item.parseContent = parseWxMessage({
                type,
                body: item.body,
                text: item.xml,
            })

            const {
                title = '',
                thumb_url = '',
                des = '',
                url = '',
            } = _.get(item, 'parseContent.body', {})

            item.mergeContent = {
                title: item.title || title,
                thumb_url: item.cover || thumb_url,
                des: item.desc || des,
                url: item.url || url,
            }
        }
        return item
    }

    render() {
        const {
            formStates,
            values,
            saveLib,
            fileList,
            uploading,
            articlesExtractLoading,
        } = this.state
        const {
            materialLibOption,
            materialLibModalOption,
            wxToTaoLibOption,
            wxToTaoLibModalOption,
            type,
        } = this.props

        const formItemLayout = {
            labelCol: {span: 3},
            wrapperCol: {span: 12},
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

        const wxToTaoLibModalWarp = {
            ...wxToTaoLibOption,
            columnWidth: 324,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            renderCell: this.renderWxToTaoLibCell,
            handleOk: this.wxToTaoLibOk,
        }

        const uploadButton = (
            <div className={styles.uploadWarp}>
                <Icon type="plus" className={styles.uploadBtn}/>
                <div className={styles.uploadName}>点击上传</div>
            </div>
        )

        return (
            <Row className={styles.WebContent}>
                <div className={styles.left}>
                    <div
                        className={styles.form}
                    >
                        {
                            !this.isWxToTaoSourceType() && (
                                <FormItem
                                    {...formItemLayout}
                                    validateStatus={formStates.url.validateStatus}
                                    help={formStates.url.help}
                                    required={true}
                                    label={'链接'}
                                >
                                    <Input
                                        placeholder={`请输入地址`}
                                        onChange={(e) => {
                                            this.onValuesChange({
                                                url: String(e.target.value).trim(),
                                            })
                                        }}
                                        disabled={articlesExtractLoading}
                                        value={values.url}
                                        onBlur={this.handleUrlBlur}
                                    />
                                </FormItem>
                            )
                        }
                        <FormItem
                            {...formItemLayout}
                            validateStatus={formStates.title.validateStatus}
                            help={formStates.title.help}
                            required={true}
                            label={'标题'}
                        >
                            <Input
                                placeholder={`请输入标题`}
                                onChange={(e) => {
                                    this.onValuesChange({
                                        title: String(e.target.value).trim(),
                                    })
                                }}
                                value={values.title}
                            />
                        </FormItem>
                        {
                            !this.isWxToTaoSourceType() && (
                                <FormItem
                                    {...formItemLayout}
                                    validateStatus={formStates.des.validateStatus}
                                    help={formStates.des.help}
                                    required={true}
                                    label={'描述'}
                                >
                                    <Input
                                        placeholder={`请输入描述`}
                                        onChange={(e) => {
                                            this.onValuesChange({
                                                des: String(e.target.value).trim(),
                                            })
                                        }}
                                        value={values.des}
                                    />
                                </FormItem>
                            )
                        }
                        <FormItem
                            {...formItemLayout}
                            wrapperCol={{
                                span: 18,
                            }}
                            required={true}
                            validateStatus={formStates.thumb_url.validateStatus}
                            help={formStates.thumb_url.help}
                            label={'封面图'}
                            extra={(
                                <div className={styles.extra}>
                                    建议尺寸：160×160像素；支持jpg、jpeg、png格式，图片大小不超过1MB
                                </div>
                            )}
                        >
                            <div className={styles.uploadBlock}>
                                <QiniuUpload
                                    fileList={fileList}
                                    accept={webType.join(',')}
                                    key={'qiniuUpload'}
                                    showUploadList={false}
                                    onChange={this.handleChange}
                                    beforeUpload={this.beforeUpload}
                                    multiple={false}
                                    uploadRef={this.uploadRef}
                                >
                                    {!values.thumb_url && uploadButton}
                                </QiniuUpload>
                                {
                                    values.thumb_url && (
                                        uploading ? (
                                            <div className={styles.loading}>
                                                上传中...
                                            </div>
                                        ) : (
                                            <div className={styles.show}>
                                                <div className={styles.cover}>
                                                    <div className={styles.action}>
                                                        <Icon
                                                            type="delete"
                                                            className={styles.remove}
                                                            onClick={this.uploadRemove}
                                                        />
                                                    </div>
                                                </div>
                                                <ImgBlock
                                                    imgSrc={this.getThumbLimit(values.thumb_url, 158)}
                                                />
                                            </div>
                                        )
                                    )
                                }
                            </div>
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
                </div>
                <div className={styles.right}>
                    <AddBlock
                        buttons={[
                            {
                                render: (renderBtn) => {
                                    return (
                                        <LibModalWarp
                                            conversionItem={this.conversionItem}
                                            key={'materialLib'}
                                            renderBtn={(setTrue) => {
                                                return renderBtn({
                                                    name: '从素材库选择',
                                                    onClick: setTrue,
                                                })
                                            }}
                                            {...materialLibWarpOption}
                                            modalOption={{
                                                title: '网页素材选择',
                                                ...materialLibModalOption,
                                            }}
                                        />
                                    )
                                },
                            },
                            // {
                            //     render: (renderBtn) => {
                            //         return (
                            //             <WxToTaoLibModalWarp
                            //                 key={'wxToTaoLib'}
                            //                 renderBtn={(setTrue) => {
                            //                     return renderBtn({
                            //                         name: '从微转淘',
                            //                         onClick: setTrue,
                            //                     })
                            //                 }}
                            //                 {...wxToTaoLibModalWarp}
                            //                 modalOption={{
                            //                     title: '微转淘选择',
                            //                     ...wxToTaoLibModalOption,
                            //                 }}
                            //             />
                            //         )
                            //     },
                            // },
                        ]}
                    />
                </div>
            </Row>
        )
    }
}
