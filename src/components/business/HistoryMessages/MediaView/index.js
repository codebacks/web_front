import React, {PureComponent} from 'react'
import {Empty} from 'antd'
import PropTypes from 'prop-types'
import _ from 'lodash'
import InfiniteScroller from 'components/InfiniteScroller/index'
import ImageViewer from '../ImageViewer'
import VideoViewer from '../VideoViewer'
import Loading from '../Loading'
import Image from '../Media/Image'
import Video from '../Media/Video'
import {MessageTypes, DefaultItemHeight} from '../config'
import helper from 'utils/helper'
import styles from './index.less'
import parse from 'utils/parse'

const ParseMessage = parse

const defaultHeight = 500
const itemWidth = 156
const itemPadding = 16

export default class MediaView extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.prevItemsPerRow = 0
        this.itemsPerRow = 0
    }

    static propTypes = {
        onFetch: PropTypes.func.isRequired,
        renderEmpty: PropTypes.func,
        runwayItems: PropTypes.number,
        bottomFetchDistance: PropTypes.number,
        disableBottomFetch: PropTypes.bool,
        disableTopFetch: PropTypes.bool,
        useFetchLoading: PropTypes.bool,
    }

    static defaultProps = {
        renderEmpty: ()=> <Empty/>,
        runwayItems: 10,
        bottomFetchDistance: 10,
        disableBottomFetch: false,
        disableTopFetch: true,
        useFetchLoading: true,
    }

    componentDidMount() {
    }

    onImageClick = (url, uuid) => {
        this.imageViewer.showGallery(url, uuid)
    }

    onVideoClick = (url) => {
        this.videoViewer.handlePlay(url)
    }

    getItem = (data) => {
        if(Array.isArray(data)) {
            return data.map((item) => {
                item = ParseMessage(item)
                const uuid = helper.getUniqueMessageId(item)
                if (item.type === MessageTypes.image) {
                    return <Image key={uuid} record={item} onClick={this.onImageClick}/>
                } else if (item.type === MessageTypes.video) {
                    return <Video key={uuid} record={item} onClick={this.onVideoClick}/>
                }
            })
        }
    }

    scrollerItemContent = ({data, id}) => {
        return <div key={id} className={styles.mediaItem}>
            {this.getItem(data)}
        </div>
    }

    infiniteScrollerRefresh = () => {
        this.infiniteScrollerRef.refresh()
    }

    getInfiniteScrollerRef = (node) => {
        this.infiniteScrollerRef = node
    }

    renderLoading = (loading) => {
        return <Loading loading={loading}/>
    }

    parseData = (data) => {
        const items = []
        if(this.mediaView && data.length) {
            const width = this.mediaView.clientWidth + itemPadding - 15
            this.itemsPerRow = Math.floor(width / (itemWidth + itemPadding))
            if(this.itemsPerRow) {
                for (let i = 0; i < data.length; i += this.itemsPerRow) {
                    items.push(data.slice(i, i + this.itemsPerRow))
                }
            }
        }
        return items
    }


    handleResize = ({getItems, setItems, getNewItem}) => {
        let newData = _.cloneDeep(this.props.list).reverse()
        newData = this.parseData(newData)

        if(this.itemsPerRow === this.prevItemsPerRow) {
            return
        }

        this.prevItemsPerRow = this.itemsPerRow
        const newItems = []
        newData.forEach((data) => {
            newItems.push(getNewItem({data: data}))
        })
        setItems(newItems)
    }

    render() {
        const {onFetch, renderEmpty,
            useFetchLoading, bottomFetchDistance, disableBottomFetch, disableTopFetch,
            listHeight,
            images,
        } = this.props

        return (
            <div className={styles.mediaView}
                ref={(node)=>{this.mediaView = node}}
                style={{height: listHeight || defaultHeight}}>
                <InfiniteScroller
                    ref={this.getInfiniteScrollerRef}
                    fetchData={async ({type}) => {
                        const rawData = await onFetch(type)
                        return this.parseData(rawData)
                    }}
                    defaultItemHeight={DefaultItemHeight}
                    renderEmpty={renderEmpty}
                    useFetchLoading={useFetchLoading}
                    bottomFetchDistance={bottomFetchDistance}
                    disableBottomFetch={disableBottomFetch}
                    disableTopFetch={disableTopFetch}
                    renderLoading={this.renderLoading}
                    scrollerItemContent={this.scrollerItemContent}
                    onResize={this.handleResize}
                    scrollOption={{
                        passive: true,
                    }}
                />
                <ImageViewer ref={(node)=>{this.imageViewer = node}} images={images}/>
                <VideoViewer ref={(node)=>{this.videoViewer = node}}/>
            </div>

        )
    }
}

