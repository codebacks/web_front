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
export default class MusicContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            des: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            thumb_url: PropTypes.string.isRequired,
            music_url: PropTypes.string.isRequired,
            music_low_band_url: PropTypes.string.isRequired,
            music_low_band_data_url: PropTypes.string.isRequired,
            app_id: PropTypes.string.isRequired,
            app_name: PropTypes.string.isRequired,
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
                title: '',
                des: '',
                thumb_url: '',
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

    getThumbLimit = (url, size) => {
        if(this.props.getThumbLimit) {
            return this.props.getThumbLimit(url, size)
        }
        return url
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

    setError = ({message, values}) => {
        return {
            message,
            data: {
                values,
            },
        }
    }

    renderContent = ({title = '', des = '', thumb_url = ''}) => {
        return (
            <div className={styles.block}>
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

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        const {
            des,
            thumb_url,
            title,
        } = _.get(item, 'parseContent.body', {})

        return (
            <div
                className={styles.materialLibCell}
            >
                {
                    this.renderContent({
                        des,
                        title,
                        thumb_url,
                    })
                }
            </div>
        )
    }

    materialLibOk = (checkedItem) => {
        const {
            des = '',
            thumb_url = '',
            title = '',
            url = '',
            lowdataurl = '',
            lowurl = '',
            appinfo: {
                appname = '',
            } = {},
            attr: {
                appid = '',
            } = {},
        } = _.get(checkedItem, 'parseContent.body', {})

        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                des,
                thumb_url,
                title,
                music_url: url,
                music_low_band_url: lowurl,
                music_low_band_data_url: lowdataurl,
                app_name: appname,
                app_id: appid,
            }),
        })
    }

    render() {
        const {
            values: {
                des,
                thumb_url,
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
            <Row className={styles.MusicContent}>
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
                                                title: '音乐素材选择',
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
