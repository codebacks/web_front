/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/2/15
 */
import React from 'react'
import styles from './index.less'
import PropTypes from "prop-types"

export default class Index extends React.PureComponent {
    static propTypes = {
        top: PropTypes.number,
        preload: PropTypes.bool,
        elementResizeDetector: PropTypes.object,
        item: PropTypes.object,
        content: PropTypes.func.isRequired,
        resizeObserver: PropTypes.object.isRequired,
        infiniteScrollerInstance: PropTypes.object.isRequired,
        scrollItemResizeName: PropTypes.symbol.isRequired,
    }

    static defaultProps = {
        top: 0,
        item: {},
    }

    constructor(props) {
        super(props)
        this.state = {}
    }

    getDomRef = (node) => {
        this.scrollerItemRef = node
    }

    onResizeObserver = (entry) => {
        return this.setHeight()
    }

    getOffsetHeight = () => {
        if (this.scrollerItemRef) {
            return this.scrollerItemRef.offsetHeight
        }

        return 0
    }

    setHeight = ({noAttachContent = true, height = this.getOffsetHeight()} = {}) => {
        if (this._mounted && this.scrollerItemRef) {
            const {height: lastHeight, item, infiniteScrollerInstance} = this.props
            let firstLoad = false
            if (item.loadTime === 1) {
                if (infiniteScrollerInstance.firstLoadCount > 0) {
                    infiniteScrollerInstance.firstLoadCount--
                }

                if (infiniteScrollerInstance.firstLoadCount === 0) {
                    firstLoad = true
                }
            }

            item.loadTime++

            if (lastHeight !== height) {
                item.isTombstone = false
                item.height = height

                !noAttachContent && infiniteScrollerInstance.attachContent()

                return '2'
            }else {
                if (firstLoad) {
                    return '1'
                }

                return '0'
            }
        }
    }

    initSize = () => {
        if (this.scrollerItemRef) {
            const {resizeObserver, scrollItemResizeName} = this.props
            this.scrollerItemRef[scrollItemResizeName] = this.onResizeObserver
            resizeObserver.observe(this.scrollerItemRef)
        }
    }

    componentDidMount() {
        this._mounted = true
        this.initSize()
    }

    refresh = () => {
        this.forceUpdate()
        // this.forceUpdate(() => {
        //     this.setHeight({noAttachContent: false})
        // })
    }

    componentWillUnmount() {
        this._mounted = false
        const {resizeObserver, scrollItemResizeName} = this.props
        if (this.scrollerItemRef && this.scrollerItemRef[scrollItemResizeName]) {
            this.scrollerItemRef[scrollItemResizeName] = null
            resizeObserver.unobserve(this.scrollerItemRef)
        }
    }

    render() {
        const {
            top,
            item,
            preload,
            content,
        } = this.props

        return (
            <div
                className={`${styles.scrollerItem}`}
                ref={this.getDomRef}
                style={{
                    position: 'absolute',
                    top,
                    left: 0,
                    opacity: preload && 0,
                    overflow: 'hidden',
                }}
            >
                {
                    content({
                        id: item.id,
                        data: item.data,
                        refresh: this.refresh,
                    })
                }
            </div>
        )
    }
}
