import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import moment from 'moment'
import {Modal, Button, Icon, Input, Select, TreeSelect, Checkbox, Spin, message} from 'antd'
import {AutoSizer, List, CellMeasurerCache } from 'react-virtualized'
import _ from 'lodash'
import {FaceHtml} from 'components/Face/createFaceHtml'
import config from 'wx/common/config'
import helper from 'wx/utils/helper'
import styles from './index.scss'

const Option = Select.Option

const overscanByPixels = 20
const {DefaultImage, materialType} = config

@connect(({ wx_material_library, loading}) => ({
    wx_material_library,
    listLoading: loading.effects['wx_material_library/query'],
    tagsLoading: loading.effects['wx_material_library/tags'],
}))
export default class Materials extends Component {
    constructor(props) {
        super(props)
        this.state = {
            total: 0,
            limit: 20,
            offset: 0,
            keyword: '',
            categoryId: undefined,
            tagsData: [],
            tags: [],
            groups: [],
            onlyMine: undefined,
            list: [],
            clearAll: true,
            selectedList: [],
            itemWidth: 0,
            itemHeight: 0
        }
        this.measureCache = new CellMeasurerCache({
            fixedWidth: true,
            fixedHeight: true,
        })
    }

    static propTypes = {
        visible: PropTypes.bool,
        type: PropTypes.number,
        onOk: PropTypes.func,
        onCancel: PropTypes.func,
    }

    static defaultProps = {
        visible: false,
        type: materialType.text.type,
        onOk: ()=>{},
        onCancel: ()=>{},
    }

    componentDidMount() {
        this._isMounted = true
        this.loadTags()
        this.loadGroupTree()
        this.loadList()
        this.setItemSize()
    }

    componentWillUnmount() {
        this._isMounted = false
    }


    setItemSize = () => {
        const {type} = this.props
        let itemWidth = 0
        let itemHeight = 0
        switch (type) {
            case materialType.text.type:
            case materialType.webPage.type:
                itemWidth = 438
                itemHeight = 170
                break
            case materialType.image.type:
            case materialType.video.type:
                itemWidth = 214
                itemHeight = 232
                break
            default:
        }
        this.setState({
            itemWidth: itemWidth,
            itemHeight: itemHeight
        })
    }

    loadTags = () => {
        this.props.dispatch({
            type: 'wx_material_library/tags',
            payload: {},
            callback: (data) => {
                if (this._isMounted) {
                    this.setState({
                        tagsData: data
                    })
                }
            }
        })
    }

    getTagsOptions = () => {
        const {tagsData} = this.state
        return tagsData.map((item, index) => {
            return (
                <Option value={item} key={index}>{item}</Option>
            )
        })
    }

    loadGroupTree = () => {
        this.props.dispatch({
            type: 'wx_material_library/groups',
            payload: {},
            callback: (data) => {
                if(this._isMounted) {
                    const extraGroup = [{
                        children: [],
                        id: 0,
                        name: "未分组",
                        parent_id: 0,
                        priority: 0,
                    }]
                    const groups = extraGroup.concat(data)
                    this.setState({
                        groups: this.parseGroupTree(groups),
                    })
                }
            }
        })
    }

    parseGroupTree = (data) => {
        if(data && data.length) {
            return data.map((item) => {
                return {
                    key: item.id.toString(),
                    value: item.id.toString(),
                    title: item.name,
                    children: item.children ? this.parseGroupTree(item.children) : [],
                }
            })
        }
        return []
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

    handleTagsChange = (e) => {
        this.setState({
            tags: e,
        })
    }

    handleCheckChange = (e) => {
        const checked = e.target.checked
        this.setState({
            onlyMine: checked
        },()=> {
            this.clearSelectedList()
            this.resetLoadParams(()=>{
                this.loadList()
            })
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
        const params = {
            ...query,
            offset
        }
        this.props.dispatch({
            type: 'wx_material_library/query',
            payload: {
                params: params
            },
            callback: (data, pagination) => {
                if (this._isMounted) {
                    let list = [...this.state.list]
                    let currentList = []
                    if (offset === 0) {
                        currentList = data
                    } else {
                        currentList = list.concat(data)
                    }
                    currentList = this.parseList(this.props.type, currentList)
                    let total = pagination.rows_found
                    let currentOffset = pagination.offset + pagination.limit
                    this.setState({
                        list: currentList,
                        total: total,
                        offset: currentOffset,
                        clearAll: false
                    })
                }
            }
        })
    }

    parseList = (type, list) => {
        if(type === materialType.webPage.type) {
            list = helper.parseList(type, list).map((item)=>{
                const {
                    title = '',
                    thumb_url = '',
                    des = '',
                    url = '',
                } = _.get(item, 'body', {})

                const mergeContent = {
                    title: item.title || title,
                    thumb_url: item.cover || thumb_url,
                    des: item.desc || des,
                    url: item.url || url,
                }
                return {
                    ...item,
                    ...mergeContent
                }
            })
        }
        return list
    }

    scroll = ({ clientHeight, scrollHeight, scrollTop }) => {
        if ((clientHeight + scrollTop) >= (scrollHeight - overscanByPixels)) {
            const {listLoading} = this.props
            if (listLoading) {
                return
            }
            let {offset, total} = this.state
            if (offset < total) {
                this.loadList(offset)
            } else {
                // console.log('没有更多了')
            }
        }
    }

    handleSelect = (item) => {
        const {remainder, type} = this.props
        let selectedList = [...this.state.selectedList]
        const index = selectedList.findIndex((v)=>{ return v.id === item.id })
        if (index === -1) {
            if (type === materialType.image.type) {
                // 图片总共只能有九张
                if (selectedList.length >= remainder || (!selectedList.length && !remainder)) {
                    message.warning('图片最多支持九张')
                    return
                }
            } else {
                if (selectedList.length === 1) {
                    selectedList = []
                }
            }
            selectedList.push({
                ...item,
                url: helper.getMediaUrl(item)
            })
        } else {
            if (type === materialType.image.type) {
                selectedList.splice(index, 1)
            }
        }
        this.setState({
            selectedList: selectedList
        })
    }

    handleGroupTreeChange = (value) => {
        this.setState({
            categoryId: value
        })
    }

    handleOk = () => {
        const selectedList = [...this.state.selectedList]

        if(!selectedList.length) {
            message.warning('请选择素材')
            return
        }
        this.props.onOk(selectedList)
    }

    handleCancel = () => {
        this.props.onCancel()
    }

    getQuery = () => {
        const {keyword, tags, categoryId, onlyMine, limit} = this.state
        const {type} = this.props
        const subType = type === materialType.image.type ? {sub_type: 1} : {}
        return {
            type: type,
            tags: tags,
            keyword: keyword,
            only_mine: onlyMine ? 1 : undefined,
            limit: limit,
            category_id: categoryId ? parseInt(categoryId, 10) : categoryId,
            ...subType
        }
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

    getTypeKey = (type) => {
        const key = Object.keys(materialType).find((v) => {
            return materialType[v].type === type
        })
        return key || ''
    }

    getTypeText = (type) => {
        const item = Object.values(materialType).find((v) => {
            return v.type === type
        })
        if (item) {
            return item.name
        }
        return ''
    }

    getTitle = (type) => {
        const typeText = this.getTypeText(type)
        return`${typeText}素材`
    }

    getTypePlaceholder = (type) => {
        const typeText = this.getTypeText(type)
        if(type === materialType.text.type) {
            return `搜索${typeText}素材内容`
        }
        return `搜索${typeText}素材标题`
    }

    getCover = (type, url) => {
        if(url) {
            switch(type) {
                case materialType.image.type: return helper.getThumbLimit(url, 512)
                case materialType.video.type: return helper.getVideoCover(url)
                default: return url
            }
        }
    }

    renderItem = (item) => {
        const {type} = this.props
        return <Fragment>
            {this.getMediaContent(type, item)}
            {this.getMediaInfo(type, item)}
            <div className={styles.meta}>
                <span className={styles.creator}>创建人：{item.nickname}</span>
                <span className={styles.time}>{moment(item.create_time * 1000).format('YYYY/MM/DD HH:mm')}</span>
            </div>
        </Fragment>
    }

    getMediaContent = (type, item) => {
        switch (type) {
            case materialType.text.type:
                return this.renderTextContent(item)
            case materialType.image.type:
            case materialType.video.type:
                return this.renderMediaContent(item)
            case materialType.webPage.type:
                return this.renderWebPageContent(item)
            default: return null
        }
    }

    getMediaInfo = (type, item) => {
        if (type === materialType.image.type || type === materialType.video.type) {
            return <div className={styles.info}>
                <p className={styles.title}>{item.title}</p>
            </div>
        }
        return null
    }

    renderTextContent = (item) => {
        return (
            <FaceHtml className={styles.textContent}
                values={item.desc}
            />
        )
    }

    renderMediaContent = (item) => {
        return (
            <div className={styles.media}>
                <img className={styles.cover}
                    src={this.getCover(item.type, helper.getMediaUrl(item))}
                    onError={(e)=>{e.target.src = DefaultImage}}
                    alt=""
                />
            </div>
        )
    }

    renderWebPageContent = (item) => {
        return (
            <div className={styles.media}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.desc}>
                    <p className={styles.des}>{item.des}</p>
                    <img src={item.thumb_url || DefaultImage}
                        className={styles.icon}
                        onError={(e) => {
                            e.target.src = DefaultImage
                        }}
                        alt=""
                        rel="noreferrer"
                    />
                </div>
            </div>
        )
    }

    render() {
        const {visible, type, listLoading, tagsLoading} = this.props

        const title = this.getTitle(type)

        const {list, selectedList, tags, groups, categoryId, clearAll, itemWidth, itemHeight} = this.state

        return (
            <Modal
                centered={true}
                title={title}
                visible={visible}
                width={940}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                destroyOnClose={true}
            >
                <div className={styles.searchBar}>
                    <Input className={styles.formItem}
                        placeholder={this.getTypePlaceholder(type)}
                        onChange={(e)=>{this.handleChange('keyword', e)}}
                        onPressEnter={this.handleSearch}
                    />
                    <Select
                        optionFilterProp="children"
                        onChange={this.handleTagsChange}
                        placeholder="搜索素材标签"
                        className={styles.tagItem}
                        mode="multiple"
                        value={tags}
                        tokenSeparators={[',']}
                        loading={tagsLoading}
                    >
                        {this.getTagsOptions()}
                    </Select>
                    <TreeSelect
                        showSearch
                        allowClear
                        placeholder={'选择素材分组'}
                        searchPlaceholder={'输入搜索'}
                        treeNodeFilterProp="title"
                        dropdownMatchSelectWidth={true}
                        treeData={groups}
                        value={categoryId}
                        onChange={this.handleGroupTreeChange}
                        className={styles.formItem}
                        dropdownClassName={styles.dropDown}
                    />
                    <Button type="primary"
                        icon="search"
                        className={styles.btn}
                        onClick={this.handleSearch}
                    >搜索</Button>
                </div>
                <Spin spinning={!!listLoading && clearAll}>
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
                                height={460}
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
                                                    className={`${styles.box} ${styles[`${this.getTypeKey(type)}Box`]}`}
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
                    { !clearAll && listLoading ? <div className={styles.loadingWrap}>
                        <Icon type="loading"/>
                    </div> : null}
                    {!list.length && !listLoading ? <div className={styles.empty}>暂无数据</div> : null}
                </Spin>
                <div className={styles.bottomSearch}>
                    <Checkbox onChange={this.handleCheckChange}
                    >只看自己上传的素材</Checkbox>
                </div>
            </Modal>
        )
    }
}
