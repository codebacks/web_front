import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactEcharts from 'echarts-for-react'
import chart from 'data/common/chart'

require('echarts/map/js/china.js')

export default class Map extends Component {
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

    getInitialState = () => ({ option: this.getOption() })


    getOption = () => {
        const option = this.props.option
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
                ...option.tooltip
            },
            visualMap: {
                min: option.min,
                max: option.max,
                left: 15,
                bottom: 15,
                // top: 'bottom',
                text: option.text || ['高', '低'],
                calculable: true,
                textStyle: {
                    color: chart.labelColor,
                }, ...option.visualMap
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                },
            },
            series: [
                {
                    name: option.seriesName,
                    type: 'map',
                    mapType: 'china',
                    selectMode: 'single',
                    roam: false,
                    // itemStyle: {
                    //     ...option.itemStyle
                    // },
                    emphasis: option.emphasis,
                    label: {
                        normal: {
                            show: true,
                            textStyle: {
                                color: chart.titleColor,
                                fontSize: 9,
                            },
                        },
                        emphasis: {
                            show: false,
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
        const {height} = this.props
        const option = this.getOption()
        const onEvents = {
            'click': this.handleClick,
        }
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
