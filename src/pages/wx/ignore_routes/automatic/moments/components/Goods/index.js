import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import numeral from 'numeral'
import {Modal, Button, Icon, Input, Spin, message} from 'antd'
import {AutoSizer, List, CellMeasurerCache } from 'react-virtualized'
import _ from 'lodash'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import styles from './index.scss'

const Search = Input.Search
const overscanByPixels = 20
const {DefaultImage} = config
const imageUrl = 'https://image.yiqixuan.com/'
const itemHeight = 108
const itemWidth = 260

const mpaCodeTypeMap = {
    index: 1, // 首页
    goods: 2, // 商品页
}

@connect(({ wx_moments, loading}) => ({
    wx_moments,
    merchantLoading: loading.effects['wx_moments/getMerchant'],
    goodsLoading: loading.effects['wx_moments/goods'],
    mpaCodeLoading: loading.effects['wx_moments/getMPACode']
}))
export default class Materials extends Component {
    constructor(props) {
        super(props)
        this.state = {
            total: 0,
            limit: 18,
            offset: 0,
            status: 1, // 商品状态 1上架
            title: '',
            list: [],
            merchant: null,
            hasLoadedAll: false,
            clearAll: true,
            selectedList: [],
            codeUrls: [],
        }
        this.measureCache = new CellMeasurerCache({
            fixedWidth: true,
            fixedHeight: true,
        })
        this.counter = 0
        this.loadedCodes = []
    }

    static propTypes = {
        visible: PropTypes.bool,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    }

    static defaultProps = {
        visible: false,
        onOk: ()=>{},
        onCancel: ()=>{},
    }

    componentDidMount() {
        this._isMounted = true
        this.loadList()
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        this.setState({
            [key]: val
        })
    }

    handleSearch = () => {
        this.clearSelectedList()
        this.resetLoadParams(()=>{
            this.loadList()
        })
    }

    clearSelectedList = () => {
        this.setState({
            selectedList: []
        })
    }

    loadList = (offset=0) => {
        const query = this.getQuery()
        const page = parseInt(offset / query.per_page, 10)
        const params = {
            ...query,
            page
        }
        this.props.dispatch({
            type: 'wx_moments/goods',
            payload: {
                params: params
            },
            callback: (data) => {
                if (this._isMounted) {
                    const {limit} = this.state
                    let list = [...this.state.list]
                    let currentList = []
                    if (offset === 0) {
                        currentList = data
                    } else {
                        currentList = list.concat(data)
                    }
                    let currentOffset = offset + limit
                    let hasLoadedAll = data.length < limit
                    this.setState({
                        list: currentList,
                        offset: currentOffset,
                        hasLoadedAll: hasLoadedAll,
                        clearAll: false,
                    })
                }
            }
        })
    }

    scroll = ({ clientHeight, scrollHeight, scrollTop }) => {
        if ((clientHeight + scrollTop) >= (scrollHeight - overscanByPixels)) {
            const {goodsLoading} = this.props
            if (goodsLoading) {
                return
            }
            let {offset, hasLoadedAll} = this.state
            if (hasLoadedAll) {
                return
            }
            this.loadList(offset)
        }
    }

    handleSelect = (item) => {
        const {remainder} = this.props
        let selectedList = [...this.state.selectedList]
        const index = selectedList.findIndex((v)=>{ return v.id === item.id })
        if (index === -1) {
            // 图片总共只能有九张
            if (selectedList.length >= remainder || (!selectedList.length && !remainder)) {
                message.warning('图片最多支持九张')
                return
            }
            selectedList.push({
                ...item,
                url: helper.getMediaUrl(item)
            })
        } else {
            selectedList.splice(index, 1)
        }
        this.setState({
            selectedList: selectedList
        })
    }

    handleOk = () => {
        const selectedList = [...this.state.selectedList]

        if(!selectedList.length) {
            message.warning('请选择商品')
            return
        }
        this.generateAttachedData(selectedList)
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    getQuery = () => {
        const {title, limit, status} = this.state
        return {
            status: status,
            goods_name: title,
            per_page: limit,
        }
    }

    generateAttachedData = (selectedList) => {
        let ids = selectedList.map((v) => {
            return {
                type: mpaCodeTypeMap.goods,
                id: v.id
            }
        })
        this.loadMPACodes(ids)
    }

    loadMPACodes = (ids) => {
        const filter = ids.filter((v) => {
            const code = this.loadedCodes.find((code) => {
                if (code.type === mpaCodeTypeMap.index) {
                    return code.type === v.type
                } else if (code.type === mpaCodeTypeMap.goods) {
                    return code.id === v.id
                } else {
                    return false
                }
            })
            return !code
        })
        filter.forEach((v) => {
            this.loadMPACode(_.cloneDeep(filter), v)
        })
    }

    loadMPACode = (ids, params) => {
        const {selectedList} = this.state
        this.props.dispatch({
            type: 'wx_moments/getMPACode',
            payload: params,
            callback: (res) => {
                if (this._isMounted) {
                    if (res.status >= 200 && res.status < 300) {
                        res.json().then((res)=>{
                            if(res.url){
                                this.counter += 1
                                let index
                                if (params.id) {
                                    index = ids.findIndex((v) => {
                                        return v.id === params.id
                                    })
                                } else {
                                    index = ids.findIndex((v) => {
                                        return v.type === params.type
                                    })
                                }
                                if (index !== -1) {
                                    let item = ids[index]
                                    this.loadedCodes.push(item)
                                    item.url = res.url
                                    ids[index] = item
                                }
                                if (this.counter === selectedList.length) {
                                    const attachedData = this.loadedCodes.map((v) => {
                                        return {
                                            type: v.type,
                                            goods_id: v.id || 0,
                                            url: `${imageUrl}${v.url}`
                                        }
                                    })
                                    this.props.onOk(attachedData)
                                }
                            }
                        }).catch((err) => {})
                    }
                }
            }
        })
    }

    resetLoadParams = (callback) => {
        this.setState({
            offset: 0,
            total: 0,
            list: [],
            clearAll: true
        }, () => {
            callback && callback()
        })
    }

    getCoverUrl = (item) => {
        const url = item.cover_url
        return `${imageUrl}${url}`
    }

    renderItem = (item) => {
        return <div className={styles.media}>
            <img src={this.getCoverUrl(item)}
                className={styles.cover}
                onError={(e) => {
                    e.target.src = DefaultImage
                }}
                alt=""
            />
            <div className={styles.meta}>
                <h4 className={styles.title}>{item.name}</h4>
                <p className={styles.price}>￥{numeral(item.price / 100).format('0.00')}</p>
            </div>
        </div>
    }

    render() {
        const {visible, goodsLoading, merchantLoading, mpaCodeLoading} = this.props

        const {list, selectedList, clearAll} = this.state

        return (
            <Modal
                centered={true}
                title={<div>虎赞小店<span className={styles.subTitle}>选择要进行发圈的商品，将生成对应的二维码图</span></div>}
                visible={visible}
                width={850}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                confirmLoading={mpaCodeLoading}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <div className={styles.searchBar}>
                    <Search className={styles.formItem}
                        placeholder={`搜索商品标题`}
                        onChange={(e)=>{this.handleChange('title', e)}}
                        onSearch={this.handleSearch}
                    />
                    <Button type="primary"
                        icon="search"
                        onClick={this.handleSearch}
                    >搜索</Button>
                </div>
                <Spin spinning={(!!merchantLoading || !!goodsLoading) && clearAll}>
                    { list.length ? <AutoSizer
                        disableHeight
                    >
                        {({ width }) => {
                            const itemsPerRow = Math.floor(width / itemWidth)
                            const rowCount = itemsPerRow ? Math.ceil(list.length / itemsPerRow) : 0

                            return <List
                                ref={ref => this.list = ref}
                                className={styles.boxes}
                                width={width}
                                height={520}
                                rowHeight={itemHeight}
                                rowCount={rowCount}
                                onScroll={this.scroll}
                                scrollingResetTimeInterval={200}
                                rowRenderer={
                                    ({ index, key, parent, style})=>{
                                        const items = []

                                        const fromIndex = index * itemsPerRow
                                        const toIndex = Math.min(fromIndex + itemsPerRow, list.length)

                                        for (let i = fromIndex; i < toIndex; i++)  {
                                            const item = list[i]
                                            const selected = selectedList.find((v)=>{ return v.id === item.id})
                                            items.push(
                                                <div key={item.id}
                                                    className={styles.box}
                                                    onClick={()=>{this.handleSelect(item)}}
                                                >
                                                    {selected ? <div className={styles.selectedBlock}>
                                                        <Icon type="check-circle" className={styles.selectedIcon}/>
                                                    </div> : null}
                                                    {this.renderItem(item)}
                                                </div>
                                            )
                                        }

                                        return (
                                            <div className={styles.row} key={key} style={style}>
                                                {items}
                                            </div>
                                        )
                                    }
                                }
                            />
                        }}
                    </AutoSizer> : null
                    }
                    { !clearAll && goodsLoading ? <div className={styles.loadingWrap}>
                        <Icon type="loading"/>
                    </div> : null}
                    {(!merchantLoading && !goodsLoading) && !list.length ? <div className={styles.empty}>暂无数据</div> : null}
                </Spin>
            </Modal>
        )
    }
}
