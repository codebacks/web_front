'use strict'

/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: 1625 [zhanghedong@gmail.com]
 * 创建日期: 2017/8/13
 */

import React from 'react'
import {Form, Input, Button, Row, Col, Select, Checkbox, Popover, Icon} from 'antd'
import {connect} from 'dva'
import _ from 'lodash'
import config from 'wx/common/config'
import DepartmentSelect from 'components/business/DepartmentSelect'
import UserSelect from 'components/business/UserSelect'
import WeChatSelectSingle from 'components/business/WeChatSelectSingle'
import {province as provinceData} from 'wx/components/ChinaRegions/province'
import {city as cityData} from 'wx/components/ChinaRegions/city'
import TagSelect from 'components/business/TagSelect'
import API from 'wx/common/api/friends/friends'
import Helper from 'wx/utils/helper'
import styles from './index.scss'
import DivideSelect from 'components/business/DivideSelect'

const FormItem = Form.Item
const Option = Select.Option

const {DateFormat} = config

@connect(({loading}) => ({
    taskIdLoading: loading.effects['wx_friends/exportTask'],
}))
class Search extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            params: {},
            exportLoading: false,
        }
        this.timer = 0
    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
        clearTimeout(this.timer)
        this.resetParams()
    }


    handleSearch = () => {
        let params = {...this.props.wx_friends.params}
        let wechat = {...params.wechat}
        wechat.province = wechat.province_id && wechat.province_id !=='0'
            ? provinceData.find((item)=>{return item.id === wechat.province_id }).name : wechat.province_id === '0' ? undefined : ''
        wechat.city = wechat.city === '0' ? undefined : wechat.city
        params.wechat = wechat

        this.props.dispatch({
            type: 'wx_friends/setParams',
            payload: {
                params: params
            },
        })
        setTimeout(() => {
            this.props.onSearch()
        }, 0)

    }

    handleChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_friends.params}
        if (key === 'department_id' || key === 'user_id') {
            params[key] = val
            if (key === 'department_id') {
                params['user_id'] = undefined
                params['service_wx_id'] = undefined
            } else if (key === 'user_id') {
                params['service_wx_id'] = undefined
            }
        } else {
            params[key] = val
        }
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {params: params},
        })
    }

    handleWeChatChange = (key, e) => {
        let val = ''
        if (e && e.target) {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.wx_friends.params}
        let {filterDelete} = this.props.wx_friends

        let wechat = params.wechat || {}
        if (key === 'is_delete') {
            let values = {}
            values.is_delete = val === '' ? '' : !!val
            if (filterDelete) {
                values.is_block = true
            } else {
                values.is_block = undefined
            }
            wechat = {...wechat, ...values}
        } else if (key === 'province_id') {
            //切换省份清除地市
            if (val !== wechat.province_id) {
                if (val === '') { // 未知
                    wechat.city = ''
                } else { // 全部
                    wechat.city = '0'
                }
            }
            wechat['province_id'] = val
        } else {
            wechat[key] = val
        }
        params = {...params, ...{wechat: wechat}}
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {params: params},
        })
    }

    handleCheckChange = (e) => {
        // 只显示被对方删除的好友
        let params = {...this.props.wx_friends.params}
        let wechat = {...params.wechat}
        let checked = e.target.checked
        if (checked) {
            wechat.is_block = true
        } else {
            wechat.is_block = undefined
        }
        params.wechat = wechat
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {
                params: params,
                filterDelete: e.target.checked
            }
        })
        setTimeout(()=>{
            this.handleSearch()
        }, 0)
    }

    handleExport = () => {
        this.getExportId()
    }

    getExportBody = () => {
        const body = _.cloneDeep(this.props.wx_friends.searchParams)
        if (body.hasOwnProperty('offset')) {
            delete body['offset']
        }
        if (body.hasOwnProperty('limit')) {
            delete body['limit']
        }
        return body
    }

    getExportId = () => {
        const body = this.getExportBody()
        this.props.dispatch({
            type: 'wx_friends/exportTask',
            payload: {body},
            callback: (data) => {
                this.setState({exportLoading: true})
                this.getExportStatus(data.task_id)
            }
        })
    }

    getExportStatus = (taskId) => {
        this.props.dispatch({
            type: 'wx_friends/exportStatus',
            payload: {taskId},
            callback: (response) => {
                if (this._isMounted) {
                    if (response.status >= 200 && response.status < 300) {
                        response.json().then((res) => {
                            if (res.data.status) {
                                this.setState({exportLoading: false})
                                this.exportExcel(taskId)
                            } else {
                                this.timer = setTimeout(() => {
                                    this.getExportStatus(taskId)
                                }, 1000)
                            }
                        }).catch((err) => {
                            console.error(err)
                            this.setState({exportLoading: false})
                        })
                    } else {
                        this.setState({exportLoading: false})
                    }
                }
            }
        })
    }

    exportExcel = (taskId) => {
        const url = Helper.format(API.exportExcel.url, {task_id: taskId})
        let a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'wx_friends/resetParams',
        })
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {
                filterDelete: false
            }
        })
    }

    resetSortedInfo = () => {
        this.props.dispatch({
            type: 'wx_friends/setProperty',
            payload: {
                sortedInfo: null
            }
        })
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.handleSearch()
            this.resetSortedInfo()
        }, 0)
    }

    render() {
        const {params, filterDelete, divideOptionsHasAll} = this.props.wx_friends
        const {base:{initData}, taskIdLoading} = this.props
        const {exportLoading} = this.state
        const formItemLayout = {
            labelCol: {span: 8},
            wrapperCol: {span: 16},
        }

        // 省市
        let provinceOptions = []
        provinceData.forEach((province) => {
            provinceOptions.push(<Option key={province.id} value={province.id}>{province.name}</Option>)
        })
        let cityOptions = [], _cities = []
        if (params.wechat.province_id && params.wechat.province_id !== '0') {
            _cities = cityData[params.wechat.province_id]
        }
        _cities.map(city => {
            return cityOptions.push(<Option key={city.name} value={city.name}>{city.name}</Option>)
        })

        const userType = initData && initData.user && initData.user.type

        return (
            <div>
                <Form className={styles.searchWrap}>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout}
                                      label="搜索："
                                      colon={false}
                            >
                                <Input onChange={(e) => {
                                    this.handleWeChatChange('query', e)
                                }}
                                       value={params.wechat.query}
                                       onPressEnter={this.handleSearch}
                                       placeholder="输入昵称、备注或微信号"/>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="客户资料：" colon={false}>
                                <Input placeholder="输入姓名、手机号" value={params.query}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleChange('query', e)}}/>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属部门：" colon={false}>
                                <DepartmentSelect
                                    departmentId={params.department_id}
                                    onChange={(value) => {
                                        this.handleChange('department_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属员工：" colon={false}>
                                <UserSelect
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    onChange={(value) => {
                                        this.handleChange('user_id', value)
                                    }}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="所属微信：" colon={false}>
                                <WeChatSelectSingle
                                    departmentId={params.department_id}
                                    userId={params.user_id}
                                    field="username"
                                    username={params.service_wx_id}
                                    onChange={(value)=>{this.handleChange('service_wx_id', value)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="性别：" colon={false}>
                                <Select placeholder="全部[性别]" value={params.wechat.sex}
                                        onChange={(e)=>{this.handleWeChatChange('sex', e)}}>
                                    <Option value="">全部[性别]</Option>
                                    <Option value={1}>男</Option>
                                    <Option value={2}>女</Option>
                                    <Option value={0}>未知</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="包含标签：" colon={false} className={styles.tagForm}>
                                <TagSelect placeholder="包含标签"
                                           values={params.tag && params.tag || []}
                                           onChange={(e)=>this.handleChange('tag', e)}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="不包含标签：" colon={false} className={styles.tagForm}>
                                <TagSelect placeholder="不包含标签"
                                           values={params.exclude_tag && params.exclude_tag || []}
                                           onChange={(e)=>{this.handleChange('exclude_tag', e)}}
                                />
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="来源："
                                      colon={false}>
                                <Select placeholder="全部来源"
                                        value={params.wechat.source}
                                        onChange={(e) => {
                                            this.handleWeChatChange('source', e)
                                        }}>
                                    <Option value="">全部来源</Option>
                                    <Option value={15}>通过搜索手机号添加</Option>
                                    <Option value={1000015}>对方通过搜索手机号添加</Option>
                                    <Option value={3}>通过搜索微信号添加</Option>
                                    <Option value={1000003}>对方通过搜索微信号添加</Option>
                                    <Option value={8}>通过群聊添加</Option>
                                    <Option value={1000014}>对方通过群聊添加</Option>
                                    <Option value={13}>通过手机通讯录添加</Option>
                                    <Option value={1000013}>对方通过手机通讯录添加</Option>
                                    <Option value={30}>通过扫一扫添加</Option>
                                    <Option value={1000030}>对方通过扫一扫添加</Option>
                                    <Option value={1}>通过搜索QQ号添加</Option>
                                    <Option value={1000001}>对方通过搜索QQ号添加</Option>
                                    <Option value={17}>通过名片分享添加</Option>
                                    <Option value={1000017}>对方通过名片分享添加</Option>
                                    <Option value={18}>通过附近的人添加</Option>
                                    <Option value={1000018}>对方通过附近的人添加</Option>
                                    <Option value={4}>来自QQ好友</Option>
                                    <Option value={29}>通过摇一摇添加</Option>
                                    <Option value={1000029}>对方通过摇一摇添加</Option>
                                    <Option value={48}>雷达</Option>
                                    <Option value={25}>通过漂流瓶添加</Option>
                                    <Option value={1000025}>对方通过漂流瓶添加</Option>
                                    <Option value={0}>未知</Option>
                                </Select>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="状态："
                                      colon={false}>
                                <Select placeholder="全部状态"
                                        value={params.wechat.is_delete === '' ? '' : (params.wechat.is_delete ? 1 : 0)}
                                        onChange={(e) => {
                                            this.handleWeChatChange('is_delete', e)
                                        }}>
                                    <Option value="">全部【状态】</Option>
                                    <Option value={0}>正常</Option>
                                    <Option value={1}>已删除</Option>
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="备注：" colon={false}>
                                <Input placeholder="包含备注" value={params.wechat.remark}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleWeChatChange('remark', e)}}/>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="不包含备注：" colon={false}>
                                <Input placeholder="不包含备注" value={params.wechat.exclude_remark}
                                       onPressEnter={this.handleSearch}
                                       onChange={(e)=>{this.handleWeChatChange('exclude_remark', e)}}/>
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="省：" colon={false}>
                                <Select defaultValue="0"
                                        value={params.wechat.province_id}
                                        onChange={(e)=>{this.handleWeChatChange('province_id', e)}}>
                                    <Option value="0">全部[省份]</Option>
                                    <Option value="">未知</Option>
                                    {provinceOptions}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="市：" colon={false}>
                                <Select defaultValue="0"
                                        value={params.wechat.city === undefined ? '0' : params.wechat.city}
                                        onChange={(e)=>{this.handleWeChatChange('city', e)}}>
                                    {params.wechat.province_id !== '' ? <Option value="0">全部[城市]</Option> : ''}
                                    {params.wechat.province_id !== '0' ? <Option value="">未知</Option> : ''}
                                    {cityOptions}
                                </Select>
                            </FormItem>
                        </Col>
                        <Col span={7}>
                            <FormItem {...formItemLayout} label="分组：" colon={false}>
                                <DivideSelect
                                    placeholder='全部分组'
                                    cls={styles.divideSelect}
                                    selectedId={params.group_id}
                                    data={divideOptionsHasAll}
                                    onChange={(value) => {this.handleChange('group_id', value)}}
                                />
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
                        <Col span={7}>
                            <Checkbox checked={filterDelete} onChange={this.handleCheckChange} className={styles.filterDelete}>只显示被对方删除的好友
                                <Popover placement="bottomLeft" style={{left: '-5px'}}
                                         content={<div
                                             style={{width: '200px'}}>
                                             <p>被对方删除后，给对方发送过消息，就会自动记录"被对方删除"；</p>
                                             <p>如果被对方删除后，未发送过消息，不会被标识为"被对方删除"</p>
                                         </div>}>
                                    <Icon className={styles.questionCircle} type="question-circle-o"/>
                                </Popover>
                            </Checkbox>
                        </Col>
                    </Row>
                </Form>
                <div className={styles.addition}>
                    {
                        userType === 1 ?  <div className={styles.right}>
                            <Button className={styles.export} icon={taskIdLoading || exportLoading ? "loading" : null}
                                    onClick={this.handleExport}
                                    disabled={taskIdLoading || exportLoading}
                            >导出数据</Button>
                        </div> : null
                    }
                </div>
            </div>)
    }
}

export default Form.create()(Search)
