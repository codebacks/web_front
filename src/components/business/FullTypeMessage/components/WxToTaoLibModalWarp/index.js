/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Button,
    Input,
    Spin,
    message, Icon,
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
import {ReactComponent as Checked} from '../../images/checked.svg'
import _ from "lodash"

@toggleModalWarp({
    width: 728,
    destroyOnClose: true,
    maskClosable: false,
})
export default class LibModalWarp extends PureComponent {
    static propTypes = {
        load: PropTypes.func.isRequired,
        handleOk: PropTypes.func.isRequired,
        renderCell: PropTypes.func.isRequired,
        checkedIconClassName: PropTypes.string,
        conversionItem: PropTypes.func,
        afterConversionItem: PropTypes.func,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.state = {
            list: [],
            tabLoading: false,
            loading: false,
            name: '',
            tags: [],
            checkedItem: null,
        }

        this.params = {
            name: '',
            offset: 0,
            limit: 20,
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
        if(checkedItem) {
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

    resetCellPositioner = () => {
        const {columnWidth, gutterSize} = this.props
        this.cellPositioner.reset({
            columnCount: this.columnCount,
            columnWidth,
            spacer: gutterSize,
        })
    }

    load = async () => {
        if(this.state.loading) {
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
        }catch(e) {

        }finally {
            this.setState({
                loading: false,
            })
        }
    }

    componentDidMount() {
        this.load()
    }

    onScrollEnd = async () => {
        if(this.state.loading) {
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
            if(len) {
                const newList = [...list, ...data]
                this.setState({
                    list: newList,
                })
            }else {
                message.warning('没有更多数据!')
            }

        }catch(e) {

        }finally {
            const dif = params.limit - len
            params.offset = params.offset - dif

            this.setState({
                loading: false,
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
        if(this.scrollTop < scrollTop && (clientHeight + scrollTop) >= (scrollHeight - overscanByPixels)) {
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

        if(conversionItem) {
            item = conversionItem(item)
        }

        if(afterConversionItem) {
            item = afterConversionItem(item)
        }

        if(item) {
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
                                    <Icon
                                        className={`${styles.checkedIcon} ${checkedIconClassName}`}
                                        component={Checked}
                                        style={{fontSize: '28px', color: '#4391FF'}}
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

    setParams = (newParams) => {
        Object.assign(this.params, newParams)
    }

    handleChange = (e) => {
        this.setState({
            name: e.target.value,
        })
    }

    handleSearch = () => {
        const {
            name,
        } = this.state

        this.setParams({
            name,
            offset: 0,
        })
        this.resetList()

        this.setState({
            list: [],
        }, () => {
            this.load()
        })
    }

    render() {
        const {
            list,
            loading,
            name,
        } = this.state
        const {
            height,
        } = this.props

        return (
            <div className={styles.wxToTaoLibModalWarp}>
                <Spin
                    spinning={loading}
                    style={{width: '100%'}}
                >
                    <div className={styles.searchBar}>
                        <Input
                            className={styles.formItem}
                            placeholder={`搜索商品名称`}
                            onChange={this.handleChange}
                            value={name}
                            onPressEnter={this.handleSearch}
                        />
                        <Button
                            type="primary"
                            icon="search"
                            className={styles.searchBtn}
                            onClick={this.handleSearch}
                        >
                            搜索
                        </Button>
                    </div>
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
                </Spin>
            </div>
        )
    }
}
