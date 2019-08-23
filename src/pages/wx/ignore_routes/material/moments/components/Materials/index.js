import React, {Fragment, Component} from 'react'
import moment from 'moment'
import router from 'umi/router'
import _ from 'lodash'
import {Icon, Spin, Button, Popconfirm} from 'antd'
import {
    AutoSizer, Masonry,
    createMasonryCellPositioner as createCellPositioner, CellMeasurer, CellMeasurerCache,
    WindowScroller,
} from 'react-virtualized'
import PositionCache from 'react-virtualized/dist/es/Masonry/PositionCache'
import {urlSafeBase64Decode} from "qiniu-js/src/base64"
import 'react-virtualized/styles.css'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import createFaceHtml from 'components/Face/createFaceHtml'
import ImagePreview from 'components/business/ImagePreview'
import VideoPreview from 'components/business/VideoPreview'
import Ellipsis from 'components/Ellipsis'

import styles from './index.scss'

const {DefaultImage} = config

export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            imageUrl: '',
            videoSource: '',
            imageVisible: false,
            videoVisible: false,
        }

        this.columnCount = 0

        this.measureCache = new CellMeasurerCache({
            defaultWidth: this.props.columnWidth,
            fixedWidth: true,
        })

        this.calculateColumnCount()
        this.initCellPositioner()
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if((prevProps.clearAll !== this.props.clearAll) && prevProps.clearAll) {
            if(this.masonry) {
                // console.log('masonry')
                this.resetList()
            }
        }
    }

    componentWillUnmount() {
    }

    handleShowVideoPreview = (item) => {
        const videoSource = item.content[0]
        const contentWatermark = item.content_watermark
        let videoWatermarkContent = ''
        if (Array.isArray(contentWatermark) && contentWatermark.length) {
            const watermark = contentWatermark[0]
            const watermarkContent = helper.utf8Decode(urlSafeBase64Decode(watermark.text_base64))
            videoWatermarkContent = `视频水印内容：${watermarkContent}`
        }
        this.setState({
            videoVisible: true,
            videoSource: videoSource,
            videoWatermarkContent: videoWatermarkContent,
        })
    }

    handleHideVideoPreview = () => {
        this.setState({
            videoVisible: false,
            videoSource: '',
        })
    }

    handleShowImagePreview = (url, item, idx) => {
        url = this.getWatermarkedImageUrl(url, item, idx)
        this.setState({
            imageVisible: true,
            imageUrl: url,
        })
    }

    getWatermarkedImageUrl = (url, item, idx) => {
        const contentWatermark = item.content_watermark
        if (Array.isArray(contentWatermark) && contentWatermark.length) {
            const watermark = contentWatermark.find((item, index) => {
                let key = helper.getUrlKey(item.url)
                return url.indexOf(key) !== -1 && idx === index
            })
            if (watermark) {
                const policy = watermark.policy
                if (policy) {
                    url = helper.getPolicyUrl(watermark.url, policy)
                }
            }
        }
        return url
    }

    handleHideImagePreview = () => {
        this.setState({
            imageVisible: false,
            imageUrl: '',
        })
    }



    getCover = (type, url) => {
        if(url) {
            switch(type) {
                case 'photo':
                    return helper.getThumbLimit(url, 512)
                case 'video':
                    return helper.getVideoCover(url)
                default:
                    return url
            }
        }
    }

    isImage = (type) => {
        return type === 'photo'
    }

    isVideo = (type) => {
        return type === 'video'
    }

    isArticle = (type) => {
        return type === 'article'
    }

    measureCacheRemoveIndex = (index) => {
        const measureCache = this.measureCache
        const len = measureCache._rowCount
        for(let i = index + 1; i < len; i++) {
            measureCache._cellHeightCache[measureCache._keyMapper(i - 1, 0)] = measureCache._cellHeightCache[measureCache._keyMapper(i, 0)]
            measureCache._cellWidthCache[measureCache._keyMapper(i - 1, 0)] = measureCache._cellWidthCache[measureCache._keyMapper(i, 0)]
            measureCache._rowHeightCache[measureCache._keyMapper(i - 1, 0)] = measureCache._rowHeightCache[measureCache._keyMapper(i, 0)]
        }
        measureCache._rowCount = measureCache._rowCount - 1
        delete measureCache._cellHeightCache[measureCache._keyMapper(measureCache._rowCount, 0)]
        delete measureCache._cellWidthCache[measureCache._keyMapper(measureCache._rowCount, 0)]
        delete measureCache._rowHeightCache[measureCache._keyMapper(measureCache._rowCount, 0)]
    }

    masonryReset = () => {
        const masonry = this.masonry
        const stopIndex = masonry._positionCache.count - 2
        masonry._positionCache = new PositionCache()
        masonry._populatePositionCache(0, stopIndex)
        masonry.forceUpdate()
    }

    removeIndex = (index) => {
        this.measureCacheRemoveIndex(index)
        this.resetCellPositioner()
        this.masonryReset()
    }

    calculateColumnCount = () => {
        const {columnWidth, gutterSize} = this.props
        this.columnCount = Math.floor(this.width / (columnWidth + gutterSize))
    }

    cellRenderer = ({index, isScrolling, key, parent, style}) => {
        const {list, columnWidth, removeLoading, onRemove} = this.props
        const item = list[index]

        if(item) {
            const type = item.content_type
            const content = item.content

            return (
                <CellMeasurer
                    cache={this.measureCache}
                    key={key}
                    parent={parent}
                    index={index}
                >
                    <div className={styles.box} key={item.id} style={{
                        ...style,
                        width: columnWidth,
                    }}>
                        {
                            item.content_desc ? (
                                <Ellipsis
                                    className={styles.ellipsis}
                                    lines={10}
                                >
                                    {
                                        createFaceHtml({
                                            tagName: 'pre',
                                            tagProps: {className: styles.content},
                                            values: item.content_desc,
                                        })
                                    }
                                </Ellipsis>
                            ) : null
                        }
                        {
                            this.isVideo(type) ? (
                                <div className={styles.media}>
                                    <img className={styles.cover}
                                        src={this.getCover('video', content[0])}
                                        onError={(e) => {
                                            e.target.src = DefaultImage
                                        }}
                                        alt=""
                                    />
                                    <div className={styles.play}
                                        onClick={() => {
                                            this.handleShowVideoPreview(item)
                                        }}/>
                                </div>
                            ) : (
                                this.isImage(type) ? (
                                    <div
                                        className={`${styles.photos} ${content.length === 1 ? styles.one : styles.three}`}>
                                        {
                                            content.map((v, idx) => {
                                                return <img key={idx}
                                                    className={styles.photo}
                                                    src={this.getCover('photo', v)}
                                                    onClick={() => {
                                                        this.handleShowImagePreview(v, item, idx)
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = DefaultImage
                                                    }}
                                                    alt=""
                                                />
                                            })
                                        }
                                    </div>
                                ) : (
                                    this.isArticle(type) ? (
                                        <div className={styles.media}>
                                            <div className={styles.article}>
                                                <img className={styles.cover}
                                                    src={item.cover}
                                                    rel="no-referrer"
                                                    alt="文章封面"
                                                    onError={(e) => {
                                                        e.target.src = DefaultImage
                                                    }}
                                                />
                                                {item.title}
                                            </div>
                                        </div>
                                    ) : null
                                )
                            )
                        }
                        <div className={styles.info}>
                            <div className={styles.row}>
                                <span className={styles.creator}>创建人：{item.nickname}</span>
                                {
                                    item.is_operable ? <span className={styles.operation}>
                                        <Popconfirm placement="bottomRight" title="确定要删除该素材？"
                                            onConfirm={() => {
                                                onRemove(item.id, index)
                                            }} okText="确定" cancelText="取消">
                                            <Icon type={removeLoading ? "loading" : "delete"}
                                                className={styles.delete}/>
                                        </Popconfirm>
                                    </span> : null
                                }
                            </div>
                            <div className={styles.meta}>
                                <span
                                    className={styles.time}>{moment(item.create_time * 1000).format('YYYY/MM/DD HH:mm')}</span>
                            </div>
                            <Button type="primary"
                                className={styles.share}
                                onClick={() => {
                                    this.handleShare(item.id)
                                }}
                            >分享至朋友圈</Button>
                        </div>
                    </div>
                </CellMeasurer>
            )
        }
        return null
    }

    initCellPositioner = () => {
        if(typeof this.cellPositioner === 'undefined') {

            const {columnWidth, gutterSize} = this.props

            this.cellPositioner = createCellPositioner({
                cellMeasurerCache: this.measureCache,
                columnCount: this.columnCount,
                columnWidth,
                spacer: gutterSize,
            })
        }
    }

    onResize = ({width}) => {
        this.width = width

        this.calculateColumnCount()
        this.resetCellPositioner()
        this.masonry.recomputeCellPositions()
    }

    renderAutoSizer = ({height}) => {
        this.height = height

        const {
            list,
            loading,
            clearAll,
            overscanByPixels,
            windowScrollerEnabled,
            scrollingResetTimeInterval,
        } = this.props

        // this.calculateColumnCount()
        // this.initCellPositioner()

        return (
            <Fragment>
                <AutoSizer
                    disableHeight
                    height={height}
                    onResize={this.onResize}
                    scrollTop={this.scrollTop}
                    overscanByPixels={overscanByPixels}
                >
                    {({width}) => {
                        this.width = width

                        return <Masonry
                            autoHeight={windowScrollerEnabled}
                            className={styles.boxes}
                            cellCount={list.length}
                            cellMeasurerCache={this.measureCache}
                            cellPositioner={this.cellPositioner}
                            cellRenderer={this.cellRenderer}
                            height={windowScrollerEnabled ? this.height : this.props.height}
                            width={width}
                            overscanByPixels={overscanByPixels}
                            ref={this.setMasonryRef}
                            onScroll={this.onScroll}
                            scrollingResetTimeInterval={scrollingResetTimeInterval}
                        />
                    }}
                </AutoSizer>
                {loading && !clearAll ? <div className={styles.loadingWrap}>
                    <Icon type="loading"/>
                </div> : null}
            </Fragment>
        )
    }

    resetList = () => {
        this.measureCache.clearAll()
        this.resetCellPositioner()
        this.masonry.clearCellPositions()
    }

    resetCellPositioner = () => {
        const {columnWidth, gutterSize} = this.props
        this.cellPositioner.reset({
            columnCount: this.columnCount,
            columnWidth,
            spacer: gutterSize,
        })
    }

    setMasonryRef = (ref) => {
        this.masonry = ref
    }

    onScroll = ({clientHeight, scrollHeight, scrollTop}) => {
        this.scrollTop = scrollTop
        const {overscanByPixels} = this.props
        if((clientHeight + scrollTop) >= (scrollHeight - overscanByPixels)) {
            this.props.onScrollEnd()
        }
    }

    handleShare = (id) => {
        router.push({
            pathname: '/wx/automatic/moments/create',
            query: {
                material: id,
            },
        })
    }

    render() {
        const {
            loading,
            list,
            height,
            clearAll,
            overscanByPixels,
            windowScrollerEnabled,
        } = this.props
        const {imageUrl, videoSource, videoWatermarkContent, imageVisible, videoVisible} = this.state

        return (
            <Spin spinning={loading && clearAll} style={{width: '100%'}}>
                {
                    list.length ? <div className={styles.materials}>
                        {
                            windowScrollerEnabled ? <WindowScroller overscanByPixels={overscanByPixels}>
                                {this.renderAutoSizer}
                            </WindowScroller> : this.renderAutoSizer({height})
                        }
                        <ImagePreview visible={imageVisible}
                            imageUrl={imageUrl}
                            onCancel={this.handleHideImagePreview}
                        />
                        <VideoPreview visible={videoVisible}
                            source={videoSource}
                            extra={videoWatermarkContent}
                            onCancel={this.handleHideVideoPreview}
                        />
                    </div>
                        : null
                }
                {
                    !list.length && !loading ? <div className={styles.empty}>暂无数据</div> : null
                }
            </Spin>
        )
    }
}
