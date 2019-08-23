'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: liyan [randonely@gmail.com]
 * 创建日期: 18/11/02
 */
import React from 'react'
import {Row, Col, Form, Button, Radio, Spin, Tooltip} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import styles from './index.scss'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import Pie from 'data/components/Charts/Pie'
import Map from 'data/components/Charts/Map'
import RegionMap from 'data/components/Charts/Map/Region'
import CityScatterMap from 'data/components/Charts/Map/City'
import chart from 'data/common/chart'
import Helper from 'data/utils/helper'
import cityGeoCoord from 'data/components/Charts/Map/city-geo-coord'

const FormItem = Form.Item
const RadioButton = Radio.Button
const RadioGroup = Radio.Group


@connect(({data_stat_friends_dist, loading}) => ({
    data_stat_friends_dist,
    baseLoading: loading.effects['data_stat_friends_dist/queryBaseDist'],
    areaLoading: loading.effects['data_stat_friends_dist/queryAreaDist']
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sexSeriesData: [],
            sourceSeriesData: [],
            areaData: [],
            barData: [],
            type: 'province'
        }
    }

    componentDidMount() {
        this.loadData()
    }

    componentWillUnmount() {
        this.resetParams()
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'data_stat_friends_dist/resetParams',
        })
    }


    loadData = () => {
        this.loadBaseDist()
        this.loadAreaDist()
    }

    loadBaseDist = () => {
        this.props.dispatch({
            type: 'data_stat_friends_dist/queryBaseDist',
            payload: {},
            callback: (data) => {
                this.parseSexData(data.gender)
                this.parseSourceData(data.source)
            }
        })
    }

    loadAreaDist = () => {
        this.props.dispatch({
            type: 'data_stat_friends_dist/queryAreaDist',
            payload: {},
            callback: (data) => {
                this.setState({
                    areaData: data
                })
                const {type} = this.state
                this.setMapData(type)
            }
        })
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'query') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.data_stat_friends_dist.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'data_stat_friends_dist/setParams',
            payload: {params: params},
        })
    }

    handleSearch = () => {
        this.loadData()
    }

    handleAreaChange = (e) => {
        const type = e.target.value
        this.setState({type: type})
        this.setMapData(type)
    }

    parseSexData = (data) => {
        let seriesData = data.map((item) => {
            if (item.gender === 1) {
                return {
                    name: '男',
                    value: item.count
                }
            } else if (item.gender === 2) {
                return {
                    name: '女',
                    value: item.count
                }
            } else {
                return {
                    name: '未知',
                    value: item.count
                }
            }
        })

        let index = seriesData.findIndex((item) => {
            return item.name === '未知'
        })
        const sexSeries = seriesData.filter((item)=>{
            return item.name !== '未知'
        })
        if(index !== -1) {
            sexSeries.push(seriesData[index])
        }

        this.setState({
            sexSeriesData: sexSeries
        })
    }

    parseSourceData = (data) => {
        let sourceData = []
        let seriesData = []
        if(data.length) {
            sourceData =  this.sortSourceData(data)
            seriesData = sourceData.map((item)=>{
                return {
                    name: Helper.getFriendSource(item.source),
                    value: item.count
                }
            })
        }
        this.setState({
            sourceSeriesData: seriesData
        })
    }

    sortSourceData = (data) => {
        const sourceCode = Helper.getFriendSourceCode()
        const code = Object.keys(sourceCode).map((key) => {
            return sourceCode[key]
        })
        const duplicate = {4: 12, 12: 4, 10: 13, 13: 10, 8: 14, 14: 8, 1000010: 1000013, 1000013: 1000010}
        const duplicateCode = [4, 12, 10, 13, 8, 14, 1000010, 1000013]
        const differenceCode = code.filter(v => !duplicateCode.includes(v))
        let source = []
        let special = {}

        data.forEach((item) => {
            if (duplicateCode.includes(item.source)) {
                let source = item.source
                if (special.hasOwnProperty(duplicate[source])) {
                    special[duplicate[source]] += item.count
                } else {
                    special[source] = item.count
                }
            } else {
                if (differenceCode.includes(item.source)) {
                    source.push(item)
                } else {
                    let index = -1
                    for (let i = 0; i < source.length; i++) {
                        if (source[i].source === -1) {
                            index = i
                            break
                        }
                    }
                    if (index !== -1) {
                        source[index].count += item.count
                    } else {
                        source.push({
                            source: -1,
                            count: item.count
                        })
                    }
                }
            }
        })

        let index = source.findIndex((item) => {
            return item.source === -1
        })
        if (index !== -1) {
            let len = source.length
            let temp = source[index]
            source[index] = source[len - 1]
            source[len - 1] = temp
        }

        let totalSource = Object.keys(special).map((key) => {
            return {
                source: parseInt(key, 10),
                count: special[key]
            }
        }).concat(source)

        let temp = totalSource.slice(0, source.length - 1)
        temp.sort((a, b)=>{
            return b.count - a.count
        })
        temp.push(totalSource[totalSource.length -1])

        return temp
    }

    parseProvinceData = (data) => {
        // 过滤未知
        const provinceData = data.filter((item)=>{
            return item.province !== '未知'
        })

        return provinceData.map((item)=>{
            return {
                name: item.province,
                value: item.count
            }
        })
    }

    parseRegionData = (data) => {
        // 过滤未知
        const regionData = data.filter((item) => {
            return item.region !== '未知'
        })
        return regionData.map((item) => {
            return {
                name: item.region,
                value: item.count
            }
        })
    }

    parseCityData = (data) => {
        // 过滤未知
        const cityData = data.filter((item) => {
            return item.city !== '未知'
        })
        const special = ['北京', '天津', '重庆', '上海', '台湾', '香港', '澳门']

        cityData.map((item) => {
            if (special.indexOf(item.province) !== -1) {
                item.city = item.province
            }
            return item
        })

        let result = {}

        cityData.forEach((item)=>{
            if(result[item.city]){
                result[item.city] += item.count
            }else{
                result[item.city] = item.count
            }
        })

        let comCityData = []
        for (let k in result) {
            comCityData.push({city: k, count: result[k]})
        }

        comCityData = comCityData.sort((a, b) => {
            return b.count - a.count
        })

        return comCityData.map((item) => {
            return {
                name: item.city,
                value: this.convertGeoData(item.city, item.count)
            }
        })
    }

    convertGeoData = (name, value) => {
        const index = cityGeoCoord.findIndex((item) => {
            return item.name === name
        })
        if (index !== -1) {
            return [
                cityGeoCoord[index].log,
                cityGeoCoord[index].lat,
                value,
            ]
        }
        return [
            value,
        ]
    }

    setMapData = (type) => {
        const {areaData} = this.state
        let barData = []
        if (type === 'province') {
            barData = this.parseProvinceData(_.cloneDeep(areaData.province_data))
        } else if (type === 'region') {
            barData = this.parseRegionData(_.cloneDeep(areaData.region_data))
        } else if (type === 'city') {
            barData = this.parseCityData(_.cloneDeep(areaData.city_data))
        }
        this.setState({
            barData: barData,
        })
    }

    render() {
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        const {params} = this.props.data_stat_friends_dist

        const {sexSeriesData, sourceSeriesData, barData, type} = this.state

        const sexLegendData = sexSeriesData.map((item) => {
            return item.name
        })

        const sourceLegendData = sourceSeriesData.map((item)=>{
            return item.name
        })

        // 好友性别分布图
        const sexDistOption= {
            title: {
                text: '好友性别分布',
                padding: [0, 0, 20, 0]
            },
            legend: {
                show: false,
            },
            label: {
                normal: {
                    formatter: '{b}\n{a}：{c}',
                }
            },
            seriesLabelLine: true,
            legendData: sexLegendData,
            seriesName: '人数',
            seriesData: sexSeriesData,
            seriesItem: {
                center: ['50%', '50%'],
                radius: [0, '80%']
            },
            tooltip: {
                show: false
            },
            colorPalette: ['#569FF8', '#E26C7D', '#F4BE62']
        }

        // 好友来源分布图
        const sourceDistOption = {
            title: {
                text: '好友来源分布',
                left: sourceLegendData.length <= 12 ? 'center' : '22%',
            },
            legendData: sourceLegendData,
            legend: {
                orient: 'vertical',
                x: 'right',
            },
            seriesName: '人数',
            // type: 'scroll',
            seriesData: sourceSeriesData,
            seriesItem: {
                radius: ['50%', '70%'],
                center: sourceLegendData.length <= 12 ? ['50%', '50%'] : ['30%', '50%'],
                avoidLabelOverlap: false,
                label: {
                    normal: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        show: true,
                        textStyle: {
                            fontSize: '12',
                            fontWeight: 'bold',
                        }
                    }
                }
            },
            colorPalette: ['#5791F7', '#64C8CA', '#70C87D', '#F3D359', '#D080D4', '#8F64DD', ...chart.colorPalette ]
        }

        const mapData = [...barData]

        let min = 0
        let max = 0
        let mapValues = []

        if (type === 'city') {
            mapValues = mapData.map((item) => {
                let value = item.value[2]
                if (typeof value !== 'undefined') {
                    return item.value[2]
                }
                return item.value
            })
        } else {
            mapValues = mapData.map((item)=>{return item.value})
        }

        if (mapValues.length) {
            min = Math.min.apply(null, mapValues)
            max = Math.max.apply(null, mapValues)
        }

        const mapOption = {
            min: min,
            max: max,
            seriesName: '好友数',
            data: mapData,
            emphasis: {
                itemStyle: {
                    areaColor: '#D9F4FE'
                }
            },
            visualMap: {
                inRange: {
                    color: ['#86DDFB', '#5DD2F9','#33C6F7', '#1890FF']
                },
            },
            tooltip: {
                formatter: (values) => {
                    if(typeof values.data === 'undefined') {
                        return null
                    } else {
                        return `${values.seriesName}<br/>${values.name}：${values.value}`
                    }
                }
            }
        }

        const regionOption = {
            min: min,
            max: max,
            seriesName: '好友数',
            data: mapData,
            itemStyle: {
                areaColor: '#EEE',
            },
            visualMap: {
                inRange: {
                    color: ['#86DDFB', '#5DD2F9','#33C6F7', '#1890FF']
                },
            }
        }

        const cityOption = {
            min: min,
            max: max,
            seriesName: '好友数',
            data: mapData,
            tooltip:  {
                formatter: (item) => {
                    return `${item.name}<br/>排名：${item.dataIndex + 1}<br/>好友数：${item.value[2] || item.value[0]}`
                },
            },
            visualMap: {
                inRange: {
                    symbol: 'circle',
                    color: '#33C6F7',
                },
            },

        }

        const pieHeight = 350
        const mapHeight = 600

        const {baseLoading, areaLoading} = this.props

        return (
            <div className={styles.customerDist}>
                <div className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value)=>{this.handleChange('department_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value)=>{this.handleChange('user_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    uin={params.uin}
                                    onChange={(value)=>{this.handleChange('uin', value)}}
                                />
                            </FormItem>
                        </Col>
                        <div className={styles.searchBtn}>
                            <Button type="primary" icon="search" onClick={this.handleSearch}>查询</Button>
                        </div>
                    </Row>
                </div>
                <Spin spinning={!!baseLoading}>
                    <Row className={styles.base}>
                        <Col span={12} className={styles.sexWrap}>
                            <Pie option={sexDistOption} height={pieHeight} />
                        </Col>
                        <Col span={12} className={styles.sourceWrap}>
                            <h3>好友来源</h3>
                            <div className={styles.sourceBars}>
                                {
                                    sourceSeriesData.map((item, index)=>{
                                        const values = sourceSeriesData.map((item)=>{return item.value})
                                        const max = Math.max.apply(null, values)
                                        const radio = values[index] / max
                                        const width = `${radio * 100}%`

                                        return <div key={index} className={styles.bar}>
                                            <span className={styles.label}>{index + 1}.</span><span className={styles.name}>{item.name}</span>
                                            <span className={styles.line}>
                                                <span className={styles.progress} style={{ width: width}}/>
                                            </span>
                                            <span className={styles.num}>{item.value}</span>
                                        </div>
                                    })
                                }
                            </div>
                        </Col>
                    </Row>
                </Spin>
                <Spin spinning={!!areaLoading}>
                    <Row>
                        <Col span={12}>
                            {
                                type === 'province' ? <Map option={mapOption} height={mapHeight}/>
                                    : (type === 'region' ?   <RegionMap option={regionOption} height={mapHeight}/>
                                        : <CityScatterMap option={cityOption} height={mapHeight} />)

                            }
                        </Col>
                        <Col span={12}>
                            <RadioGroup buttonStyle="solid"
                                className={styles.tabs}
                                value={type}
                                onChange={this.handleAreaChange}
                            >
                                <RadioButton value='province'>省</RadioButton>
                                <RadioButton value='region'>区域</RadioButton>
                                <RadioButton value="city">城市</RadioButton>
                            </RadioGroup>
                            <div className={styles.bars}>
                                {
                                    barData.map((item, index)=>{
                                        let values = []
                                        if (type === 'city') {
                                            values = barData.map((item) => {
                                                let value = item.value[2]
                                                if (typeof value !== 'undefined') {
                                                    return item.value[2]
                                                }
                                                return item.value
                                            })
                                        } else {
                                            values = barData.map((item)=>{return item.value})
                                        }
                                        const max = Math.max.apply(null, values)
                                        const width = `${(values[index] / max) * 100}%`

                                        return <Tooltip key={index} placement="top" arrowPointAtCenter title={`${values[index]}`}>
                                            <div className={styles.bar}>
                                                <span className={styles.label}>{index + 1}.</span><span className={styles.name}>{item.name}</span>
                                                <span className={styles.line}>
                                                    <span className={styles.progress} style={{ width: width}}/>
                                                </span>
                                            </div>
                                        </Tooltip>

                                    })
                                }
                            </div>
                        </Col>
                    </Row>
                </Spin>
            </div>
        )
    }
}