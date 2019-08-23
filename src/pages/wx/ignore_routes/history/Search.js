'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React from 'react'
import {Form, Input, Button, Row, Col} from 'antd'
import moment from 'moment'
import 'moment/locale/zh-cn'
import styles from './index.scss'
import config from 'wx/common/config'
import DateRange from 'components/DateRange'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'

moment.locale('zh-cn')
const FormItem = Form.Item

const {DateFormat} = config

class Search extends React.Component {
    constructor(props) {
        super()
        this.state = {
            user_id: ''
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.props.search()
    };

    handleChange(key, e) {
        let val = ''
        if (key === 'content') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_history.params}
        params[key] = val
        if (key === 'department_id') {
            params['user_id'] = undefined
            params['uin'] = undefined
        } else if (key === 'user_id') {
            params['uin'] = undefined
        }
        this.props.dispatch({
            type: 'wx_history/setProperty',
            payload: {params: params},
        })
    }

      handleChangeDate = (startValue, endValue) => {
          let params = {...this.props.wx_history.params}
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
              type: 'wx_history/setProperty',
              payload: {params: params}
          })
      };

      resetParams = () => {
          this.props.dispatch({
              type: 'wx_history/resetParams',
          })
          this.refs.historyTime.setDate(null, null)
      };

      resetSearch = () => {
          this.resetParams()
          setTimeout(() => {
              this.props.search()
          }, 0)
      }

      render() {
          let {params} = this.props.wx_history
          const formItemLayout = {
              labelCol: {span: 8},
              wrapperCol: {span: 16},
          }
          const timeFormItemLayout = {
              labelCol: {span: 4},
              wrapperCol: {span: 16},
          }
          return (
              <div className={styles.searchWrap}>
                  <Form>
                      <Row gutter={20}>
                          <Col span={7}>
                              <FormItem {...formItemLayout} label="搜索：" colon={false}>
                                  <Input value={params.content}
                                      onChange={(e)=>{this.handleChange('content', e)}}
                                      onPressEnter={this.handleSearch}
                                      placeholder="请输入聊天内容"/>
                              </FormItem>
                          </Col>
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
                      </Row>
                      <Row gutter={20}>
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
                          <Col span={14} style={{marginLeft: '-3px'}}>
                              <FormItem {...timeFormItemLayout} label="对话时间：" colon={false}>
                                  <DateRange {...this.props}
                                      ref="historyTime"
                                      startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                      endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                      onChange={this.handleChangeDate}
                                      maxToday={true}/>
                              </FormItem>
                          </Col>
                      </Row>
                      <Row className={styles.searchBtn} gutter={20}>
                          <Col span={7}>
                              <Col offset={8}>
                                  <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                  <Button onClick={this.resetSearch}>重置</Button>
                              </Col>
                          </Col>
                      </Row>
                  </Form>
              </div>)
      }
}

export default Form.create()(Search)
