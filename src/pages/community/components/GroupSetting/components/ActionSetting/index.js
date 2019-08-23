import React from 'react'
import { Checkbox, Button , InputNumber, Form, Radio, Input, Row, Col, Switch, Icon, message, Spin, Select, Upload } from 'antd'
import {connect} from 'dva'
import _ from "lodash"
import EllipsisPopover from 'components/EllipsisPopover'
import styles from './index.less'
import qs from 'qs'
import moment from 'moment'
import config from 'community/common/config'
import API from 'community/common/api/groupSetting/actionManage'


const {DateFormat} = config
const LINK_WHITELIST_TYPE = {
    domain: 'link_domain_whitelist',
    noDomain: 'link_whitelist',
}

const FormItem = Form.Item
const RadioGroup = Radio.Group
const Option = Select.Option

@connect(({base, community_groupSetting_actionManage, loading}) => ({
    base, community_groupSetting_actionManage,
    queryLoading: loading.effects['community_groupSetting_actionManage/query'],
    updateLoading: loading.effects['community_groupSetting_actionManage/update'],
    getActionSettingStateLoading: loading.effects['community_groupSetting_actionManage/getActionSettingState'],
    setActionSettingStateLoading: loading.effects['community_groupSetting_actionManage/setActionSettingState'],
}))
export default class extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isEditKickMsg: false, // 显示踢群消息
            isViolationsMsg: false, // 显示违规消息

            editKickMsg: '', // 以下input编辑
            editSensitiveMsg: '',
            editViolationsMsg: '',
            editLinkWebsiteMsg: '', // “链接”中的白名单input值
            editSPWebsiteMsg: '', // “小程序”中的白名单input值
            editSPWebsiteRemark: '', // “小程序”中的备注-input值

            activeItem: 'msgSensitiveWord', // 控制选中的配置

            importFileList: [],
            isImportUpload: false, // 消息敏感词的导入loading
            isExportLoading: false, // 消息敏导出的loading

            linkWhitelistType: LINK_WHITELIST_TYPE.domain, //  全域名 / 单链接

            fetchOption: null, // get/set行为管理的接口参数
        }
    }

    componentDidMount() {
        console.log('props', this.props)
        this.loadPage()
    };

    componentWillUnmount() {
        const { props } = this
        props.dispatch({
            type: 'community_groupSetting_actionManage/setProperty',
            payload: {
                editKickMsg: undefined
            }
        })
    }

    getFetchOption = (use_custom) => {
        const { categoryType, chatroom_id, target_id } = this.props.actionManageFetchOption
        let fetchOptionTemp = {}
        if(categoryType === 0) { // 群管理
            if(use_custom === 0) { // 全局
                fetchOptionTemp = {
                    setting_level: 0
                }
            }else{// use_custom === 1，单群
                fetchOptionTemp = {
                    setting_level: 1,
                    chatroom_id
                }
            }
        }
        if(categoryType === 1) { // 群活动
            fetchOptionTemp = {
                setting_level: 2,
                target_id
            }
        }
        this.setState({
            fetchOption: {...fetchOptionTemp}
        })
        return fetchOptionTemp
    }

    loadPage = () => {
        const { categoryType } = this.props.actionManageFetchOption
        if(categoryType === 0) { // 群管理
            const { chatroom_id } = this.props.actionManageFetchOption
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/getActionSettingState',
                payload: {
                    chatroom_name: chatroom_id
                },
                callback: () => {
                    const { use_custom } = this.props.community_groupSetting_actionManage
                    let fetchOptionTemp = this.getFetchOption(use_custom)
                    this.props.dispatch({ // 获取行为管理数据
                        type: 'community_groupSetting_actionManage/query',
                        payload: {
                            params: {
                                ...fetchOptionTemp
                            },
                        }
                    })
                }
            })
        }
        if(categoryType === 1) { // 群活动
            let fetchOptionTemp = this.getFetchOption()
            this.props.dispatch({ // 获取行为管理数据
                type: 'community_groupSetting_actionManage/query',
                payload: {
                    params: {
                        ...fetchOptionTemp
                    },
                }
            })
        }

    }

    handleChange = (type, e) => {
        const { fetchOption } = this.state
        let val = ''
        if( type.includes('isKickAfterWarning') || type.includes('isRefer') || type.includes('isAmbush') ) {
            val = e.target.checked ? 1: 0
        }else{
            val = e ? 1: 0
        }
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/update',
            payload: {
                body: {
                    [type]: val,
                    ...fetchOption,
                },
            },
            callback: () => {
                if(!type.includes('isKickAfterWarning') && !type.includes('isRefer') && !type.includes('isAmbush')) {
                    val === 1 ? message.success('启用成功', 1): message.warning('禁用成功', 1)
                }
            }
        })
    }

    handleInputChange = (type, e) => {
        let val = e.target.value
        if(type === 'editSensitiveMsg'){ // 敏感词输入
            val = val.replace(/,/g, '')
        }
        this.setState({
            [type]: val
        })
    }

    handleLinkWhitelistChange = (type, e, linkWhitelistType) => {
        let val = e.target.value
        if(linkWhitelistType === LINK_WHITELIST_TYPE.domain) {
            val = val.replace(/http(s)?:\/\//gi, '')
        }
        this.setState({
            [type]: val
        })
    }

    toggleEditKickMsg = () => {
        const value = this.state.isEditKickMsg
        this.setState({
            isEditKickMsg: !value
        })
    }

    toggleEditViolationsMsg = () => {
        const value = this.state.isViolationsMsg
        this.setState({
            isViolationsMsg: !value
        })
    }


    saveKickMsg = () => {
        const { editKickMsg } = this.state
        const { fetchOption } = this.state
        const str = this.filterSpace(editKickMsg)
        if(!str) {
            message.warn('请输入警告文字')
        }else{
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/update',
                payload: {
                    body: {
                        kickMsg: str,
                        ...fetchOption,
                    },
                },
                callback: () => {
                    this.toggleEditKickMsg()
                    this.setState({
                        editKickMsg: ''
                    })
                }
            })
        }
    }

    saveViolationsMsg = (key) => {
        const { editViolationsMsg } = this.state
        const { fetchOption } = this.state
        const str = this.filterSpace(editViolationsMsg)
        if(!str) {
            message.warn('请输入警告文字')
        }else{
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/update',
                payload: {
                    body: {
                        [key]: str,
                        ...fetchOption,
                    },
                },
                callback: () => {
                    this.toggleEditViolationsMsg()
                    this.setState({
                        editViolationsMsg: ''
                    })
                }
            })
        }
    }

    filterSpace = (str) => {
        return str && str.replace(/(^\s*)|(\s*$)/g,"")
    }

    saveSensitiveMsg = (key) => {
        const { editSensitiveMsg } = this.state
        const { fetchOption } = this.state
        const localSensitiveWords = this.props.community_groupSetting_actionManage[`${key}_localSensitiveWords`]
        const str = this.filterSpace(editSensitiveMsg)
        if(!str) {
            message.warn('请输入敏感词')
        }else{
            localSensitiveWords.push(str)
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/update',
                payload: {
                    body: {
                        [`${key}_sensitiveWords`]: localSensitiveWords.join(','),
                        ...fetchOption,
                    },
                },
                callback: () => {
                    this.setState({
                        editSensitiveMsg: ''
                    })
                }
            })
        }
    }
    deleteTag = (key, item) => {
        const { fetchOption } = this.state
        const localSensitiveWords = this.props.community_groupSetting_actionManage[`${key}_localSensitiveWords`]
        _.remove(localSensitiveWords, (n) => { return n === item })
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/update',
            payload: {
                body: {
                    [`${key}_sensitiveWords`]: localSensitiveWords.join(','),
                    ...fetchOption,
                },
            }
        })
    }

    isDomainReg = (domain) => {
        const reg = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
        return reg.test(domain)
    }
    isWebsite = (website) => {
        const reg = /(((?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
        return reg.test(website)
    }
    saveLinkWhitelist = (type) => { // 支持“链接”中2个白名单的添加
        const { editLinkWebsiteMsg, fetchOption } = this.state
        let isDomain = type === LINK_WHITELIST_TYPE.domain
        let locakPropertyName = isDomain ? `link_localDomainWhitelist` : `link_localWhitelist`
        let propertyName = isDomain ? `link_domainWhitelist` : `link_whitelist`
        const newLocal = this.props.community_groupSetting_actionManage[locakPropertyName]
        const str = this.filterSpace(editLinkWebsiteMsg)

        if(!str) {
            message.warn('请输入地址')
        }else if( (!isDomain && !this.isWebsite(str)) || (isDomain && !this.isDomainReg(str)) ) {
            message.warn('输入地址格式不正确')
        } else{
            if(newLocal.findIndex((item) => item === str) > -1) {
                message.warn('该地址已存在')
                return
            }
            newLocal.push(str)
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/update',
                payload: {
                    body: {
                        [propertyName]: newLocal.join(','),
                        ...fetchOption,
                    }
                },
                callback: () => {
                    this.setState({
                        editLinkWebsiteMsg: ''
                    })
                }
            })
        }
    }
    deleteLinkWhitelist = (type, item) => { // 支持“链接”中2个白名单的删除
        const { fetchOption } = this.state
        let locakPropertyName = type === LINK_WHITELIST_TYPE.domain ? `link_localDomainWhitelist` : `link_localWhitelist`
        let propertyName = type === LINK_WHITELIST_TYPE.domain ? `link_domainWhitelist` : `link_whitelist`
        const newLocal = this.props.community_groupSetting_actionManage[locakPropertyName]
        _.remove(newLocal, (n) => { return n === item })
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/update',
            payload: {
                body: {
                    [propertyName]: newLocal.join(','),
                    ...fetchOption,
                }
            }
        })
    }


    isAppidReg = (appid) => {
        const reg = /^wx[0-9a-fA-F]{16}$/
        return reg.test(appid)
    }
    saveSPWhitelist = () => { // “小程序”中白名单的添加
        const { editSPWebsiteMsg, editSPWebsiteRemark } = this.state
        const { fetchOption } = this.state
        const newLocal = this.props.community_groupSetting_actionManage['smallProgram_localDomainWhitelist']
        const appid = this.filterSpace(editSPWebsiteMsg), remark = this.filterSpace(editSPWebsiteRemark)

        if(!appid) {
            message.warn('请输入小程序AppID')
        }else if(!this.isAppidReg(appid)) {
            message.warn('输入小程序AppID格式不正确')
        }else if(!remark) {
            message.warn('请输入小程序AppID的备注')
        } else{
            if(newLocal.findIndex((item) => item?.split('-')[0] === appid) > -1) {
                message.warn('该小程序AppID已存在')
                return
            }
            newLocal.push(`${appid}-${remark}`)
            this.props.dispatch({
                type: 'community_groupSetting_actionManage/update',
                payload: {
                    body: {
                        smallProgram_domainWhitelist: newLocal.join(','),
                        ...fetchOption,
                    }
                },
                callback: () => {
                    this.setState({
                        editSPWebsiteMsg: '',
                        editSPWebsiteRemark: '',
                    })
                }
            })
        }
    }
    deleteSPWhitelist = (item) => { // “小程序”中白名单的删除
        const { fetchOption } = this.state
        const newLocal = this.props.community_groupSetting_actionManage['smallProgram_localDomainWhitelist']
        _.remove(newLocal, (n) => { return n === item })
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/update',
            payload: {
                body: {
                    smallProgram_domainWhitelist: newLocal.join(','),
                    ...fetchOption,
                }
            }
        })
    }

    handleConfigItem = (key) => {
        this.setState({
            activeItem: key,
            isViolationsMsg: false,
            editViolationsMsg: '',
        })
    }

    inputNumberChange = (key, e) => {
        const { fetchOption } = this.state
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/update',
            payload: {
                body: {
                    [key]: e,
                    ...fetchOption,
                },
            }
        })
    }

    exportExcel = () => {
        const { fetchOption } = this.state
        this.setState({isExportLoading: true})
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/exportExcel',
            payload: {
                params: { // 敏感词导出区分：全局:0 单群:1 群活动:2 群分组:3（通过query参数带入）
                    ...fetchOption,
                }
            },
            callback: (res) => {
                if (res.status >= 200 && res.status < 300) {
                    res.text().then((r) => {
                        this.setState({isExportLoading: false})
                        const blob = new Blob(['\uFEFF' + r], {type: 'text/csv'})
                        const url = URL.createObjectURL(blob)
                        let a = document.createElement('a')
                        a.download = `消息敏感词${moment().format(DateFormat)}.csv`
                        a.href = url
                        a.style.display = 'none'
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                    })
                } else {
                    this.setState({isExportLoading: false})
                }
            }
        })
    }

    linkWhitelistChange = (e) => {
        this.setState({
            linkWhitelistType: e,
        })
    }

    // 获取公共的开关内容
    getConfigSwitchs = () => {
        const { community_groupSetting_actionManage: storeState } = this.props
        const { activeItem } = this.state
        return  Object.keys(storeState).map((item) => {
            if(item === 'msgSensitiveWord') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>消息敏感词</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            /*if(item === 'nicknameSensitiveWord') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>群成员昵称以及群昵称敏感词</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }*/
            if(item === 'card') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>发送公众号名片/个人号名片</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            if(item === 'link') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>发送链接分享</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            if(item === 'smallProgram') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>发送小程序</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            if(item === 'video') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>发送小视频</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            if(item === 'harassment') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>防骚扰</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
            if(item === 'lockGroupName') {
                return <div
                    className={`${styles.configItem} ${activeItem===item ? styles.active: ''}`}
                    key={item}
                    onClick={() => this.handleConfigItem(item)}
                >
                    <div className={styles.left}>群名锁定禁止修改</div>
                    <Switch checkedChildren="开" unCheckedChildren="关" checked={!!storeState[item]} onChange={(e) => this.handleChange(item, e)} />
                </div>
            }
        })
    }

    // 获取公共的配置内容
    getConfigContPublic = (key) => {
        const state = this.props.community_groupSetting_actionManage
        const { isViolationsMsg, editViolationsMsg } = this.state
        const { categoryType } = this.props.actionManageFetchOption
        return (
            <div>
                <div className={styles.warningTitle}>警告：</div>
                <Checkbox onChange={(e) => this.handleChange(`${key}_isRefer`, e)} checked={state[`${key}_isRefer`] ? true: false}>@违规群成员</Checkbox>
                <div className={styles.violationsMsgWrap}>
                    {
                        isViolationsMsg ?
                            <div className={styles.edit}>
                                <Row>
                                    <Col span={10}>
                                        <Input placeholder="请输入警告文字" value={editViolationsMsg} onChange={(e) => this.handleInputChange('editViolationsMsg', e)}></Input>
                                    </Col>
                                    <Button type="primary" onClick={() => this.saveViolationsMsg(`${key}_warningMsg`)}>保存</Button>
                                    <Button onClick={this.toggleEditViolationsMsg}>取消</Button>
                                </Row>
                            </div>
                            : <div className={styles.show}>
                                <EllipsisPopover content={state[`${key}_warningMsg`]} lines={2} ellipsisClassName={styles.showTxt}/>
                                <span className={styles.editBtn} onClick={this.toggleEditViolationsMsg}>编辑消息</span>
                            </div>
                    }
                </div>
                {
                    (categoryType !== 0 || state['can_do_kickout']) ? <Checkbox onChange={(e) => this.handleChange(`${key}_isKickAfterWarning`, e)} checked={state[`${key}_isKickAfterWarning`] ? true: false}>警告后踢出群</Checkbox>
                        : null
                }

            </div>
        )
    }

    // 配置敏感词的内容
    getConfigSensitive = (key) => {
        const state = this.props.community_groupSetting_actionManage
        const { editSensitiveMsg, isImportUpload, isExportLoading, fetchOption } = this.state
        let newSensitiveWords = []

        const importUploadProps = {
            name: 'file',
            action: `${API.importExcel.url}?${qs.stringify(fetchOption)}`,
            headers: {
                'Authorization': 'Bearer ' + this.props.base.accessToken,
            },
            accept: ".csv",
            showUploadList: false,
            beforeUpload: (file, fileList)=>{
                this.setState({
                    isImportUpload: true
                })
                let isCSV = false
                if (file.name) {
                    let fileArr = file.name.split('.')
                    if(fileArr[1] !== 'csv'){
                        message.error('文件限制.csv格式!')
                        fileList.pop()
                        this.setState({
                            isImportUpload: false
                        })
                    }else{
                        isCSV = true
                    }
                }
                const isLt1M = file.size / 1024 / 1024 < 2
                if (!isLt1M) {
                    message.error('大小限制2MB!')
                    fileList.pop()
                    this.setState({
                        isImportUpload: false
                    })
                }
                return isCSV && isLt1M
            },
            onChange: (info) => {
                let fileList = info.fileList
                fileList = fileList.filter((file) => {
                    if (file.response) {
                        return file.response?.meta?.code === 200
                    }
                    return false
                })
                this.setState({
                    isImportUpload: false,
                    importFileList: fileList,
                }, () => {
                    setTimeout(() => {
                        this.loadPage()
                    }, 1000)
                })
            }
        }

        if(state[`${key}_sensitiveWords`]) {newSensitiveWords = state[`${key}_sensitiveWords`].split(',')}
        return (
            <div className={styles.configSensitive}>
                {
                    this.getConfigContPublic(key)
                }
                <div className={styles.sensitiveWrap}>
                    <Row gutter={20} className={styles.inputWrap}>
                        <Col span={12}>
                            <Input placeholder="请输入敏感词" value={editSensitiveMsg} onChange={(e) => this.handleInputChange('editSensitiveMsg', e)}/>
                        </Col>
                        <div className={styles.btns}>
                            <Button type="primary" onClick={() => this.saveSensitiveMsg(key)}>添加</Button>
                            <Upload
                                {...importUploadProps}
                                fileList={this.state.importFileList}
                            >
                                <Button loading={isImportUpload} type="primary">导入</Button>
                            </Upload>
                            <Button type="primary" onClick={this.exportExcel} loading={isExportLoading}>导出</Button>
                        </div>
                    </Row>
                    <div className={styles.sensitives}>
                        {
                            newSensitiveWords.length ? newSensitiveWords.map((item, index) => {
                                return (<div className={styles.item} key={index}>
                                    <EllipsisPopover content={item} lines={1} ellipsisClassName={styles.txt}/>
                                    <div className={styles.icon} onClick={() => this.deleteTag(key, item)}><Icon type="close" /></div>
                                </div>)
                            }) : ''
                        }
                    </div>
                </div>
            </div>
        )
    }

    // 配置默认的内容
    getConfigDefault = (key) => {
        return (
            <div className={styles.getConfigDefault}>
                {
                    this.getConfigContPublic(key)
                }
            </div>
        )
    }

    // 配置防骚扰的内容
    getConfigHarassment = (key) => {
        const { harassment_maxString, harassment_second, harassment_row } = this.props.community_groupSetting_actionManage
        return (
            <div className={styles.configHarassment}>
                <div className={styles.inputRow}>发送消息超过 <InputNumber min={1} max={1000} value={harassment_maxString} step={10} onChange={(e) => this.inputNumberChange('harassment_maxString', e)} /> 字符警告</div>
                {/*<div className={styles.inputRow}>在 <InputNumber min={1} max={1000} value={harassment_second} step={10} onChange={(e) => this.inputNumberChange('harassment_second', e)} /> s内联系发送消息超过 <InputNumber min={1} max={1000} value={harassment_row} step={10} onChange={(e) => this.inputNumberChange('harassment_row', e)} /> 行视为刷屏警告</div>*/}
                {
                    this.getConfigContPublic(key)
                }
            </div>
        )
    }

    // 配置发送链接的内容
    getConfigLink = (key) => {
        const state = this.props.community_groupSetting_actionManage
        const { editLinkWebsiteMsg, linkWhitelistType } = this.state
        let newLinkWhitelist = [], newLinkDomainWhitelist = []

        if(state[`${key}_whitelist`]) {
            newLinkWhitelist = state[`${key}_whitelist`].split(',')
        }
        if(state[`${key}_domainWhitelist`]) {
            newLinkDomainWhitelist = state[`${key}_domainWhitelist`].split(',')
        }

        return (
            <div className={styles.configLink}>
                {
                    this.getConfigContPublic(key)
                }
                <div className={styles.linkCont}>
                    <div style={{marginBottom: 20}}>
                        淘口令：
                        <Checkbox
                            checked={state[`${key}_isAmbush`] ? true: false}
                            onChange={(e) => this.handleChange(`${key}_isAmbush`, e)}
                        >开启淘口令白名单</Checkbox>
                    </div>
                    <div style={{marginBottom: 10}}>域名白名单：(注：域名应去掉http://或https://前缀，如“www.51zan.com”)</div>
                    <Row gutter={20} className={styles.inputWrap}>
                        <Col span={12}>
                            <Input
                                placeholder="请输入地址"
                                value={editLinkWebsiteMsg}
                                onChange={(e) => this.handleLinkWhitelistChange('editLinkWebsiteMsg', e, linkWhitelistType)}
                            />
                        </Col>
                        <Col span={6}>
                            <Select
                                style={{width: '100%'}}
                                value={linkWhitelistType}
                                onChange={(e) => {this.linkWhitelistChange(e)}}
                                placeholder="全部状态"
                            >
                                <Option value={LINK_WHITELIST_TYPE.domain}>全域名</Option>
                                <Option value={LINK_WHITELIST_TYPE.noDomain}>单链接</Option>
                            </Select>
                        </Col>
                        <div className={styles.btns}>
                            <Button type="primary" onClick={() => this.saveLinkWhitelist(linkWhitelistType)}>添加</Button>
                        </div>
                    </Row>
                    <div className={styles.websiteWrap}>
                        <div className={styles.websiteTitle}>全域名：</div>
                        <div className={styles.websites}>
                            {
                                newLinkDomainWhitelist.length ? newLinkDomainWhitelist.map((item, index) => {
                                    return (<div className={styles.item} key={index}>
                                        <EllipsisPopover content={item} lines={1} ellipsisClassName={styles.txt}/>
                                        <div className={styles.icon} onClick={() => this.deleteLinkWhitelist(LINK_WHITELIST_TYPE.domain, item)}><Icon type="close" /></div>
                                    </div>)
                                }) : null
                            }
                        </div>
                        <div className={styles.websiteTitle}>单链接：</div>
                        <div className={styles.websites}>
                            {
                                newLinkWhitelist.length ? newLinkWhitelist.map((item, index) => {
                                    return (<div className={styles.item} key={index}>
                                        <EllipsisPopover content={item} lines={1} ellipsisClassName={styles.txt}/>
                                        <div className={styles.icon} onClick={() => this.deleteLinkWhitelist(LINK_WHITELIST_TYPE.noDomain, item)}><Icon type="close" /></div>
                                    </div>)
                                }) : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 配置发送小程序的内容
    getConfigSmallProgram = (key) => {
        const state = this.props.community_groupSetting_actionManage
        const { editSPWebsiteMsg, editSPWebsiteRemark } = this.state
        let newSPDomainWhitelist = []

        if(state[`${key}_domainWhitelist`]) {
            newSPDomainWhitelist = state[`${key}_domainWhitelist`].split(',')
        }

        return (
            <div className={styles.configLink}>
                {
                    this.getConfigContPublic(key)
                }
                <div className={styles.linkCont}>
                    <div style={{marginBottom: 10}}>小程序白名单：（注：小程序AppID查询方法：点击进入小程序，点击右上角菜单选择【关于-小程序名】，进入后点击右上角菜单选择【更多资料】，第三项中AppID，复制填入，即可添加小程序白名单）</div>
                    <Row gutter={20} className={styles.inputWrap}>
                        <Col span={12}>
                            AppID：
                            <Input
                                placeholder="请输入小程序AppID"
                                value={editSPWebsiteMsg}
                                onChange={(e) => this.handleInputChange('editSPWebsiteMsg', e)}
                                maxLength={18}
                                style={{width: '76%'}}
                            />
                        </Col>
                        <Col span={10}>
                            备注：
                            <Input
                                placeholder="请输备注，限10个字"
                                value={editSPWebsiteRemark}
                                onChange={(e) => this.handleInputChange('editSPWebsiteRemark', e)}
                                maxLength={10}
                                style={{width: '80%'}}
                            />
                        </Col>
                        <div className={styles.btns}>
                            <Button type="primary" onClick={() => this.saveSPWhitelist()}>添加</Button>
                        </div>
                    </Row>
                    <div className={styles.websiteWrap}>
                        <div className={styles.websites}>
                            {
                                newSPDomainWhitelist.length ? newSPDomainWhitelist.map((item, index) => {
                                    return (<div className={styles.item} key={index}>
                                        <EllipsisPopover content={item} lines={1} ellipsisClassName={styles.txt}/>
                                        <div className={styles.icon} onClick={() => this.deleteSPWhitelist(item)}><Icon type="close" /></div>
                                    </div>)
                                }) : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 获取右侧配置的内容
    getConfigCont = (key) => {

        switch (key) {
            case 'msgSensitiveWord':
            case 'nicknameSensitiveWord':
                return this.getConfigSensitive(key)
            case 'harassment':
                return this.getConfigHarassment(key)
            case 'link':
                return this.getConfigLink(key)
            case 'smallProgram':
                return this.getConfigSmallProgram(key)
            default:
                return this.getConfigDefault(key)
        }
    }

    handleChangeType = (e) => {
        const { chatroom_id } = this.props.actionManageFetchOption
        this.props.dispatch({
            type: 'community_groupSetting_actionManage/setActionSettingState',
            payload: {
                body: {
                    use_custom: e.target.value
                },
                chatroom_name:chatroom_id,
            },
            callback: (data) => {
                this.loadPage()
            }
        })
    }

    renderSettingLevel = () => {
        const { categoryType } = this.props.actionManageFetchOption
        const { use_custom } = this.props.community_groupSetting_actionManage
        if(categoryType === 0) { // 群管理
            return <RadioGroup value={use_custom} onChange={this.handleChangeType}>
                <Radio value={1}>自定义配置</Radio>
                <Radio value={0}>全局配置（选择此项时无法修改内容，请到【管理-行为管理】处查看和修改）</Radio>
            </RadioGroup>
        }
        if(categoryType === 1) { // 群活动
            return <div>活动配置</div>
        }
    }

    render() {
        const { queryLoading, updateLoading , getActionSettingStateLoading, setActionSettingStateLoading, disabledSettings} = this.props
        const { use_custom } = this.props.community_groupSetting_actionManage
        const { activeItem } = this.state
        const { categoryType } = this.props.actionManageFetchOption
        const formItemLayout = {labelCol: {span: 3}, wrapperCol: {span: 18}}

        return (
            <div className={styles.behaviorManage}>
                <Spin spinning={!!(queryLoading || updateLoading || getActionSettingStateLoading || setActionSettingStateLoading)}>
                    <Row>
                        <Col span={24}>
                            <FormItem {...formItemLayout} label="配置类型：" colon={false}>
                                {
                                    this.renderSettingLevel()
                                }
                            </FormItem>
                        </Col>
                    </Row>

                    <div className={styles.configCont}>
                        <div className={styles.switchs}>
                            {
                                this.getConfigSwitchs()
                            }
                        </div>
                        <div className={styles.right}>
                            {this.getConfigCont(activeItem)}
                        </div>
                        {
                            categoryType === 0 && use_custom === 0 && <div className={styles.contentMask01}></div>
                        }
                    </div>
                    {/*<div className={styles.commandEdit}>
                        <div className={styles.title}>命令操作</div>
                        <div className={styles.cont}>
                            <div style={{margin: '20px 0'}}>踢人操作：管理员和员工微信号群内发送命令 【@群成员昵称 踢出】即可指定踢人</div>
                            <div style={{margin: '20px 0'}}>踢人警告：</div>
                            <div className={styles.kickMsgWrap}>
                                {
                                    isEditKickMsg ?
                                        <div className={styles.edit}>
                                            <Row>
                                                <Col span={6}>
                                                    <Input placeholder="请输入警告文字" value={editKickMsg} onChange={(e) => this.handleInputChange('editKickMsg', e)}/>
                                                </Col>
                                                <Button type="primary" onClick={this.saveKickMsg}>保存</Button>
                                                <Button onClick={this.toggleEditKickMsg}>取消</Button>
                                            </Row>
                                        </div>
                                        :
                                        <div className={styles.show}>
                                            <EllipsisPopover content={kickMsg} lines={2} ellipsisClassName={styles.showTxt}/>
                                            <span className={styles.editBtn} onClick={this.toggleEditKickMsg}>编辑消息</span>
                                        </div>
                                }
                            </div>
                        </div>
                    </div>*/}
                    {
                        disabledSettings &&<div className={styles.contentMask02}></div>
                    }
                </Spin>
            </div>
        )
    }
}
