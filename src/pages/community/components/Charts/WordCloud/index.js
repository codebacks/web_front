import React, {Component} from 'react'
import ReactEcharts from 'echarts-for-react'
import chart from 'community/common/chart'
import 'echarts-wordcloud'

export default class WordCloud extends Component {
    constructor(props) {
        super(props)
        this.state = this.getInitialState()
    }

  getInitialState = () => ({ option: this.getOption() })

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
      const nextData = nextProps.option && nextProps.option.seriesData
      const data = this.props.option && this.props.option.seriesData
      return JSON.stringify(nextData) !== JSON.stringify(data)
  }

  componentWillUnmount() {
  }


  getOption = () => {
      const option = this.props.option || {}
      return {
          title: {
              text: option.titleText || '',
              x: 'center',
              textStyle: {
                  color: chart.titleColor,
              },
              ...option.title
          },
          // backgroundColor: '#F7F7F7',
          tooltip: {
              show: true,
              confine: true, // 将 tooltip 框限制在图表的区域内
          },
          series: [
              {
                  type: 'wordCloud',
                  name: option.seriesName,
                  gridSize: 8,
                  sizeRange: [12, 60], // 最小文字——最大文字
                  rotationRange: [0, 360], // 旋转角度区间
                  rotationStep: 360, // 旋转角度间隔
                  textPadding: 0,
                  drawOutOfBound: true,
                  autoSize: {
                      enable: true,
                      minSize: 12
                  },
                  ...option.seriesItem,
                  data: option.seriesData,
              },
          ],
      }
  }

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
