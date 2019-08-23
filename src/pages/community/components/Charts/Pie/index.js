import React, { Component } from 'react'
import ReactEcharts from 'echarts-for-react'
import chart from 'community/common/chart'

export default class Pie extends Component {
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
          color: option.colorPalette || chart.colorPalette,
          title: {
              left: 'center',
              textStyle: {
                  color: chart.titleColor,
              },
              ...option.title
          },
          tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b} : {c} ({d}%)',
              ...option.tooltip
          },
          legend: {
              ...option.legend
          },
          series: [
              {
                  name: option.seriesName,
                  type: 'pie',
                  data: option.seriesData,
                  label: option.label,
                  labelLine: {
                      normal: {
                          show: option.seriesLabelLine || false,
                      },
                  },
                  ...option.seriesItem
              },
          ],
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
  }
}
