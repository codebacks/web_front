/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/11
 */

import React from 'react'
import styles from './index.less'
import InfiniteScroller from 'components/InfiniteScroller'
import {NUM_AVATARS, NUM_IMAGES, MESSAGES} from './message'
import {hot} from "react-hot-loader"
import {Modal} from 'antd'

const confirm = Modal.confirm

let INIT_TIME = new Date().getTime()

// const height = 100

function getItem(id) {
    function pickRandom(a) {
        return a[Math.floor(Math.random() * a.length)]
    }

    return new Promise(function(resolve) {
        let item = {
            id: id,
            avatar: Math.floor(Math.random() * NUM_AVATARS),
            self: Math.random() < 0.1,
            image: Math.random() < 1.0 / 20 ? Math.floor(Math.random() * NUM_IMAGES) : '',
            time: new Date(Math.floor(INIT_TIME + id * 20 * 1000 + Math.random() * 20 * 1000)),
            message: pickRandom(MESSAGES),
        }
        if (item.image) {
            item.image = {
                src: require(`./images/image${item.image}.jpg`),
            }
        }

        // item.infiniteScrollerHeight = height

        resolve(item)
    })
}

let id = 0

class Item extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imgSrc: '',
        }
        this.itemDom = null
    }

    getDom = (node) => {
        this.itemDom = node
    }

    componentDidMount() {
        const {
            data,
        } = this.props

        if (data.image && !data.image.loaded) {
            this.image = new Image()
            this.image.src = data.image.src
            this.image.addEventListener('load', this.imgLoad)
            this.image.addEventListener('error', this.imgError)
        }
    }

    imgLoad = () => {
        const {
            data,
        } = this.props

        this.setState({
            imgSrc: data.image.src,
        }, () => {
        })
        data.loaded = true
    }

    imgError = (event) => {
        console.log(event)
    }

    componentWillUnmount() {
        if (this.image) {
            this.image.removeEventListener('load', this.imgLoad, false)
            this.image.removeEventListener('error', this.imgError, false)
            this.image.src = null
        }
    }

    editItem = (itemId, data, refresh) => {
        confirm({
            title: '编辑',
            content: `itemId: ${itemId}`,
            onOk() {
                data.message = `leoleoleoTC
                                leoleoleoTC
                                leoleoleoTC
                                leoleoleoTC
                                leoleoleoTC
                                leoleoleoTC
                `
                refresh()
            },
            onCancel() {
                console.log('Cancel')
            },
        })
    }

    render() {
        const {
            data,
            removeItem,
            itemId,
            refresh,
        } = this.props
        const {
            imgSrc,
        } = this.state

        return (
            <div
                className={`${styles.item}`}
                ref={this.getDom}
                style={{
                    // height: `${height}px`,
                    // overflow: 'hidden',
                }}
            >
                <div
                    className={styles.close}
                    onClick={() => {
                        removeItem(itemId)
                    }}
                >
                    删除
                </div>
                <div
                    className={styles.edit}
                    onClick={() => {
                        this.editItem(itemId, data, refresh)
                    }}
                >
                    编辑
                </div>
                {/*{itemId}*/}
                <img
                    className={styles.avatar}
                    width="48"
                    height="48"
                    src={require(`./images/avatar${data.avatar}.jpg`)}
                />
                <div className={styles.bubble}>
                    <p>
                        {
                            data.message
                        }
                    </p>
                    {
                        (data.loaded || imgSrc) && (
                            <img
                                width={data.image.width}
                                height={data.image.height}
                                src={data.image.src}
                            />
                        )
                    }
                    <div className={styles.meta}>
                        <time className="posted-date">
                            {
                                data.time.toString()
                            }
                        </time>
                    </div>
                </div>
            </div>
        )
    }
}

const fetchCount = 20

@hot(module)
export default class Index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
        this.initScroll = true
    }

    componentDidMount() {

    }

    scrollerItemContent = ({data, id, refresh}) => {
        return (
            <Item
                data={data}
                itemId={id}
                refresh={refresh}
                removeItem={this.removeItem}
            />
        )
    }

    onInfiniteScrollerChange = ({itemsLen, scrollDirection, firstLoadCount}) => {
        if (this.initScroll && (firstLoadCount === 0)) {
            // scrollToBottom()
            this.infiniteScrollerRef.scrollTo(10)
            this.initScroll = false
        }
    }

    removeItem = (id) => {
        this.infiniteScrollerRef.removeItem(id)
    }

    getInfiniteScrollerRef = (node) => {
        this.infiniteScrollerRef = node
    }

    infiniteScrollerRefresh = () => {
        // console.log(this.infiniteScrollerRef.findItemsId(10))
        this.initScroll = true
        this.infiniteScrollerRef.refresh()
    }

    defaultItemHeight = (data)=>{
        console.log(data)
        return 75
    }

    render() {
        return (
            <div className={styles.containerWrap}>
                <span
                    onClick={this.infiniteScrollerRefresh}
                    className={styles.refresh}
                >
                    刷新
                </span>
                <div className={styles.container}>

                    <InfiniteScroller
                        ref={this.getInfiniteScrollerRef}
                        fetchData={() => {
                            return new Promise((resolve, reject) => {
                                setTimeout(() => {
                                    let items = []
                                    for (let i = 0; i < Math.abs(fetchCount); i++) {
                                        items[i] = getItem(id++)
                                    }
                                    resolve(Promise.all(items))
                                }, 1000)
                            })
                        }}
                        useFetchLoading={true}
                        bottomFetchDistance={100}
                        disableBottomFetch={false}
                        defaultItemHeight={75}
                        // defaultItemHeight={this.defaultItemHeight}
                        runwayItems={30}
                        // runwayItemsOpposite={0}
                        onChange={this.onInfiniteScrollerChange}
                        scrollerItemContent={this.scrollerItemContent}
                        scrollOption={{
                            passive: true,
                        }}
                    />
                </div>
            </div>
        )
    }
}
