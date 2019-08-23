import React, {Component} from 'react'
import {Form, Input, Select, Button, Row, Col, Tabs, message} from 'antd'
import {connect} from 'dva'
import moment from'moment'
import ContentHeader from 'components/business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import DateRange from 'components/DateRange'
import UserSelect from 'components/business/UserSelect'
import Materials from './components/Materials'
import config from 'wx/common/config'
import styles from './index.scss'

const FormItem = Form.Item
const Option = Select.Option
const TabPane = Tabs.TabPane

const {DateFormat, DateTimeFormat} = config

const contentTypeMap = {
    'text': '文本',
    'article': '文章',
    'photo': '图文',
    'video': '视频',
}

@connect(({ base, wx_material_moments, loading}) => ({
    base,
    wx_material_moments,
    listLoading: loading.effects['wx_material_moments/list'],
}))
@documentTitleDecorator()
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            record: {},
            imageUrl: '',
            videoSource: '',
            imageVisible: false,
            videoVisible: false,
            reset: false
        }
    }

    componentDidMount() {
        this._isMounted = true
        this.handleSearch()
    }

    componentDidUpdate() {

    }

    componentWillUnmount() {
        this._isMounted = false
    }

    handleSearch = () => {
        const {currentSource} = this.props.wx_material_moments
        this.props.dispatch({
            type: 'wx_material_moments/setProperty',
            payload: {
                updateSource: [currentSource]
            }
        })
        this.load(currentSource)
    }

    handleReset = () => {
        new Promise((resolve, reject) => {
            this.props.dispatch({
                type: 'wx_material_moments/resetParams',
            })
            this.dateRange.setDate(null, null)
            resolve()
        }).then(()=>{
            this.handleSearch()
        })
    }

    load = (source=0, offset=0) => {
        if(offset === 0) {
            this.props.dispatch({
                type: 'wx_material_moments/setProperty',
                payload: {
                    clearAll: true,
                }
            })
        }
        if(source === 0) {
            this.loadAllList(offset)
        } else if(source === 1) {
            this.loadSentList(offset)
        } else if(source === 2) {
            this.loadUnsentList(offset)
        }
    }

    loadList = (payload) => {
        this.props.dispatch({
            type: 'wx_material_moments/list',
            payload: payload,
        })
    }

    loadAllList = (offset) => {
        let allParams = {...this.props.wx_material_moments.allParams}
        allParams.offset = offset
        const payload = {
            params: allParams
        }
        this.loadList(payload)
    }

    loadSentList = (offset) => {
        let sentParams = {...this.props.wx_material_moments.sentParams}
        sentParams.offset = offset
        const payload = {
            params: sentParams
        }
        this.loadList(payload)
    }

    loadUnsentList = (offset) => {
        let unsentParams = {...this.props.wx_material_moments.unsentParams}
        unsentParams.offset = offset
        const payload = {
            params: unsentParams
        }
        this.loadList(payload)
    }


    handleChange = (key, e) => {
        let val = ''
        if(e && e.target) {
            val = e.target.value
        }else {
            val = e
        }
        let params = {...this.props.wx_material_moments.params}
        params[key] = val
        this.props.dispatch({
            type: 'wx_material_moments/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeDate = (startValue, endValue) => {
        let params = {...this.props.wx_material_moments.params}
        if (startValue) {
            params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
        } else {
            params.start_time = undefined
        }
        if (endValue) {
            params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
        } else {
            params.end_time = undefined
        }
        this.props.dispatch({
            type: 'wx_material_moments/setParams',
            payload: {
                params: params
            }
        })
    }

    handleTabChange = (e) => {
        const key = parseInt(e, 10)
        this.props.dispatch({
            type: 'wx_material_moments/setProperty',
            payload: {
                currentSource: key,
            }
        })

        let updateSource = [...this.props.wx_material_moments.updateSource]
        const index = updateSource.findIndex((v)=>{ return v === key})

        const list = this.getCurrentList(key)

        if (!list.length || index === -1) {
            if(index === -1) {
                updateSource.push(key)
            }

            this.props.dispatch({
                type: 'wx_material_moments/setProperty',
                payload: {
                    updateSource: updateSource,
                }
            })
            this.load(key)
        }
    }

    onScrollEnd = (source) => {
        const {listLoading} = this.props
        if(listLoading) {
            return
        }

        const {allParams, allTotal,
            sentParams, sentTotal,
            unsentParams, unsentTotal,
        } = this.props.wx_material_moments
        let offset = 0
        let total = 0
        switch(source) {
            case 0: offset = allParams.offset + allParams.limit
                total = allTotal
                break
            case 1: offset = sentParams.offset + sentParams.limit
                total = sentTotal
                break
            case 2: offset = unsentParams.offset + unsentParams.limit
                total = unsentTotal
                break
            default:
        }
        if(offset < total) {
            this.load(source, offset)
        } else {
            // console.log('没有更多了')
        }

    }

    handleRemove = (id, index) => {
        this.props.dispatch({
            type: 'wx_material_moments/remove',
            payload: {
                id: id
            },
            callback: () => {
                message.success('删除成功', 1)
                const {currentSource} = this.props.wx_material_moments
                const list = this.getCurrentList(currentSource)
                const currentList = list.filter((item) => {
                    return item.id !== id
                })
                this.setCurrentList(currentSource, currentList)
                this[`material${currentSource}`].removeIndex(index)
            }
        })
    }

    setCurrentList = (source, list) => {
        let payload = {}
        switch (source) {
            case 0:
                payload = {allList: list}
                break
            case 1:
                payload = {sentList: list}
                break
            case 2:
                payload = {unsentList: list}
                break
            default:
        }
        this.props.dispatch({
            type: 'wx_material_moments/setProperty',
            payload: payload
        })
    }

    getCurrentList = (source) => {
        const {allList, sentList, unsentList} = this.props.wx_material_moments
        switch (source) {
            case 0:
                return allList
            case 1:
                return sentList
            case 2:
                return unsentList
            default:
                return []
        }
    }

    setDateRangeRef = (el) => {
        this.dateRange = el
    }

    render() {
        const {base: {pageHeight}, listLoading, removeLoading} = this.props
        const {params, currentSource, allList, sentList, unsentList, clearAll} =  this.props.wx_material_moments

        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const timeFormItemLayout = {
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        }

        const height = pageHeight - 220
        const option = {
            loading: listLoading,
            removeLoading: removeLoading,
            columnWidth: 265,
            gutterSize: 16,
            height: height,
            overscanByPixels: 20,
            windowScrollerEnabled: false,
            scrollingResetTimeInterval: 200,
            clearAll: clearAll,
            onRemove: this.handleRemove
        }

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E5%86%85%E5%AE%B9%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.moments}>
                    <div className={styles.searchWrap}>
                        <Row>
                            <Col span={8}>
                                <FormItem {...formItemLayout}
                                    label="搜索："
                                    colon={false}
                                >
                                    <Input placeholder="请输入朋友圈内容"
                                        value={params.content_desc}
                                        maxLength={20}
                                        onChange={(e)=>{this.handleChange('content_desc', e)}}
                                    />

                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout}
                                    label="创建人："
                                    colon={false}>
                                    <UserSelect
                                        userId={params.user_id}
                                        onChange={(value)=>{this.handleChange('user_id', value)}}
                                    />
                                </FormItem>
                            </Col>
                            <Col span={8}>
                                <FormItem {...formItemLayout}
                                    label="朋友圈类型："
                                    colon={false}
                                >
                                    <Select
                                        style={{width: '100%'}}
                                        value={params.content_type}
                                        onChange={(e)=>{this.handleChange('content_type', e)}}
                                    >
                                        <Option key="all" value="">全部类型</Option>
                                        {
                                            Object.keys(contentTypeMap).map((key) => {
                                                return <Option key={key}
                                                    value={key}>{contentTypeMap[key]}</Option>
                                            })
                                        }
                                    </Select>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row className={styles.operationRow}>
                            <Col span={16}>
                                <FormItem{...timeFormItemLayout}
                                    label="创建时间："
                                    colon={false}>
                                    <DateRange {...this.props}
                                        ref={this.setDateRangeRef}
                                        startValue={params.start_time ? moment(params.start_time, DateTimeFormat) : ''}
                                        endValue={params.end_time ? moment(params.end_time, DateTimeFormat) : ''}
                                        onChange={this.handleChangeDate}
                                        maxToday={true}/>
                                    <div className={styles.btns}>
                                        <Button
                                            type="primary"
                                            icon="search"
                                            onClick={this.handleSearch}>搜索</Button>
                                        <Button
                                            onClick={this.handleReset}>重置</Button>
                                    </div>
                                </FormItem>
                            </Col>
                        </Row>
                    </div>
                    <Tabs ActiveKey={currentSource.toString()} onChange={this.handleTabChange}>
                        <TabPane tab="全部" key="0">
                            <Materials ref={(ref)=>{ this.material0 = ref }}
                                list={allList}
                                onScrollEnd={()=>{this.onScrollEnd(0)}}
                                {...option}
                            />
                        </TabPane>
                        <TabPane tab="未发" key="2">
                            <Materials ref={(ref)=>{ this.material2 = ref }}
                                list={unsentList}
                                onScrollEnd={()=>{this.onScrollEnd(2)}}
                                {...option}
                            />
                        </TabPane>
                        <TabPane tab="已发" key="1">
                            <Materials  ref={(ref)=>{ this.material1 = ref }}
                                list={sentList}
                                onScrollEnd={()=>{this.onScrollEnd(1)}}
                                {...option}
                            />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        )
    }
}
