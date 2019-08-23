/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React from 'react'
import {
    Button,
    Checkbox,
    Input,
    Select,
    Spin,
    message,
    TreeSelect,
    Row,
    Col,
} from 'antd'
import {
    AutoSizer,
    Masonry,
    createMasonryCellPositioner as createCellPositioner,
    CellMeasurer,
    CellMeasurerCache,
} from 'react-virtualized'
import toggleModalWarp from 'hoc/toggleModalWarp'
import styles from './index.less'
import PropTypes from "prop-types"
import Checked from '../../images/checked.svg'
import _ from "lodash"

const Option = Select.Option

@toggleModalWarp({
    width: 728,
    destroyOnClose: true,
    maskClosable: false,
})
export default class LibModalWarp extends React.Component {
    static propTypes = {
        load: PropTypes.func.isRequired,
        loadTags: PropTypes.func.isRequired,
        handleOk: PropTypes.func.isRequired,
        loadCategoriesTree: PropTypes.func.isRequired,
        renderCell: PropTypes.func.isRequired,
        type: PropTypes.number.isRequired,
        checkedIconClassName: PropTypes.string,
        conversionItem: PropTypes.func,
        afterConversionItem: PropTypes.func,
    }

    static defaultProps = {
        loadCategoriesTree: async () => {
            try {
                const api = require('common/api/media').default
                const {request} = require('utils')
                const {data} = await request(api.categoriesTree.url)

                if (data) {
                    return data
                }else {
                    throw new Error('请求错误')
                }
            }catch (e) {
                message.error('请求错误')
            }
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            list: [],
            tabLoading: false,
            loading: false,
            keyword: '',
            tags: [],
            tagsData: [],
            checkedItem: null,
            category_id: null,
            categoriesTreeData: [],
        }

        this.params = {
            only_mine: 0,
            tags: '',
            keyword: '',
            offset: 0,
            limit: 20,
            type: props.type,
            category_id: '',
        }

        this.columnCount = 0
        this.scrollTop = 0

        this.measureCache = new CellMeasurerCache({
            defaultWidth: this.props.columnWidth,
            fixedWidth: true,
        })

        props.setModalOkFn(this.handleOk)
        this.calculateColumnCount()
        this.initCellPositioner()
        this.onScrollEnd = _.debounce(this.onScrollEnd, 200)
    }

    handleOk = () => {
        const {checkedItem} = this.state
        if (checkedItem) {
            this.props.handleOk(checkedItem)
            this.handleCancel()
        }else {
            message.warning('请选择素材')
        }
    }

    handleCancel = () => {
        this.props.onModalCancel()
    }

    initCellPositioner = () => {
        if (typeof this.cellPositioner === 'undefined') {
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

    resetCellPositioner = () => {
        const {columnWidth, gutterSize} = this.props
        this.cellPositioner.reset({
            columnCount: this.columnCount,
            columnWidth,
            spacer: gutterSize,
        })
    }

    load = async () => {
        if (this.state.loading) {
            return
        }

        try {
            this.setState({
                loading: true,
            })
            const {list} = this.state
            const data = await this.props.load(this.params)
            const newList = [...list, ...data]
            this.setState({
                list: newList,
            })
        }catch (e) {

        }finally {
            this.setState({
                loading: false,
            })
        }
    }

    componentDidMount() {
        this.load()
        this.loadTags()
        this.loadCategoriesTree()
    }

    loadCategoriesTree = async () => {
        try {
            const tags = await this.props.loadCategoriesTree()
            tags.unshift({
                children: [],
                id: 0,
                name: "未分组",
                parent_id: 0,
                priority: 0,
            })
            this.setState({
                categoriesTreeData: this.parseCategoriesTreeData(tags),
            })
        }catch (e) {

        }finally {
        }
    }

    parseCategoriesTreeData = (data) => {
        if (data && data.length) {
            return data.map((item) => {
                return {
                    key: item.id.toString(),
                    value: item.id.toString(),
                    title: item.name,
                    children: item.children ? this.parseCategoriesTreeData(item.children) : [],
                }
            })
        }
        return []
    }

    onScrollEnd = async () => {
        if (this.state.loading) {
            return
        }

        const params = this.params

        params.offset = params.offset + params.limit
        params.offset < 0 && (params.offset = 0)
        let len = 0
        try {
            this.setState({
                loading: true,
            })
            const {list} = this.state
            const data = await this.props.load(params)
            len = data.length
            if (len) {
                const newList = [...list, ...data]
                this.setState({
                    list: newList,
                })
            }else {
                message.warning('没有更多数据!')
            }

        }catch (e) {

        }finally {
            const dif = params.limit - len
            params.offset = params.offset - dif

            this.setState({
                loading: false,
            })
        }
    }

    loadTags = async () => {
        try {
            this.setState({
                tabLoading: true,
            })
            const tags = await this.props.loadTags()
            this.setState({
                tagsData: tags,
            })
        }catch (e) {

        }finally {
            this.setState({
                tabLoading: false,
            })
        }
    }

    resetList = () => {
        this.measureCache.clearAll()
        this.resetCellPositioner()
        this.masonry && this.masonry.clearCellPositions()
    }

    calculateColumnCount = () => {
        const {columnWidth, gutterSize} = this.props
        this.columnCount = Math.floor(this.width / (columnWidth + gutterSize))
    }

    setMasonryRef = (ref) => {
        this.masonry = ref
    }

    onScroll = ({clientHeight, scrollHeight, scrollTop}) => {
        const {overscanByPixels} = this.props
        if (this.scrollTop < scrollTop && (clientHeight + scrollTop) >= (scrollHeight - overscanByPixels)) {
            this.onScrollEnd()
        }
        this.scrollTop = scrollTop
    }

    onCheck = (item) => {
        this.setState({
            checkedItem: item,
        }, () => {
            this.masonry && this.masonry.forceUpdate()
        })
    }

    cellRenderer = ({index, isScrolling, key, parent, style}) => {
        const {
            list,
            checkedItem,
        } = this.state
        const {
            columnWidth,
            renderCell,
            checkedIconClassName,
            conversionItem,
            afterConversionItem,
        } = this.props

        let item = list[index]

        if (conversionItem) {
            item = conversionItem(item)
        }

        if (afterConversionItem) {
            item = afterConversionItem(item)
        }

        if (item) {
            return (
                <CellMeasurer
                    cache={this.measureCache}
                    key={key}
                    parent={parent}
                    index={index}
                >
                    <div
                        key={item.id}
                        style={{
                            ...style,
                            width: columnWidth,
                        }}
                        onClick={() => {
                            this.onCheck(item)
                        }}
                        className={styles.cell}
                    >
                        {
                            item === checkedItem && (
                                <div
                                    className={`${styles.checked}`}
                                >
                                    <img
                                        className={`${styles.checkedIcon} ${checkedIconClassName}`}
                                        src={Checked}
                                    />
                                </div>
                            )
                        }
                        {renderCell({item, columnWidth, style})}
                    </div>
                </CellMeasurer>
            )
        }
        return null
    }

    renderAutoSizer = ({height}) => {
        this.height = height
        const {
            list,
        } = this.state
        const {
            overscanByPixels,
            scrollingResetTimeInterval,
        } = this.props

        return (
            <>
                <AutoSizer
                    disableHeight
                    height={height}
                    onResize={this.onResize}
                    scrollTop={this.scrollTop}
                    overscanByPixels={overscanByPixels}
                >
                    {({width}) => {
                        this.width = width

                        return (
                            <Masonry
                                autoHeight={false}
                                className={styles.boxes}
                                cellCount={list.length}
                                cellMeasurerCache={this.measureCache}
                                cellPositioner={this.cellPositioner}
                                cellRenderer={this.cellRenderer}
                                height={this.props.height}
                                width={width}
                                overscanByPixels={overscanByPixels}
                                ref={this.setMasonryRef}
                                onScroll={this.onScroll}
                                scrollingResetTimeInterval={scrollingResetTimeInterval}
                            />
                        )
                    }}
                </AutoSizer>
            </>
        )
    }

    setParams = (newParams = {}) => {
        if (typeof newParams.only_mine === 'boolean') {
            newParams.only_mine = Number(newParams.only_mine)
        }

        if (newParams.tags) {
            newParams.tags = newParams.tags.map(item => encodeURIComponent(item)).join(',')
        }

        Object.assign(this.params, newParams)
    }

    handleCheckChange = (e) => {
        this.setParams({
            only_mine: e.target.checked,
            offset: 0,
        })
        this.resetList()

        this.setState({
            list: [],
        }, () => {
            this.load()
        })
    }

    handleChange = (e) => {
        this.setState({
            keyword: e.target.value,
        })
    }

    selectChange = (e) => {
        this.setState({
            tags: e,
        })
    }

    handleSearch = () => {
        const {
            keyword,
            tags,
            category_id,
        } = this.state

        this.setParams({
            keyword,
            tags,
            offset: 0,
            category_id,
        })
        this.resetList()

        this.setState({
            list: [],
        }, () => {
            this.load()
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

    treeSelectHandleChange = (value) => {
        this.setState({category_id: value})
    }

    render() {
        const {
            list,
            tabLoading,
            loading,
            keyword,
            tags,
            category_id,
            categoriesTreeData,
        } = this.state
        const {
            height,
        } = this.props

        return (
            <div className={styles.libModalWarp}>
                <Spin
                    spinning={loading}
                    style={{width: '100%'}}
                >
                    <Row className={styles.searchBar} type={'flex'}>
                        <Col span={7}>
                            <Input
                                className={styles.formItem}
                                placeholder={`搜索素材题材`}
                                onChange={this.handleChange}
                                value={keyword}
                                onPressEnter={this.handleSearch}
                            />
                        </Col>
                        <Col span={7}>
                            <Select
                                optionFilterProp="children"
                                onChange={this.selectChange}
                                placeholder="搜索素材标签"
                                mode="multiple"
                                value={tags}
                                tokenSeparators={[',']}
                                className={styles.tagForm}
                                loading={tabLoading}
                            >
                                {this.getTagsOptions()}
                            </Select>
                        </Col>
                        <Col span={7}>
                            <TreeSelect
                                showSearch
                                allowClear
                                placeholder={'选择素材分组'}
                                searchPlaceholder={'搜索'}
                                treeNodeFilterProp="title"
                                dropdownMatchSelectWidth={false}
                                treeData={categoriesTreeData}
                                onChange={this.treeSelectHandleChange}
                                className={styles.categoriesTree}
                                value={category_id}
                            />
                        </Col>
                        <Col span={3}>
                            <Button
                                type="primary"
                                icon="search"
                                className={styles.searchBtn}
                                onClick={this.handleSearch}
                            >
                                搜索
                            </Button>
                        </Col>
                    </Row>
                    <div className={styles.content} style={{height}}>
                        {
                            list.length ? this.renderAutoSizer({height}) : null
                        }
                        {
                            !list.length && !loading ? (
                                <div
                                    className={styles.empty}
                                >
                                    暂无数据
                                </div>
                            ) : null
                        }
                    </div>
                    <div>
                        <Checkbox
                            className={styles.mine}
                            onChange={this.handleCheckChange}
                            defaultChecked={false}
                        >
                            仅显示自己上传的素材库
                        </Checkbox>
                    </div>
                </Spin>
            </div>
        )
    }
}
