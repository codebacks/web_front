import React, { Component } from 'react'
import PropTypes from 'prop-types'
import echarts from 'echarts'
import ReactEcharts from 'echarts-for-react'
import chart from 'data/common/chart'

const cityJson = require('echarts/map/json/china-cities.json')

export default class RegionMap extends Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

    static propTypes = {
        option: PropTypes.object,
        height: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        onClick: PropTypes.func
    }

    static defaultProps = {
        option: {},
        height: 'auto',
        onClick: () => {}
    }


    componentDidMount() {
    }

    componentWillUnmount() {
    }

    getInitialState = () => ({option: this.getOption()})

    getOption = () => {
        const option = this.props.option || {}
        return {
            title: {
                text: option.title,
                left: 'center',
                top: '14px',
                textStyle: {
                    color: chart.titleColor,
                },
            },
            tooltip: {
                trigger: 'item',
            },
            // visualMap: [
            //     {
            //         type: 'piecewise',
            //         min: option.min,
            //         max: option.max,
            //         splitNumber: 5,
            //         text: option.text || ['高', '低'],
            //         orient: 'horizontal',
            //         inverse: true,
            //         silent: true,
            //         textStyle: {
            //             color: chart.labelColor,
            //         },
            //         ...option.visualMap
            //     }
            // ],
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                },
            },
            geo: {
                map: 'china',
                silent: true,
                label: {
                    emphasis: {
                        show: false
                    }
                },
                itemStyle: {
                    normal: {
                        areaColor: '#EEE',
                    },
                }
            },
            series: [
                {
                    name: option.seriesName,
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    // symbolSize: (val) => {
                    //     const len = option.max.toString().length
                    //     if (len <= 2) {
                    //         if (option.max <= 50) {
                    //             return val[2]
                    //         } else {
                    //             return val[2] / 4
                    //         }
                    //     } else {
                    //         return val[2]/(Math.pow(10, option.max.toString().length - 2))
                    //     }
                    // },
                    itemStyle: {
                        ...option.itemStyle
                    },
                    tooltip: option.tooltip,
                    label: {
                        position: 'right',
                        formatter: (item)=>{ return item.name },
                        textStyle: {
                            color: chart.titleColor,
                            fontSize: 12,

                        },
                        emphasis: {
                            show: true,
                        },
                    },
                    data: option.data
                },
            ],
        }
    }

    handleClick = (params) => {
        this.props.onClick(params)
    }

    render() {
        const {height } = this.props
        const option = this.getOption()
        const onEvents = {
            'click': this.handleClick,
        }
        echarts.registerMap('city', cityJson)
        return (
            <ReactEcharts
                option={option}
                style={{ height: height, width: '100%' }}
                onEvents={onEvents}
                className='react_for_echarts'
            />
        )
    }
}
