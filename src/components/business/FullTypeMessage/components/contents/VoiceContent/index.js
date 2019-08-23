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
import {parseWxMessage, setStateFromProps} from '../../../utils'

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
export default class VoiceContent extends React.PureComponent {
    static propTypes = {
        sourceData: PropTypes.object,
        materialLibOption: PropTypes.object,
        materialLibModalOption: PropTypes.object,
        values: PropTypes.shape({
            media_url: PropTypes.string.isRequired,
            title: PropTypes.string,
            duration: PropTypes.number.isRequired,
        }),
        sourceType: PropTypes.oneOf(sourceTypeArray),
    }

    static defaultProps = {
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
                media_url: '',
                duration: 0,
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

    setError = ({message, values}) => {
        return {
            message,
            data: {
                values,
            },
        }
    }

    renderContent = ({duration = 0, title = ''}) => {
        duration = (Number(duration) / 1000).toFixed(2)
        const time = `${duration}"`

        return (
            <div className={styles.content}>
                <div className={styles.timeBar}>
                    <img
                        className={styles.audio}
                        src={require('./images/audio.svg')}
                        alt="thumb_url"
                    />
                    {
                        time
                    }
                </div>
                <div className={styles.title}>
                    <EllipsisPopover
                        lines={1}
                        style={{
                            'maxWidth': '100%',
                        }}
                        content={title}
                    />
                </div>
            </div>
        )
    }

    renderMaterialLibCell = ({item, columnWidth, style}) => {
        return (
            <div
                className={styles.materialLibCell}
            >
                {
                    this.renderContent({
                        title: item.title,
                        duration: _.get(item, 'parseContent.body.duration', 0),
                    })
                }
            </div>
        )
    }

    materialLibOk = (checkedItem) => {
        this.setState({
            sourceType: sourceTypeMap.MATERIAL_LIB,
            sourceData: checkedItem,
            values: setValues({
                duration: _.get(checkedItem, 'parseContent.body.duration', 0),
                media_url: _.get(checkedItem, 'parseContent.body.media_url', ''),
                title: checkedItem.title,
            }),
        })
    }

    render() {
        const {
            values: {
                title,
                duration,
            },
        } = this.state
        const {
            materialLibOption,
            materialLibModalOption,
            type,
        } = this.props

        const materialLibWarpOption = {
            ...materialLibOption,
            columnWidth: 228,
            gutterSize: 16,
            height: 300,
            overscanByPixels: 20,
            scrollingResetTimeInterval: 200,
            type,
            renderCell: this.renderMaterialLibCell,
            handleOk: this.materialLibOk,
        }

        return (
            <Row className={styles.VoiceContent}>
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
                                    duration,
                                    title,
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
                                                title: '语音素材选择',
                                                width: 780,
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
