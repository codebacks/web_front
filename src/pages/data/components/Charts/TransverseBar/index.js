import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react'
import chart from 'data/common/chart'

export default class Bar extends Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

  getInitialState = () => ({ option: this.getOption() });

  componentDidMount() {
  };

  componentWillUnmount() {
  };


  getOption = () => {
      const option = this.props.option || {}
      return {
          color: option.color,
          tooltip: {
              ...{ trigger: 'axis',
                  axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                      type: 'shadow',        // 默认为直线，可选为：'line' | 'shadow'
                  },...option.tooltip
              }
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '6%',
              y2: 100,
              containLabel: true,
          },
          xAxis: [
              {
                  type: 'value',
                  silent: true,
                  splitLine:{
                      show: false,
                      lineStyle: {
                          color: chart.axisLineColor
                      }
                  },
                  axisTick: {
                      alignWithLabel: true,
                  },
                  axisLabel: {
                      ...{
                          interval: 0,
                          textStyle: {
                              color: chart.labelColor,
                          }, ...option.axisLabel,
                      },
                  },
              },
          ],
          yAxis: [
              {
                  type: 'category',
                  data: option.xAxisData,
                  inverse: option.inverse,
                  splitLine:{
                      show: false,
                      lineStyle: {
                          color: chart.axisLineColor
                      }
                  },
                  axisLabel: {
                      textStyle: {
                          color: chart.labelColor,
                      }, ...option.yAxisLabel,
                  },
              },
          ],
          series: [{
              name: option.seriesName,
              type: 'bar',
              barWidth: '40%',
              barMaxWidth: 50,
              data: option.seriesData,
              itemStyle: option.itemStyle
          }
          ],
          title: {
              text: option.title,
              // subtext: '',
              left: 'center',
              top: '14px',
              textStyle: {
                  color: chart.titleColor,
              },
          },
          toolbox: {
              show: true,
              orient: 'vertical',
              left: 'right',
              top: 'center',
              feature: {
              },
          },
      }
  };

  render() {
      const { height } = this.props
      const option = this.getOption()
      return (
          <ReactEcharts
              option={option}
              style={{ height: height, width: '100%' }}
              className='react_for_echarts'
          />
      )
  };
}
