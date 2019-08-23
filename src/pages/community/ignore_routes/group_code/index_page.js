/**
 * @Description
 * @author XuMengPeng
 * @date 2018/12/18
 */
import React, {PureComponent} from 'react'
import { Form, Input, Button, Row, Col, Table, Pagination, Modal, Switch, Icon, InputNumber, Select, Popover } from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import moment from 'moment'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import config from 'community/common/config'
import DateRange from 'components/DateRange'
import EllipsisPopover from 'components/EllipsisPopover'
import _ from 'lodash'
import {hot} from "react-hot-loader"
import {message} from "antd/lib/index"
import { CopyToClipboard } from 'react-copy-to-clipboard'
import apiHostConfig from 'community/config'
import ContentHeader from 'business/ContentHeader'
import GroupSetting from 'community/components/GroupSetting'

const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
const {pageSizeOptions, DateTimeFormat, DateFormat} = config
const domains = ['public.51zan.com', 'personal.niukefu.com']
const {mobileWebDomain} = apiHostConfig

@hot(module)
@connect(({base, community_groupCode, loading}) => ({
    base,
    community_groupCode,
    queryLoading: loading.effects['community_groupCode/query'],
    switchLoading: loading.effects['community_groupCode/switchActivityStatus'],
    qrSettingLoading: loading.effects['community_groupCode/qrSetting'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isShowModal: false,
            record: null, // 操作的rocord
            isShowCode: false,
            isShowAbnormalCode: false,
            isShowCodeSetting: false,
            sortedInfo: {
                order: 'descend',
                columnKey: 'create_at',
            }, // 默认创建时间降序
        }
    }

    componentDidMount() {
        console.log(mobileWebDomain)
        this.props.dispatch({
            type: 'community_groupCode/queryActivityTop',
        })
        this.goPage(1)
    };

    componentWillUnmount() {
        this.resetParams()
    }

    handleSearch = () => {
        this.goPage(1)
    }

    handleChange = (key, e) => {
        let val = ''
        if (key === 'key') {
            val = e.target.value
        } else {
            val = e
        }
        let params = {...this.props.community_groupCode.params}
        params[key] = val
        this.props.dispatch({
            type: 'community_groupCode/setParams',
            payload: {
                params: params,
            },
        })
    }

    handleChangeSize = (current, size) => {
        let params = {...this.props.community_groupCode.params}
        params.limit = size
        this.props.dispatch({
            type: 'community_groupCode/setProperty',
            payload: {params: params},
        })
        this.goPage(1) // 重置个数时回到首页
    }

    goPage = (page) => {
        this.props.dispatch({
            type: 'community_groupCode/query',
            payload: {page: page},
        })
    }

    resetParams = () => {
        this.props.dispatch({
            type: 'community_groupCode/resetParams',
        })
        this.executeTime.setDate(null, null)
    }

    resetSearch = () => {
        this.resetParams()
        setTimeout(() => {
            this.goPage(1)
            this.resetSortedInfo()
        }, 0)
    }

    showCode = (record) => {
        this.setState({
            isShowCode: true,
            record: record,
        })
    }
    handleCancelCode = () => {
        this.setState({
            isShowCode: false,
            record: null,
        })
    }

    showAbnormalCode = (record) => {
        this.setState({
            isShowAbnormalCode: true,
            record: record,
        })
    }
    handleCancelAbnormalCode = () => {
        this.setState({
            isShowAbnormalCode: false,
            record: null,
        })
    }

    canUseThumbLimitUrl = (url) => {
        return domains.findIndex((domain)=>{
            return url.indexOf(domain) > -1
        })
    }

    getThumbLimit = (url, size = 500) => {
        if(url) {
            if(this.canUseThumbLimitUrl(url) === -1){
                return url
            }
            let arr1 = url.split('/'), arr2 = arr1[arr1.length-1].split('.'), suffix = arr2[arr2.length-1]
            url = url.replace(/imageView2([^|]*)(\|)?/g, '')
            let separator = '?'
            if(url.indexOf('?') > -1) {
                separator = '|'
            }
            const length = url.length
            const last = url.slice(length - 1)
            if(last === "|" || last === "?") {
                separator = ''
            }
            return `${url}${separator}imageMogr2/thumbnail/${size}x${size}&attname=二维码（${size}）.${suffix}`
        }
        return url
    }

    //切换下载尺寸
    changeDownsize = (url, size) => {
        return this.getThumbLimit(url, size)
    }

    handleChangeExecuteDate = (startValue, endValue) => {
        let params = {...this.props.community_groupCode.params}
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
            type: 'community_groupCode/setParams',
            payload: {params: params}
        })
    }


    switchStatus = (record, e) => {
        this.props.dispatch({
            type: 'community_groupCode/switchActivityStatus',
            payload: {
                group_activity_id: record.id,
                body: {
                    status: e ? 1: 0
                }
            },
            callback: () => {
                this.goPage(this.props.community_groupCode.current || 1)
            }
        })
    }

    goToPage = (type, record=null) => {
        switch (type) {
            case 'add':
            case 'edit':
                router.push({
                    pathname: `/community/group_code/add_activity`,
                    state: {
                        type: type,
                        record: record
                    }
                })
                break
            case 'pageConfig':
                router.push({
                    pathname: `/community/group_code/page_config`,
                    query: {
                        id: record.id
                    }
                })
                break
            case 'groupList':
                router.push({
                    pathname: `/community/group_code/group_list`,
                    query: {
                        group_activity_id: record.id
                    },
                    state: {
                        record: record
                    }
                })
                break
            case 'chart':
                router.push({
                    pathname: `/community/group_code/activity_stat`,
                    query: {
                        group_activity_id: record.id
                    }
                })
                break

        }
    }

    showCodeSetting = (record) => {
        this.setState({
            isShowCodeSetting: true,
            record: record,
        })
        this.handleSetProperty('group_member_limit', record?.group_member_limit)
        this.handleSetProperty('group_qr_code_use_limit', record?.group_qr_code_use_limit)
    }
    codeSettingOk = () => {
        const { record } = this.state
        const { group_member_limit, group_qr_code_use_limit, current } = this.props.community_groupCode
        this.props.dispatch({
            type: 'community_groupCode/qrSetting',
            payload: {
                id: record.id,
                body: {
                    group_member_limit: group_member_limit,
                    group_qr_code_use_limit: group_qr_code_use_limit,
                }
            },
            callback: (resData) => {
                message.success('设置成功', 1)
                setTimeout(() => {
                    this.codeSettingCancel(()=>{this.goPage(current || 1)})
                }, 1000)
            }
        })
    }
    codeSettingCancel = (callback=null) => {
        this.setState({
            isShowCodeSetting: false,
            record: null,
        })
        callback && callback()
    }

    handleSetProperty = (type, val) => {
        this.props.dispatch({
            type: 'community_groupCode/setProperty',
            payload: {
                [type]: val,
            }
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        console.log('sorter:', sorter)
        const field = sorter.field || ''
        const order = sorter.order || ''
        const sortedInfo = {
            order: sorter.order,
            columnKey: sorter.field,
        }
        let params = {...this.props.community_groupCode.params}
        if (order === 'descend') {
            params['order_by'] = `-${field}`
        } else {
            params['order_by'] = field
        }
        this.props.dispatch({
            type: 'community_groupCode/query',
            payload: {
                params: params,
            },
        })
        this.setState({
            sortedInfo: sortedInfo
        })
    }

    resetSortedInfo = () => {
        this.setState({
            sortedInfo: null
        })
    }

    refresh = () => {
        const {current} = this.props.community_groupCode
        this.goPage(current || 1)
    }

    getTotalChatRoomCnt = (record) => {
        const { chatroom_cnt, chatroom_status } = record
        let innerDom = ''
        // 0 :无, 1:正常  -1:群码失效  2:即将满群'
        if(record.chatroom_status === 1) {
            innerDom = <div className={styles.normal}>{chatroom_cnt}</div>
        }else{
            innerDom = <>
                <div className={styles.abnormal}>{chatroom_cnt}</div>
                <div className={styles.remind}>
                    {
                        chatroom_status === 0 ? '请添加群': chatroom_status === -1 ? '请更新群':
                            chatroom_status === 2 ? '即将满员': ''
                    }
                </div>
            </>
        }
        return <div className={styles.groupNumWrap} onClick={() => this.goToPage('groupList', record)}>{innerDom}</div>
    }

    render() {
        const { params, total, current, list, top, group_member_limit, group_qr_code_use_limit } = this.props.community_groupCode
        const { record } = this.state
        const { switchLoading, qrSettingLoading } = this.props

        let sortedInfo = this.state.sortedInfo || {}
        const formItemLayout = { labelCol: {span: 6}, wrapperCol: {span: 16}, }
        const columns = [
            {
                title: '活动主题',
                dataIndex: 'title',
                className: styles.title,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '备注',
                dataIndex: 'remark',
                className: styles.remark,
                render: (text, record, index) => {
                    return <EllipsisPopover content={text} lines={3}/>
                },
            },
            {
                title: '活动群码',
                dataIndex: 'qrcode_url',
                className: styles.code,
                align: 'center',
                render: (text, record, index) => {
                    // 0 :无, 1:正常  -1:群码失效  2:即将满群'
                    if (record.chatroom_status === 0 || record.chatroom_status === -1) {
                        return <div onClick={() => this.showAbnormalCode(record)}>
                            <img className={styles.qrcode} src={text} alt=""/>
                        </div>
                    }else if(record.chatroom_status === 1 || record.chatroom_status === 2) {
                        return <div onClick={() => this.showCode(record)}>
                            <img className={styles.qrcode} src={text} alt=""/>
                        </div>
                    }
                },
            },
            {
                title: '群码启用',
                dataIndex: 'status',
                className: styles.status,
                render: (text, record, index) => {
                    return <Switch checkedChildren="启用" unCheckedChildren="停用" loading={switchLoading} checked={text===0? false:true} onChange={(e) => this.switchStatus(record, e)}/>
                },
            },
            {
                title: '操作',
                dataIndex: '',
                className: styles.edit,
                align: 'center',
                render: (text, record, index) => {
                    return (
                        <div>
                            <Popover
                                placement="bottom"
                                content={
                                    <div className={styles.editPopover}>
                                        <div className={styles.canEdit} onClick={() => this.goToPage('edit', record)}>编辑</div>
                                        <div className={styles.canEdit} onClick={() => this.goToPage('groupList', record)}>群列表</div>
                                        <div className={styles.canEdit} onClick={() => this.goToPage('pageConfig', record)}>页面配置</div>
                                        {/*<GroupSetting
                                            renderBtn={(setTrue) => {
                                                return (
                                                    <div
                                                        onClick={() => {
                                                            setTrue()
                                                        }}
                                                        className={styles.canEdit}
                                                    >群设置</div>
                                                )
                                            }}
                                            fetchOption={{
                                                setting_level: 500,
                                                target_id: record?.id,
                                            }}
                                            newFriendsFetchOption={{
                                                setting_level: 500,
                                                target_id: record?.id,
                                            }}
                                            autoReplyFetchOption={{
                                                setting_level: 500,
                                                target_id: record?.id,
                                            }}
                                            actionManageFetchOption={{
                                                categoryType: 1, // 0：群管理，1：群活动（用于区别哪种活动）
                                                target_id: record?.id,
                                            }}
                                            refresh={this.refresh}
                                            record={record}
                                        />*/}
                                        <div className={styles.canEdit} onClick={() => this.goToPage('chart', record)}>统计明细</div>
                                    </div>
                                }
                                title={null}
                                trigger="hover"
                                getPopupContainer={()=>document.getElementById('table')}
                            >

                                <div className={styles.canEdit}>更多<Icon type="down"></Icon></div>
                            </Popover>
                        </div>
                    )
                },
            },
            {
                title: '扫码设置',
                dataIndex: 'group_member_limit',
                className: styles.codeSetting,
                render: (text, record, index) => {
                    return <div>
                        <div>单群人数：{record?.group_member_limit}</div>
                        <div>扫码次数：{record?.group_qr_code_use_limit}</div>
                        <div className={styles.canEdit} onClick={() => this.showCodeSetting(record)}>编辑</div>
                    </div>
                },
            },
            {
                title: '总群数',
                dataIndex: 'chatroom_cnt',
                className: styles.groupNum,
                render: (text, record, index) => {
                    return this.getTotalChatRoomCnt(record)
                },
            },
            {
                title: '可用群',
                dataIndex: 'available_chatroom_count',
                className: styles.availableChatroomCount,
                render: (text, record, index) => {
                    return text > 0 ? text : <span style={{color: '#F00'}}>{text}</span>
                },
            },
            {
                title: '不可用群',
                dataIndex: 'unavailable_chatroom_count',
                className: styles.unAvailableChatroomCount,
                render: (text, record, index) => {
                    return (text + record.unusual_chatroom_count) > 0 ? text : <span style={{color: '#F00'}}>{text}</span>
                },
            },
            {
                title: '群成员数',
                dataIndex: 'member_total_count',
                className: styles.groupMembersNum,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '总进群人数',
                dataIndex: 'total_in_cnt',
                className: styles.comeInMembers,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '活码展示次数',
                dataIndex: 'qrcode_show_count',
                className: styles.codeShowTimes,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'qrcode_show_count' && sortedInfo.order,
                render: (text, record, index) => {
                    return <span className={styles.num} onClick={() => this.goToPage('chart', record)}>{text}</span>
                },
            },
            {
                title: '创建人',
                dataIndex: 'operator_user_name',
                className: styles.owner,
                render: (text, record, index) => {
                    return <span>{text}</span>
                },
            },
            {
                title: '创建时间',
                dataIndex: 'create_at',
                className: styles.create_time,
                sorter: true,
                sortOrder: sortedInfo.columnKey === 'create_at' && sortedInfo.order,
                render: (text, record, index) => {
                    if(text) {
                        return moment(text * 1000).format(DateTimeFormat)
                    }
                    return ''
                },
            },
        ]

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E7%BE%A4%E6%B4%BB%E5%8A%A8.md',
                    }}
                />
                <div className={styles.groupCode}>
                    <div className={styles.header}>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_group_activity_count}</div>
                            <div>总活动数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_chatroom_count}</div>
                            <div>总群数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_group_member_count}</div>
                            <div>总群员数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_in_cnt}</div>
                            <div>总进群人数</div>
                        </div>
                        <div className={styles.headerItem}>
                            <div className={styles.num}>{top?.total_group_code_show_count}</div>
                            <div>活码展示次数</div>
                        </div>
                    </div>
                    <div className={styles.searchWrap}>
                        <Form onSubmit={this.handleSubmit} className="ant-advanced-search-form">
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="搜索：" colon={false} >
                                        <Input placeholder="输入活动主题、备注" value={params.key} onChange={(e) => this.handleChange('key', e)} />
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="群码启用：" colon={false}>
                                        <Select placeholder='全部' value={params.status} onChange={(e)=>{this.handleChange('status', e)}}>
                                            <Option value={undefined}>全部</Option>
                                            <Option value={0}>停用</Option>
                                            <Option value={1}>启用</Option>
                                        </Select>
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20}>
                                <Col span={12}>
                                    <FormItem {...formItemLayout} label="创建时间：" colon={false}>
                                        <DateRange
                                            ref={(node) => this.executeTime = node}
                                            startPlaceholder="不限"
                                            endPlaceholder="不限"
                                            startValue={params.start_time ? moment(params.start_time, DateFormat) : ''}
                                            endValue={params.end_time ? moment(params.end_time, DateFormat) : ''}
                                            onChange={this.handleChangeExecuteDate}
                                        />
                                    </FormItem>
                                </Col>
                            </Row>
                            <Row gutter={20} className={styles.operateBtn}>
                                <Col span={12}>
                                    <Col offset={6}>
                                        <Button type="primary" icon="search" onClick={this.handleSearch}>搜索</Button>
                                        <Button onClick={this.resetSearch}>重置</Button>
                                    </Col>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    <div className={styles.addActivity}>
                        <Button type="primary" onClick={() => this.goToPage('add')}>新建活动</Button>
                        <div className={styles.totalStatus}>
                            <div className={styles.statusItem}>
                                <div className={styles.num}>{top?.total_status_on_count}</div>
                                <div>启用</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={styles.num}>{top?.total_status_off_count}</div>
                                <div>停用</div>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={`${styles.num} ${styles.red}`}>{top?.total_status_unusual_count}</div>
                                <div>异常</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.tableWrap} id="table">
                        <Table
                            columns={columns}
                            dataSource={list}
                            size="middle"
                            rowKey={(record, index) => index}
                            pagination={false}
                            loading={this.props.queryLoading}
                            scroll={{x: 1600}}
                            onChange={this.handleTableChange}
                        />
                    </div>
                    {list.length ? (
                        <Pagination
                            className="ant-table-pagination"
                            total={total}
                            current={current}
                            showQuickJumper={true}
                            pageSizeOptions={pageSizeOptions}
                            showTotal={total => `共 ${total} 条`}
                            pageSize={params.limit}
                            showSizeChanger={true}
                            onShowSizeChange={this.handleChangeSize}
                            onChange={this.goPage}
                        />
                    ) : (
                        ''
                    )}
                </div>

                <Modal
                    title="二维码推广"
                    visible={this.state.isShowCode}
                    footer={null}
                    width={1000}
                    onCancel={this.handleCancelCode}
                >
                    <div className={styles.codeModal}>
                        <div className={styles.modalLeft}>
                            <img src={record?.qrcode_url} alt=""/>
                        </div>
                        <div className={styles.modalRight}>
                            <div className={styles.inputWrap}>
                                复制短链接：<Input readOnly value={`${mobileWebDomain}/web_h5/group_code?group_activity_id=${record?.id}`} />
                                <CopyToClipboard
                                    text={`${mobileWebDomain}/web_h5/group_code?group_activity_id=${record?.id}`}
                                    onCopy={() => {
                                        message.success('复制链接成功！')
                                    }}
                                >
                                    <Button type="primary">复制</Button>
                                </CopyToClipboard>
                            </div>
                            <div className={styles.showDownloadType}>
                                <Row className={styles.mb10}>
                                    <Col span={4} className={styles.downsizeText}>小尺寸</Col>
                                    <Col span={16}>
                                        <div>适用于屏幕类，宣传册类</div>
                                        <div>边长8cm（258*258px）</div>
                                    </Col>
                                    <Col span={4}>
                                        <a href={this.changeDownsize(record?.qrcode_url, 258)} rel="noopener noreferrer" target="_blank" download="图片">
                                            <Icon type="download" theme="outlined" className={styles.downloadIcon} />
                                        </a>
                                    </Col>
                                </Row>
                                <Row className={styles.mb10}>
                                    <Col span={4} className={styles.downsizeText}>中尺寸</Col>
                                    <Col span={16}>
                                        <div>适用于海报，展架等</div>
                                        <div>边长15cm（430*430px）</div>
                                    </Col>
                                    <Col span={4}>
                                        <a href={this.changeDownsize(record?.qrcode_url, 430)} rel="noopener noreferrer" target="_blank" download="图片">
                                            <Icon type="download" theme="outlined" className={styles.downloadIcon} />
                                        </a>
                                    </Col>
                                </Row>
                                <Row className={styles.mb10}>
                                    <Col span={4} className={styles.downsizeText}>大尺寸</Col>
                                    <Col span={16}>
                                        <div>适用于幕布，大型广告等</div>
                                        <div>边长50cm（1417*1417px）</div>
                                    </Col>
                                    <Col span={4}>
                                        <a href={this.changeDownsize(record?.qrcode_url, 1417)} rel="noopener noreferrer" target="_blank" download="图片">
                                            <Icon type="download" theme="outlined" className={styles.downloadIcon} />
                                        </a>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    title="二维码推广"
                    visible={this.state.isShowAbnormalCode}
                    width={500}
                    onOk={() => this.goToPage('groupList', record)}
                    onCancel={this.handleCancelAbnormalCode}
                    okText='前往设置'
                >
                    <div className={styles.abnormalCodeModal}>
                        <div className={styles.abnormalCodeLeft}>
                            <img src={record?.qrcode_url} alt=""/>
                            <div className={styles.imgMask}></div>
                        </div>
                        <div className={styles.abnormalCodeRight}>
                            <div>群活动二维码<span style={{color: '#f00'}}>{record?.chatroom_status === 0 ? '未添加': record?.chatroom_status === -1 ? '已失效': ''}</span>，请前往群列表设置</div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    title="扫码设置"
                    visible={this.state.isShowCodeSetting}
                    width={500}
                    onOk={this.codeSettingOk}
                    onCancel={() => this.codeSettingCancel()}
                    okButtonProps={{loading: qrSettingLoading}}
                >
                    <div className={styles.codeSettingModal}>
                        <div className={styles.setItem}>
                            <div className={styles.txt}>单群人数设置：</div>
                            <InputNumber min={10} max={95} value={group_member_limit} onChange={(e) => this.handleSetProperty('group_member_limit', e)} step={5} />
                        </div>
                        <div className={styles.desc}>设置范围：（10~95）每个群的成员数达到设置上限，将自动切换到下一个群二维码</div>
                        <div className={styles.setItem}>
                            <div className={styles.txt}>扫码次数设置：</div>
                            <InputNumber min={50} max={500} value={group_qr_code_use_limit} onChange={(e) => this.handleSetProperty('group_qr_code_use_limit', e)} step={10} />
                        </div>
                        <div className={styles.desc}>设置范围：（50~500）每个群的二维码扫码次数上限，达到上限后，将自动切换到下一个群二维码</div>
                    </div>
                </Modal>
            </div>
        )
    }
}
