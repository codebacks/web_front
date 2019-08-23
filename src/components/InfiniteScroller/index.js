/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/15
 */
import React from 'react'
import styles from './index.less'
import Tombstone from './components/Tombstone'
import ScrollerItem from './components/ScrollerItem'
import Loading from './components/Loading'
import PropTypes from "prop-types"
import {throttleByAnimationFrame, cancelTimeout, requestTimeout} from './utils'
import ResizeObserver from 'resize-observer-polyfill'

const scrollItemResizeName = Symbol('scrollItemResizeName')
const scrollSizeName = Symbol('scrollSizeName')

export default class Index extends React.PureComponent {
    static propTypes = {
        fetchData: PropTypes.func.isRequired,
        renderLoading: PropTypes.func.isRequired,
        onChange: PropTypes.func,
        onScroll: PropTypes.func,
        renderEmpty: PropTypes.func,
        onResize: PropTypes.func,
        tombstoneOption: PropTypes.shape({
            height: PropTypes.number.isRequired,
        }).isRequired,
        topFetchDistance: PropTypes.number,
        bottomFetchDistance: PropTypes.number,
        isScrollingDebounceTimer: PropTypes.number,
        runwayItemsOpposite: PropTypes.number,
        runwayItems: PropTypes.number,
        defaultItemHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
        disableBottomFetch: PropTypes.bool,
        disableTopFetch: PropTypes.bool,
        disableScroll: PropTypes.bool,
        disableResize: PropTypes.bool,
        useFetchLoading: PropTypes.bool,
        scrollOption: PropTypes.object,
    }

    static defaultProps = {
        tombstoneOption: {
            height: 80,
        },
        renderLoading: (loading) => {
            return (
                <Loading
                    loading={loading}
                />
            )
        },
        isScrollingDebounceTimer: 150,
        topFetchDistance: 10,
        bottomFetchDistance: 10,
        defaultItemHeight: 80,
        disableBottomFetch: false,
        disableTopFetch: false,
        useFetchLoading: false,
        disableScroll: false,
        disableResize: false,
        runwayItemsOpposite: 10,
        runwayItems: 20,
    }

    constructor(props) {
        super(props)
        this.state = {
            scrollRunwayEnd: 0,
            renderItems: [],
            tombstones: [],
            fetchLoading: false,
            isScrolling: false,
        }
        this.scrollDom = null
        this.anchorItem = {index: 0, offset: 0}
        this.anchorScrollTop = 0
        this.scrollDirection = 'init'
        this.items = []
        this.resizeThrottle = throttleByAnimationFrame(this.resize)
        this.id = 0
        this.firstLoadCount = 0
        this.resetIsScrollingTimeoutId = null
        this.lastScrollDomSize = {
            width: 0,
            height: 0,
        }
    }

    componentDidMount() {
        this._mounted = true
        if (this.scrollDom) {
            this.lastScrollDomSize = this.getScrollDomSize()
            this.scrollDom.addEventListener('scroll', this.domScroll, this.props.scrollOption)
            this.resizeObserver = new ResizeObserver(entries => {
                if (!this._mounted) {
                    return
                }
                let scrollItemResizeCall = ''
                for (let entry of entries) {
                    let scrollItemResize, scrollSize
                    if ((scrollItemResize = entry.target[scrollItemResizeName])) {
                        const result = scrollItemResize(entry)
                        if (result !== '0') {
                            scrollItemResizeCall += result
                        }
                    }else if ((scrollSize = entry.target[scrollSizeName])) {
                        scrollSize()
                    }
                }

                if (scrollItemResizeCall !== '') {
                    if (scrollItemResizeCall.indexOf('2') === -1) {
                        this.onAttachContentChange()
                    }else {
                        this.attachContent()
                    }
                }
            })

            this.scrollDom[scrollSizeName] = this.resize
            this.resizeObserver.observe(this.scrollDom)
        }
        this.getData()
    }

    getScrollDomSize = () => {
        const size = {
            width: 0,
            height: 0,
        }
        if (this.scrollDom) {
            const domRect = this.scrollDom.getBoundingClientRect()
            size.width = domRect.width
            size.height = domRect.height
        }

        return size
    }

    componentWillUnmount() {
        this._mounted = false
        if (this.resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this.resetIsScrollingTimeoutId)
            this.resetIsScrollingTimeoutId = null
        }
        if (this.resizeThrottle) {
            this.resizeThrottle.cancel()
            this.resizeThrottle = null
        }
        this.scrollDom && (this.scrollDom[scrollSizeName] = null)
        if (this.resizeObserver) {
            this.resizeObserver.disconnect()
            this.resizeObserver = null
        }
        this.scrollDom && this.scrollDom.removeEventListener('scroll', this.domScroll)
        this.items = []
    }

    resetIsScrollingDebounced = () => {
        if (this.resetIsScrollingTimeoutId !== null) {
            cancelTimeout(this.resetIsScrollingTimeoutId)
        }

        this.resetIsScrollingTimeoutId = requestTimeout(
            this.resetIsScrolling,
            this.props.isScrollingDebounceTimer,
        )
    }

    resetIsScrolling = () => {
        this.resetIsScrollingTimeoutId = null

        this.setState({isScrolling: false})
    }

    domScroll = () => {
        if (this.props.disableScroll) {
            return
        }
        this.onScroll()
    }

    refresh = () => {
        const {useFetchLoading} = this.props
        if (useFetchLoading) {
            this.getData({
                type: 'init',
                afterGeData: () => {
                    this.items = []
                    this.scrollDirection = 'init'
                    this.anchorItem = {index: 0, offset: 0}
                    this.anchorScrollTop = 0
                    this.firstLoadCount = 0
                },
            })
        }else {
            this.getData({
                type: 'init',
                beforeGeData: () => {
                    this.items = []
                    this.scrollDirection = 'init'
                    this.anchorItem = {index: 0, offset: 0}
                    this.anchorScrollTop = 0
                    this.firstLoadCount = 0
                },
            })
        }
    }

    resize = () => {
        const scrollDomSize = this.getScrollDomSize()
        const lastScrollDomSize = this.lastScrollDomSize
        this.lastScrollDomSize = scrollDomSize
        if (this.props.disableResize) {
            return
        }

        if ((scrollDomSize.width !== lastScrollDomSize.width) || (scrollDomSize.height !== lastScrollDomSize.height)) {
            const onResize = this.props.onResize

            if (onResize) {
                onResize({
                    getItems: this.getItems,
                    setItems: this.setItems,
                    scrollTo: this.scrollTo,
                    getScrollDomSize: this.getScrollDomSize,
                    getNewItem: this.getNewItem,
                })
                this.fixAnchorItemIndex()
            }
            this.attachContent()
        }
    }

    setItems = (items) => {
        if (Array.isArray(items)) {
            this.items = items
        }
    }

    getItems = () => {
        return this.items.slice()
    }

    onResize = () => {
        this.resizeThrottle()
    }

    async getData({type = 'init', afterGeData, beforeGeData} = {}) {
        const {
            disableBottomFetch,
            disableTopFetch,
        } = this.props

        if (!this._mounted) {
            return
        }

        if (type === 'up' && disableTopFetch) {
            return
        }

        if (type === 'down' && disableBottomFetch) {
            return
        }

        if (this.state.fetchLoading) {
            return
        }
        this.setState({
            fetchLoading: true,
        })

        try {
            beforeGeData && beforeGeData()
            if (type === 'init') {
                this.pushTombstones(true)
                const data = await this.props.fetchData({type})
                if (this._mounted) {
                    afterGeData && afterGeData()
                    this.deletePushTombstones()
                    this.pushItems(data, true)
                }
            }else if (type === 'down') {
                this.pushTombstones()
                const data = await this.props.fetchData({type})
                if (this._mounted) {
                    afterGeData && afterGeData()
                    this.deletePushTombstones()
                    this.pushItems(data)
                }
            }else if (type === 'up') {
                this.unshiftTombstones()
                const data = await this.props.fetchData({type})
                if (this._mounted) {
                    afterGeData && afterGeData()
                    this.deleteUnshiftTombstones()
                    this.unshiftItems(data)
                }
            }
        }catch (e) {
            console.log(e)
        }finally {
            if (this._mounted) {
                this.setState({
                    fetchLoading: false,
                })
            }
        }
    }

    getNewItem = ({data}) => {
        const height = this.getDefaultItemHeight({data})

        return {
            data,
            height,
            isTombstone: false,
            id: this.id++,
            loadTime: 0,
        }
    }

    getNewTombstone = ({data = {}} = {}) => {
        return {
            data: {},
            height: this.props.tombstoneOption.height,
            isTombstone: true,
            id: this.id++,
            loadTime: 0,
        }
    }

    pushTombstones(isInit = false) {
        const {
            runwayItems,
            useFetchLoading,
        } = this.props

        if (useFetchLoading) {
            return
        }

        const items = this.items

        for (let i = 0; i < runwayItems; i++) {
            items.push(this.getNewTombstone())
        }

        isInit && (this.scrollDom.scrollTop = 0)
        this.attachContent()
    }

    deletePushTombstones() {
        const {
            runwayItems,
            useFetchLoading,
        } = this.props

        if (useFetchLoading) {
            return
        }

        const len = this.items.length
        this.items = this.items.slice(0, len - runwayItems)
    }

    unshiftTombstones() {
        const {
            runwayItems,
            useFetchLoading,
        } = this.props

        if (useFetchLoading) {
            return
        }

        const items = this.items
        let i = runwayItems

        while (i--) {
            items.unshift(this.getNewTombstone())
        }

        this.anchorItem.index += runwayItems
        this.attachContent()
    }

    fixAnchorItemIndex = () => {
        this.anchorItem.index < 0 && (this.anchorItem.index = 0)
        const max = this.items.length - 1
        this.anchorItem.index > max && (this.anchorItem.index = max)
    }

    deleteUnshiftTombstones() {
        const {
            runwayItems,
            useFetchLoading,
        } = this.props

        if (useFetchLoading) {
            return
        }

        const len = this.items.length

        this.items = this.items.slice(runwayItems, len)
        this.anchorItem.index -= runwayItems
        this.fixAnchorItemIndex()
    }

    getDefaultItemHeight = ({data}) => {
        const {defaultItemHeight} = this.props
        if (typeof defaultItemHeight === 'number') {
            return defaultItemHeight
        }else if (typeof defaultItemHeight === 'function') {
            return defaultItemHeight({data})
        }
    }

    unshiftItems(data) {
        const len = data.length
        const items = this.items

        let i = len

        while (i--) {
            const itemData = data[i]
            items.unshift(this.getNewItem({
                data: itemData,
            }))
        }

        this.anchorItem.index += len
        this.attachContent()
    }

    pushItems(data, isInit = false) {
        const len = data.length
        const items = this.items

        for (let i = 0; i < len; i++) {
            const itemData = data[i]

            items.push(this.getNewItem({
                data: itemData,
            }))
        }

        isInit && (this.scrollDom.scrollTop = 0)
        this.attachContent()
    }

    findAnchoredItem = (item, scrollTop, low = item.top) => {
        const high = item.top + item.height

        return scrollTop >= low && scrollTop < high
    }

    binarySearch = (top, low, high) => {
        const items = this.items

        while (low <= high) {
            const middle = Math.min(items.length - 1, low + Math.floor((high - low) / 2))
            const item = items[middle] || {top: 0, height: 0}
            const currentTop = item.top

            if (this.findAnchoredItem(item, top)) {
                return middle
            }else if (currentTop < top) {
                low = middle + 1
            }else if (currentTop > top) {
                high = middle - 1
            }
        }

        if (low > 0) {
            return low - 1
        }else {
            return 0
        }
    }

    binarySearchItem(initialAnchor, delta, scrollTop) {
        if (delta === 0) {
            return initialAnchor
        }

        let low, high
        const items = this.items

        if (delta < 0) {
            low = 0
            high = initialAnchor.index
        }else {
            low = initialAnchor.index
            high = items.length - 1
        }

        const index = Math.min(items.length - 1, this.binarySearch(scrollTop, low, high))
        const item = items[index] || {top: 0, height: 0}
        const top = item.top

        return {
            index: index,
            offset: scrollTop - top,
        }
    }

    calculateAnchoredItem(initialAnchor, delta) {
        if (delta === 0) {
            return initialAnchor
        }

        delta += initialAnchor.offset
        let i = initialAnchor.index
        const items = this.items

        if (delta < 0) {
            while (delta < 0 && i > 0) {
                if (items[i - 1]) {
                    delta += items[i - 1].height
                }
                i--
            }
        }else {
            while (delta > 0 && i < items.length && (items[i].height >= 0) && items[i].height < delta) {
                delta -= items[i].height
                i++
            }
        }

        return {
            index: i,
            offset: delta,
        }
    }

    scrollToBottom = () => {
        if (this.scrollDom) {
            this.scrollDom.scrollTop = this.state.scrollRunwayEnd
            this.onScroll()
        }
    }

    findItem = (cb) => {
        return this.items.find(cb)
    }

    findItemIndex = (cb) => {
        return this.items.findIndex(cb)
    }

    getItem = (index) => {
        if (index === 'last') {
            index = this.items.length - 1
        }

        return this.items[index]
    }

    setItem = (index, value) => {
        if (index === 'last') {
            index = this.items.length - 1
        }

        this.items[index] = value
    }

    removeItem = (id) => {
        const items = this.items
        const removeItemIndex = this.items.findIndex((item) => {
            return item.id === id
        })

        if (removeItemIndex > -1) {
            if (this.anchorItem.index === removeItemIndex) {
                this.anchorItem.index -= 1
                this.anchorItem.offset = 0
                this.fixAnchorItemIndex()
            }
            items.splice(removeItemIndex, 1)
            this.attachContent({
                cb: () => {
                    if (this.lessOneScreen()) {
                        this.getData({
                            type: 'down',
                        })
                    }
                },
            })
        }
    }

    lessOneScreen = () => {
        if (this.scrollDom) {
            return this.lastScrollDomSize.height > this.state.scrollRunwayEnd
        }
    }

    scrollTo = (value, type = 'index') => {
        let toTop = -1
        if (type === 'id') {
            const toItem = this.items.find((item) => {
                return item.id === value
            })

            if (toItem) {
                toTop = toItem.top
            }
        }else if (type === 'px') {
            toTop = value
        }else if (type === 'index') {
            const toItem = this.items[value]

            if (toItem) {
                toTop = toItem.top
            }
        }

        if (toTop > -1 && this.scrollDom) {
            this.scrollDom.scrollTop = toTop
            this.onScroll()
        }
    }

    onScroll = ({notFetchTop = false, cb, useBinarySearchItem = true} = {}) => {
        if (!this.scrollDom) {
            return
        }
        const scrollTop = this.scrollDom.scrollTop
        const delta = scrollTop - this.anchorScrollTop

        if (scrollTop === 0) {
            this.anchorItem = {index: 0, offset: 0}
        }else {
            this.anchorItem = useBinarySearchItem ? this.binarySearchItem(this.anchorItem, delta, scrollTop) : this.calculateAnchoredItem(this.anchorItem, delta)
        }

        this.anchorScrollTop = scrollTop
        if (delta < 0) {
            this.scrollDirection = 'up'
        }else if (delta > 0) {
            this.scrollDirection = 'down'
        }

        this.scrollContent({
            delta,
            cb: () => {
                cb && cb()
                this.fetchDown(this.anchorScrollTop)
                !notFetchTop && this.fetchTop(this.anchorScrollTop)
            },
        })
    }

    fetchDown(scrollTop) {
        if (this.props.disableBottomFetch) {
            return
        }
        if (this.scrollDirection === 'down') {
            const {
                bottomFetchDistance,
            } = this.props

            if (this.distanceBottom(scrollTop) - bottomFetchDistance <= 0) {
                this.getData({
                    type: 'down',
                })
            }
        }
    }

    fetchTop(scrollTop = this.scrollDom.scrollTop) {
        if (this.props.disableTopFetch) {
            return
        }
        if (this.scrollDirection === 'up') {
            const {
                topFetchDistance,
            } = this.props

            if (scrollTop - topFetchDistance <= 0) {
                this.getData({
                    type: 'up',
                })
            }
        }
    }

    distanceBottom(scrollTop = this.scrollDom.scrollTop) {
        return this.state.scrollRunwayEnd - (scrollTop + this.lastScrollDomSize.height)
    }

    getScrollDom = (node) => {
        this.scrollDom = node
    }

    cloneItem = (item) => {
        return Object.assign({}, item)
    }

    getFirstAttachedItemHeight = (anchorItem, item) => {
        if ((anchorItem.offset > 0) && (anchorItem.offset < item.height)) {
            return item.height - anchorItem.offset
        }else {
            anchorItem.offset = 0
            return item.height
        }
    }

    scrollContent = ({delta = 0, cb} = {}) => {
        const items = this.items
        const itemLen = items.length
        const anchorItem = this.anchorItem
        const firstAttachedItem = Math.max(0, anchorItem.index)
        const newRenderItems = []
        const newTombstones = []
        const {
            runwayItems,
            runwayItemsOpposite,
        } = this.props

        let upPreloadIndex
        let moreDownPreloadItem

        if (this.scrollDirection === 'up') {
            upPreloadIndex = Math.max(0, firstAttachedItem - runwayItems)
            moreDownPreloadItem = runwayItemsOpposite
        }else {
            upPreloadIndex = Math.max(0, firstAttachedItem - runwayItemsOpposite)
            moreDownPreloadItem = runwayItems
        }

        let item
        let i = upPreloadIndex
        const usePreload = false
        let lastScrollDomHeight = this.lastScrollDomSize.height
        let nextItemCount = moreDownPreloadItem

        while ((i < itemLen) && (nextItemCount >= 0)) {
            item = items[i]
            if (i < firstAttachedItem) {
                item.preload = usePreload
                if (item.isTombstone) {
                    newTombstones.push(item)
                }else {
                    newRenderItems.push(item)
                }
            }else {
                if (firstAttachedItem === i) {
                    lastScrollDomHeight -= this.getFirstAttachedItemHeight(anchorItem, item)
                }else {
                    lastScrollDomHeight -= item.height
                }

                if (nextItemCount === moreDownPreloadItem) {
                    item.preload = false
                    if (item.isTombstone) {
                        newTombstones.push(item)
                    }else {
                        newRenderItems.push(item)
                    }
                }else {
                    item.preload = usePreload
                    if (item.isTombstone) {
                        newTombstones.push(item)
                    }else {
                        newRenderItems.push(item)
                    }
                }

                if (item.height - lastScrollDomHeight > item.height) {
                    nextItemCount--
                }
            }

            i++
        }

        this.setState({
            renderItems: newRenderItems,
            tombstones: newTombstones,
            isScrolling: true,
        }, () => {
            this.resetIsScrollingDebounced()
            cb && cb()
            if (this.props.onScroll) {
                this.props.onScroll({
                    scrollTop: this.anchorScrollTop,
                    itemsLen: items.length,
                    scrollToBottom: this.scrollToBottom,
                    scrollDirection: this.scrollDirection,
                    scrollTo: this.scrollTo,
                })
            }
        })
    }

    onAttachContentChange = () => {
        if (this.props.onChange) {
            this.props.onChange({
                scrollTop: this.anchorScrollTop,
                itemsLen: this.items.length,
                firstLoadCount: this.firstLoadCount,
                scrollToBottom: this.scrollToBottom,
                scrollDirection: this.scrollDirection,
                scrollTo: this.scrollTo,
                scrollRunwayEnd: this.state.scrollRunwayEnd,
            })
        }
    }

    attachContent = ({cb} = {}) => {
        const items = this.items
        const itemLen = items.length
        const anchorItem = this.anchorItem
        const firstAttachedItem = Math.max(0, anchorItem.index)
        const anchorItemIndex = anchorItem.index
        const newRenderItems = []
        const newTombstones = []
        const {
            runwayItems,
            runwayItemsOpposite,
        } = this.props

        let upPreloadIndex
        let moreDownPreloadItem

        if (this.scrollDirection === 'up') {
            upPreloadIndex = Math.max(0, firstAttachedItem - runwayItems)
            moreDownPreloadItem = runwayItemsOpposite
        }else {
            upPreloadIndex = Math.max(0, firstAttachedItem - runwayItemsOpposite)
            moreDownPreloadItem = runwayItems
        }

        let item
        let i
        let newScrollRunwayEnd = 0
        let lastScrollDomHeight = this.lastScrollDomSize.height
        let nextItemCount = moreDownPreloadItem
        let itemHeight

        this.anchorScrollTop = 0
        const usePreload = true

        for (i = 0; i < itemLen; i++) {
            item = items[i]
            itemHeight = item.height

            item.top = newScrollRunwayEnd
            newScrollRunwayEnd += itemHeight

            if (i < anchorItemIndex) {
                this.anchorScrollTop += itemHeight
            }

            if (i >= upPreloadIndex && i < firstAttachedItem) {
                item.preload = usePreload
                if (item.isTombstone) {
                    newTombstones.push(item)
                }else {
                    if (item.loadTime === 0) {
                        item.loadTime++
                        this.firstLoadCount++
                    }
                    newRenderItems.push(item)
                }

            }else if (i >= firstAttachedItem) {
                if (firstAttachedItem === i) {
                    lastScrollDomHeight -= this.getFirstAttachedItemHeight(anchorItem, item)
                }else {
                    lastScrollDomHeight -= item.height
                }

                if (nextItemCount === moreDownPreloadItem) {
                    item.preload = false
                    if (item.isTombstone) {
                        newTombstones.push(item)
                    }else {
                        if (item.loadTime === 0) {
                            item.loadTime++
                            this.firstLoadCount++
                        }
                        newRenderItems.push(item)
                    }

                }else if (nextItemCount >= 0) {
                    item.preload = usePreload
                    if (item.isTombstone) {
                        newTombstones.push(item)
                    }else {
                        if (item.loadTime === 0) {
                            item.loadTime++
                            this.firstLoadCount++
                        }
                        newRenderItems.push(item)
                    }
                }

                if (item.height - lastScrollDomHeight > item.height) {
                    nextItemCount--
                }
            }
        }

        this.anchorScrollTop += anchorItem.offset

        this.setState({
            scrollRunwayEnd: newScrollRunwayEnd,
            renderItems: newRenderItems,
            tombstones: newTombstones,
        }, () => {
            this.scrollDom.scrollTop = this.anchorScrollTop
            cb && cb()
            this.onAttachContentChange()
        })
    }

    forceUpdateRenderItems = () => {
        this.setState({
            renderItems: this.state.renderItems.map((renderItem) => {
                if (renderItem.loadTime > 1) {
                    return Object.assign({}, renderItem)
                }else {
                    return renderItem
                }
            }),
        })
    }

    renderList() {
        const {renderItems = []} = this.state
        const {scrollerItemContent} = this.props

        return renderItems.map((item, i) => {
            return (
                <ScrollerItem
                    resizeObserver={this.resizeObserver}
                    scrollItemResizeName={scrollItemResizeName}
                    content={scrollerItemContent}
                    key={item.id}
                    item={item}
                    height={item.height}
                    top={item.top}
                    preload={!!item.preload}
                    infiniteScrollerInstance={this}
                />
            )
        })
    }

    renderTombstones() {
        const {tombstones = []} = this.state
        const {tombstoneOption} = this.props

        return tombstones.map((item, i) => {
            return (
                <Tombstone
                    {...tombstoneOption}
                    key={item.id}
                    item={item}
                    top={item.top}
                    hidden={!item.isTombstone}
                />
            )
        })
    }

    render() {
        const {
            scrollRunwayEnd,
            fetchLoading,
            isScrolling,
            renderItems = [],
        } = this.state
        const {
            useFetchLoading,
            renderEmpty,
            renderLoading,
        } = this.props

        return (
            <div className={styles.infiniteScrollerWarp}>
                <div
                    ref={this.getScrollDom}
                    className={styles.infiniteScroller}
                >
                    <div
                        style={{
                            position: 'relative',
                            height: `${scrollRunwayEnd}px`,
                            width: '100%',
                            pointerEvents: isScrolling ? 'none' : '',
                        }}
                    >
                        {
                            this.renderList()
                        }
                        {
                            this.renderTombstones()
                        }
                    </div>
                    {
                        !renderItems.length && renderEmpty && !fetchLoading && renderEmpty()
                    }
                </div>
                {
                    useFetchLoading && renderLoading(fetchLoading)
                }
            </div>
        )
    }
}
