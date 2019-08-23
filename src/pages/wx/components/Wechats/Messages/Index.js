'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 16/12/8
 */
import React from 'react'
import {
    Pagination,
    Row,
    Col,
    Icon,
    Input,
    Button,
    message,
    Radio
} from 'antd'
import moment from 'moment'
import classNames from 'classnames'
import MessagesView from './MessagesView'
import styles from './Index.scss'
import DateRange from 'components/DateRange'
import config from 'wx/common/config'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

const InputGroup = Input.Group
const RadioGroup = Radio.Group
const Search = Input.Search
const {DateFormat, ReceiveMessageTypes} = config

class History extends React.Component {
    constructor(props) {
        super()
        this.state = {
            focus: false,
            endOpen: false,
            order_id: '',
            visible: false,
            message: null,
            activeSession: {}
        }
    }

  loadMessages = (params) => {
      this.props.dispatch({
          type: 'messages/query',
          payload: {
              params: params
          },
          callback: (data) => {
              //默认第一次跳转到最后一页
              if (params.content) {
                  this.handleIntoView('search')
              } else {
                  this.handleIntoView()
              }
          }
      })
  };

  componentDidMount() {
      const {from_uin, to_username, message_id, content, last_page, start_time, end_time} = this.props
      const params = {
          from_uin: from_uin,
          to_username: to_username,
          message_id: message_id || '',
          content: content,
          offset: last_page ? (-this.props.messages.params.limit) : 0,
          old_content: content,
          start_time: start_time ? moment(start_time).format(DateFormat) + ' 00:00:00' : '',
          end_time: end_time ? moment(end_time).format(DateFormat) + ' 23:59:59' : ''
      }
      this.loadMessages(params)
  }

  componentWillUnmount() {
      this.props.dispatch({
          type: 'messages/resetParams',
          payload: {}
      })
  }

  handleIntoView = (flag) => {
      setTimeout(() => {
          const node = document.getElementsByClassName('message-history')
          if (node.length) {
              const li = node[0].getElementsByTagName('li')
              const {list, params} = this.props.messages
              let idx = 0
              if (flag === 'search') {
                  idx = list.findIndex((item) => {
                      if (item.type === ReceiveMessageTypes.text) {
                          return item.content.indexOf(params.old_content) !== -1
                      }
                  })
              } else {
                  if (params.message_id) {
                      idx = list.findIndex((item) => {
                          return item.id === params.message_id
                      })
                  } else {
                      idx = li.length - 1
                  }
              }
              if (idx) {
                  // li[idx] && li[idx].scrollIntoView();
                  let scrollNode = node[0].firstChild
                  scrollNode.scrollTop = scrollNode.scrollHeight
              }
          }
      }, 100)
  };

  handlePage(page) {
      let params = {...this.props.messages.params}
      params.message_id = ''
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params},
      })
      this.props.dispatch({
          type: 'messages/query',
          payload: {page: page},
          callback: () => {
              this.handleIntoView()
          }
      })
  }

  handleInputChange(e) {
      let content = e.target.value.trim()
      let params = {...this.props.messages.params}
      params.content = content
      params.old_content = content
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params},
      })
  }

  handleFocusBlur(e) {
      this.setState({
          focus: e.target === document.activeElement,
      })
  }

  disabledStartDate = (start_time) => {
      let params = {...this.props.messages.params}
      const end_time = params.end_time
      if (!start_time || !end_time) {
          return false
      }
      return start_time.valueOf() > moment(end_time).unix * 1000
  };

  disabledEndDate = (end_time) => {
      let params = {...this.props.messages.params}
      const start_time = params.start_time
      if (!end_time || !start_time) {
          return false
      }
      return end_time.valueOf() <= moment(start_time).unix() * 1000
  };
  onChange = (field, value) => {
      let params = {...this.props.messages.params}
      if (field === 'start_time') {
          if (value) {
              params[field] = moment(value).format(DateFormat) + ' 00:00:00'
          } else {
              params[field] = ''
          }
      } else {
          if (value) {
              params[field] = moment(value).format(DateFormat) + ' 23:59:59'
          } else {
              params[field] = ''
          }
      }
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params},
      })
      this.handleSearch()
  };

  handleChangeDate = (startValue, endValue) => {
      let params = {...this.props.messages.params}
      if (startValue) {
          params.start_time = moment(startValue).format(DateFormat) + ' 00:00:00'
      } else {
          params.start_time = ''
      }
      if (endValue) {
          params.end_time = moment(endValue).format(DateFormat) + ' 23:59:59'
      } else {
          params.end_time = ''
      }
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params}
      })
      this.handleSearch()
  };

  handleChangeCash = (e) => {
      let params = {...this.props.messages.params}
      params.origin_app_message_type = e.target.value
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params},
      })
      this.handleSearch()
  };

  handleStartOpenChange = (open) => {
      if (!open) {
          this.setState({endOpen: true})
      }
  };

  handleSearch = () => {
      setTimeout(() => {
          this.props.dispatch({
              type: 'messages/query',
              payload: {page: 1},
              callback: () => {
                  this.handleIntoView('search')
              }
          })
      }, 0)
  };

  handleNextPos = () => {
      let params = {...this.props.messages.params}
      params.content = params.old_content
      params.offset = params.offset + params.limit
      if (params.offset < this.props.messages.total) {
          setTimeout(() => {
              this.props.dispatch({
                  type: 'messages/query',
                  payload: {params: params},
                  callback: () => {
                      this.handleIntoView('search')
                  }
              })
          }, 0)
      } else {
          message.warning('已查找到最后一页!')
      }
  };

  handleRemoveContent = () => {
      let params = {...this.props.messages.params}
      params.old_content = ''
      params.content = ''
      this.props.dispatch({
          type: 'messages/setProperty',
          payload: {params: params}
      })
      this.handleSearch()
  };


  render() {
      let contentHeight = this.props.contentHeight || this.props.base.contentHeight
      let {params} = this.props.messages
      let hideSearch = this.props.hideSearch || false
      let hidePagination = this.props.hidePagination || false
      let hideBind = false
      if (this.props.hasOwnProperty('hideBind')) {
          hideBind = this.props.hideBind
      }
      const searchCls = classNames({
          'ant-search-input': true,
          'ant-search-input-focus': this.state.focus,
      })
      const btnCls = classNames({
          'ant-search-btn': true,
          'ant-search-btn-noempty': !!params.content.trim(),
      })
      let listHeight = contentHeight - 68
      if (!hideSearch) {
          listHeight = listHeight - 155
      }

      return (
          <div className={styles.history}>
              {hideSearch ? '' :
                  <div className="panel" style={{marginBottom: 10}}>
                      <div className={styles.searchPanel} ref="searchPanel">
                          <Row>
                              <Col span={11}>
                                  <InputGroup className={searchCls}>
                                      <Search placeholder="请输入搜索关键字" value={this.props.messages.params.content}
                                          onChange={this.handleInputChange.bind(this)}
                                          onFocus={this.handleFocusBlur.bind(this)}
                                          onBlur={this.handleFocusBlur.bind(this)}
                                          onPressEnter={this.handleSearch.bind(this)}
                                          onSearch={this.handleSearch}
                                      />
                                  </InputGroup>
                              </Col>
                              <Col span={13}>
                                  {params.old_content ?
                                      <div className={styles.nextPos}>
                                          <strong>关键字：{params.old_content}</strong>
                                          <Button size="small" style={{marginLeft: 8}}
                                              className={styles.btn}
                                              onClick={this.handleNextPos}>下一条</Button>
                                          <Icon type="close" className={styles.removeBtn}
                                              onClick={this.handleRemoveContent}/>
                                      </div>
                                      : ''}
                              </Col>
                          </Row>
                          <Row style={{paddingTop: 14}}>
                              <DateRange {...this.props}
                                  startValue={params.start_time ? moment(params.start_time, DateFormat) : null}
                                  endValue={params.end_time ? moment(params.end_time, DateFormat) : null}
                                  maxToday={true}
                                  onChange={this.handleChangeDate}
                                  onOpenChange={this.handleStartOpenChange}
                              />
                          </Row>
                          <Row style={{paddingTop: 8}}>
                              <div className={styles.cash}>
                                  <RadioGroup onChange={this.handleChangeCash}
                                      value={params.origin_app_message_type}>
                                      <Radio value="">全部</Radio>
                                      <Radio value={2000}>只看转账</Radio>
                                      <Radio value={2001}>只看红包</Radio>
                                  </RadioGroup>
                              </div>
                          </Row>
                      </div>
                  </div>
              }
              <div className="panel body-padding-0">
                  <div className={"message-history " + styles.messageHistory}>
                      <MessagesView {...this.props}
                          cls={styles.listView}
                          historyHeight={listHeight}
                          loading={this.props.messages.loading}
                          keyword={this.props.messages.params.old_content}
                          hideBind={hideBind}
                          bindModal={this.props.messages.bindModal}
                          records={this.props.messages.list}/>
                  </div>
                  {!hidePagination ?
                      <div className={styles.pageWrap}>
                          <Pagination defaultCurrent={1}
                              size="small"
                              current={this.props.messages.current}
                              pageSize={this.props.messages.params.limit}
                              onChange={this.handlePage.bind(this)}
                              total={this.props.messages.total}/>
                      </div>
                      : ''}
              </div>
          </div>
      )
  }
}

export default History
