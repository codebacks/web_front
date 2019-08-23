import React, {Fragment} from 'react'
import {
    Select,
    Row,
    Col
} from 'antd'
import { province as provinceData } from './province'
import { city as cityData } from './city'

const Option = Select.Option

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {}

  handleChange = (key, e) => {
      this.props.handleChange(key, e)
  };

  render() {
      let { provinceName, cityName } = this.props

      // if (!provinceName) {
      //     provinceName = ''
      // }
      //
      // if (!cityName) {
      //     cityName = ''
      // }

      let provinceId = ''

      // 省
      let provinceOptions = []
      provinceData.forEach(province => {
          if (province.name === provinceName) {
              provinceId = province.id
          }
          provinceOptions.push(<Option key={province.id} value={province.name}>{province.name}</Option>)
      })
      // 市
      let cityOptions = []
      let _cities = []
      if (provinceName !== '') {
          _cities = cityData[provinceId]
      }
      _cities && _cities.forEach(city => {
          cityOptions.push(<Option key={city.id} value={city.name}>{city.name}</Option>)
      })

      return (
          <Fragment>
              <Row gutter={10}>
                  <Col span={12}>
                      <Select allowClear
                          defaultValue=""
                          placeholder="省"
                          value={provinceName}
                          onChange={(e) => this.handleChange('province', e)}>
                          <Option value="">未知</Option>
                          { provinceOptions }
                      </Select>
                  </Col>
                  <Col span={12}>
                      <Select allowClear
                          defaultValue=""
                          placeholder="市"
                          value={cityName}
                          onChange={(e) => this.handleChange('city', e)}>
                          <Option value="">未知</Option>
                          { cityOptions }
                      </Select>
                  </Col>
              </Row>
          </Fragment>
      )
  }
}
