/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import {
    Row,
    Checkbox,
    message,
    notification,
} from 'antd'
import PropTypes from "prop-types"
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'
import LibModalWarp from 'business/FullTypeMessage/components/LibModalWarp'
import AddBlock from '../../AddBlock'
import QiniuUpload from 'components/QiniuUpload'
import ImgManager from "components/ImgManager"
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import ImgBlock from '../../ImgBlock'
import {getThumbLimit, getOriginalUrl, setStateFromProps, getFileName} from '../../../utils'
import {
    imageType,
    imageMaxSize,
    sourceTypeMap,
    sourceTypeArray,
    setInitSource,
} from '../../../constant'

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
            },
        }
    },
})
export default class PictureContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            media_url: PropTypes.string.isRequired,//图片地址
            thumb_url: PropTypes.string.isRequired,//图片缩略图
            name: PropTypes.string,//图片名称
            sub_type: PropTypes.number,//图片类型
        }),
        getThumbLimit: PropTypes.func,
        sourceType: PropTypes.oneOf(sourceTypeArray),
    }

    static defaultProps = {
        getThumbLimit,
        materialLibOption: {
            load: async (params) => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const qs = require('qs')

                    const {data} = await request(`${api.media.url}?${qs.stringify(params)}`)
                    if(data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch(e) {
                    message.error('请求错误')
                }
            },
            loadTags: async () => {
                try {
                    const api = require('common/api/media').default
                    const {request} = require('utils')
                    const {data} = await request(api.tags.url)

                    if(data) {
                        return data
                    }else {
                        throw new Error('请求错误')
                    }
                }catch(e) {
                    message.error('请求错误')
                }
            },
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            values: {
                media_url: '',
                thumb_url: '',
                name: '',
            },
            fileList: [],
            uploading: false,
            saveLib: false,
            ...setInitSource(props),
        }
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

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {

    }

    componentWillUnmount() {
    }

    getValues = () => {
        return new Promise((resolve, reject) => {
            const {values, uploading} = this.state
            const newValues = this.setOutputValues()

            if(uploading) {
                reject(this.setError({
                    message: '上传中...',
                    values: newValues,
                }))
            }else {
                if(!values.media_url) {
                    reject(this.setError({
                        message: '图片不能为空',
                        values: newValues,
                    }))
                }
                if(!values.thumb_url) {
                    reject(this.setError({
                        message: '图片缩略图不能为空',
                        values: newValues,
                    }))
                }else {
                    resolve(newValues)
                }
            }
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
        if(this.showSaveLib()) {
            newValues.saveLib = saveLib
        }

        return {
            values: newValues,
            sourceData,
            sourceType,
        }
    }

    showSaveLib = () => {
        return sourceTypeMap.MATERIAL_LIB !== this.state.sourceType
    }

    setError = ({message, values}) => {
        return {
            message,
            data: {
                values,
            },
        }
    }

    handleCheckChange = (e) => {
        this.setState({
            saveLib: e.target.checked,
        })
    }

    getThumbLimit = (url, size) => {
        if(this.props.getThumbLimit) {
            return this.props.getThumbLimit(url, size)
        }
        return url
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        const {
            title = '',
            media_url = '',
            thumb_url = '',
        } = _.get(item, 'mergeContent', {})

        return (
            <div
                className={styles.materialLibCell}
            >
                <ImgBlock
                    imgSrc={this.getThumbLimit(thumb_url || media_url, 116)}
                />
                <div className={styles.title}>
                    <EllipsisPopover
                        lines={1}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={title || '照片名称'}
                    />
                </div>
            </div>
        )
    }

    materialLibOk = (checkedItem = {}) => {
        this.resetFileList(true)

        const {
            sub_type,
        } = checkedItem

        const {
            thumb_url = '',
            title = '',
            media_url = '',

        } = _.get(checkedItem, 'mergeContent', {})

        const url = getOriginalUrl(media_url)

        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                thumb_url: thumb_url || this.getThumbLimit(url, 240),
                media_url: url,
                name: title,
                sub_type,
            }),
        })
    }

    conversionItem = (item) => {
        if(item) {
            const {
                body: {
                    thumb_url = '',
                    media_url = '',
                } = {},
                title = '',
                url = '',
            } = item

            item.mergeContent = {
                thumb_url,
                title,
                media_url: url || media_url,
            }
        }
        return item
    }

    getListFile = (info) => {
        const fileList = _.get(info, 'fileList')
        return fileList[fileList.length - 1]
    }

    getSubType = (fileList) => {
        if(fileList.type.trim() === 'image/gif') {
            return 2
        }

        return 1
    }

    handleChange = (info) => {
        this.setState({fileList: info.fileList})
        const fileList = this.getListFile(info)
        if(!fileList) {
            this.setState({uploading: false})
            return
        }
        if(fileList.status === 'uploading') {
            this.setState({uploading: true})
            return
        }
        if(fileList.status === 'done') {
            const url = _.get(fileList, 'response.url', '')

            this.setState({
                uploading: false,
                sourceType: sourceTypeMap.USER,
                sourceData: fileList,
                values: this.onValuesChange({
                    thumb_url: this.getThumbLimit(url, 240),
                    media_url: url,
                    name: getFileName(_.get(fileList, 'originFileObj.name', '')),
                    sub_type: this.getSubType(fileList),
                }),
            })
        }
    }

    onValuesChange = (newValues) => {
        return Object.assign({}, this.state.values, newValues)
    }

    resetFileList = (clearAll = false) => {
        const {fileList} = this.state
        const upload = _.get(this, 'uploadRef.current')
        const lastIndex = fileList.length - 1
        if(upload) {
            fileList.forEach((file, index) => {
                if(index !== lastIndex) {
                    upload.handleManualRemove(file)
                }else if(clearAll) {
                    upload.handleManualRemove(file)
                }
            })
        }
    }

    beforeUpload = (file) => {
        return new Promise((resolve, reject) => {
            const typeOk = imageType.includes(file.type)

            if(!typeOk) {
                const typeStr = imageType.join(',')
                notification.error({
                    message: '图片格式错误',
                    description: `仅能上传${typeStr}格式图片`,
                })
                reject(new Error(`仅能上传${typeStr}格式图片`))
            }
            const sizeOk = file.size <= 1024 * 1024 * imageMaxSize
            if(!sizeOk) {
                notification.error({
                    message: '图片大小超出限制',
                    description: `图片大小不能超过${imageMaxSize}`,
                })
                reject(new Error(`图片大小不能超过${imageMaxSize}`))
            }

            this.resetFileList()
            resolve()
        })
    }

    render() {
        const {
            values: {
                media_url,
                name,
            },
            saveLib,
            fileList,
            uploading,
        } = this.state
        const {
            materialLibOption,
            materialLibModalOption,
            type,
        } = this.props

        const materialLibWarpOption = {
            ...materialLibOption,
            columnWidth: 116,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            type,
            renderCell: this.renderMaterialLibCell,
            handleOk: this.materialLibOk,
        }

        return (
            <Row className={styles.PictureContent}>
                <div className={styles.left}>
                    <div className={styles.imgBlock}>
                        {
                            uploading ? (
                                <div className={styles.loading}>
                                    上传中...
                                </div>
                            ) : (
                                <ImgManager
                                    imgSrc={this.getThumbLimit(media_url, 200)}
                                    render={(imgSrc, imgState) => {
                                        if(imgState === 'load') {
                                            return (
                                                <img
                                                    className={styles.avatar}
                                                    src={imgSrc}
                                                    alt="图片"
                                                />
                                            )
                                        }else {
                                            return (
                                                <img
                                                    className={styles.defaultImg}
                                                    src={require('../../../images/defaultImg.svg')}
                                                    alt="图片"
                                                />
                                            )
                                        }
                                    }}
                                />
                            )
                        }
                    </div>
                    <div className={styles.imgName}>
                        <EllipsisPopover
                            lines={1}
                            style={{
                                'maxWidth': '100%',
                            }}
                            content={name || '照片名称'}
                        />
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
                                        <QiniuUpload
                                            fileList={fileList}
                                            accept={imageType.join(',')}
                                            key={'qiniuUpload'}
                                            showUploadList={false}
                                            onChange={this.handleChange}
                                            beforeUpload={this.beforeUpload}
                                            multiple={false}
                                            uploadRef={this.uploadRef}
                                        >
                                            {renderBtn({
                                                name: media_url ? '重新上传' : '上传图片',
                                            })}
                                        </QiniuUpload>
                                    )
                                },
                            },
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
                                            checkedIconClassName={styles.checkedIconClassName}
                                            {...materialLibWarpOption}
                                            modalOption={{
                                                title: '图片素材选择',
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
