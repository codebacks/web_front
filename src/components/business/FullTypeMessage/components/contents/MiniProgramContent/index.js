/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import {
    Row,
    message,
} from 'antd'
import PropTypes from "prop-types"
import styles from './index.less'
import {consumerHoc} from 'business/FullTypeMessage/dataManagement'
import LibModalWarp from 'business/FullTypeMessage/components/LibModalWarp'
import AddBlock from '../../AddBlock'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import {
    sourceTypeMap,
    sourceTypeArray,
    setInitSource,
} from '../../../constant'
import {getThumbLimit, parseWxMessage, setStateFromProps} from '../../../utils'
import ImgBlock from "components/business/FullTypeMessage/components/ImgBlock"

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
export default class MiniProgramContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            des: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            thumb_url: PropTypes.string.isRequired,
            weappiconurl: PropTypes.string.isRequired,
            mini_program_id: PropTypes.string.isRequired,
            path: PropTypes.string,
            web_page_url: PropTypes.string,
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
                mini_program_id: '',
                path: '',
                web_page_url: '',
                title: '',
                des: '',
                thumb_url: '',
                weappiconurl: '',
            },
            ...setInitSource(props),
        }
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

    conversionItem = (item) => {
        if(item) {
            const {type} = this.props
            item.parseContent = parseWxMessage({
                type,
                body: item.body,
                text: item.xml,
            })
        }
        return item
    }

    getValues = () => {
        return new Promise((resolve, reject) => {
            const newValues = this.setOutputValues()

            if(this.isSourceTypeDefault()) {
                reject(this.setError({
                    message: '请选择内容',
                    values: newValues,
                }))
            }else {
                resolve(newValues)
            }
        })
    }

    isSourceTypeDefault = () => {
        return this.state.sourceType === sourceTypeMap.DEFAULT
    }

    setOutputValues = () => {
        const {
            values,
            sourceType,
            sourceData = {},
        } = this.state
        const newValues = Object.assign({}, values)

        return {
            values: newValues,
            sourceData,
            sourceType,
        }
    }

    getThumbLimit = (url, size) => {
        if(this.props.getThumbLimit) {
            return this.props.getThumbLimit(url, size)
        }
        return url
    }

    setError = ({message, values}) => {
        return {
            message,
            data: {
                values,
            },
        }
    }

    renderContent = ({title = '', des = '', thumb_url = '', weappiconurl = ''}) => {
        return (
            <div className={styles.content}>
                <div className={styles.titleBar}>
                    <ImgBlock
                        className={styles.avatar}
                        imgSrc={this.getThumbLimit(weappiconurl, 20)}
                    />
                    <span className={styles.title}>
                        {
                            <EllipsisPopover
                                lines={1}
                                style={{
                                    'maxWidth': '100%',
                                }}
                                content={des}
                            />
                        }
                    </span>
                </div>
                <div className={styles.des}>
                    <EllipsisPopover
                        lines={2}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={title}
                    />
                </div>
                <div className={styles.content}>
                    <ImgBlock
                        imgSrc={this.getThumbLimit(thumb_url, 208)}
                    />
                </div>
                <div className={styles.footer}>
                    <img
                        className={styles.link}
                        src={require('./images/link.svg')}
                        alt="图片"
                    />
                    小程序
                </div>
            </div>
        )
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        const body = _.get(item, 'parseContent.body', {})
        const {
            thumb_url = '',
            title = '',
            weappinfo: {
                weappiconurl = '',
            } = {},
        } = body

        return (
            <div
                className={styles.materialLibCell}
            >
                {
                    this.renderContent({
                        des: body?.appinfo?.appname ? body?.appinfo?.appname : body?.sourcedisplayname,
                        title,
                        thumb_url,
                        weappiconurl,
                    })
                }
            </div>
        )
    }

    materialLibOk = (checkedItem) => {
        const body = _.get(checkedItem, 'parseContent.body', {})
        const {
            thumb_url = '',
            title = '',
            weappinfo: {
                pagepath = '',
                weappiconurl = '',
            } = {},
        } = body

        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                path: pagepath,
                web_page_url: '',
                mini_program_id: body?.sourceusername ? body?.sourceusername : body?.weappinfo?.username,
                thumb_url,
                weappiconurl,
                des: body?.appinfo?.appname ? body?.appinfo?.appname : body?.sourcedisplayname,
                title,
            }),
        })
    }

    render() {
        const {
            values: {
                des,
                thumb_url,
                weappiconurl,
                title,
            },
        } = this.state
        const {
            materialLibOption,
            materialLibModalOption,
            type,
        } = this.props

        const materialLibWarpOption = {
            ...materialLibOption,
            columnWidth: 226,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            type,
            renderCell: this.renderMaterialLibCell,
            handleOk: this.materialLibOk,
        }

        return (
            <Row className={styles.MiniProgramContent}>
                <div className={styles.left}>
                    <div className={styles.imgBlock}>
                        {
                            this.isSourceTypeDefault() ? (
                                <img
                                    className={styles.defaultImg}
                                    src={require('./images/default.svg')}
                                    alt="图片"
                                />
                            ) : (
                                this.renderContent({
                                    des,
                                    title,
                                    thumb_url,
                                    weappiconurl,
                                })
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
                                            key={'materialLib'}
                                            conversionItem={this.conversionItem}
                                            renderBtn={(setTrue) => {
                                                return renderBtn({
                                                    name: '从素材库选择',
                                                    onClick: setTrue,
                                                })
                                            }}
                                            {...materialLibWarpOption}
                                            modalOption={{
                                                title: '小程序素材选择',
                                                width: 774,
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
