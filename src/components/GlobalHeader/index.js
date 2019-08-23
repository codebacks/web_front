import React from 'react'
import {NavLink, Link} from 'umi'
import {connect} from 'dva'
import {
    Layout,
    Icon,
    Menu,
    Dropdown,
    Divider,
    Popover,
    List,
    Badge,
    Spin,
    Row,
    Col
} from 'antd'
import router from 'umi/router'
import styles from './index.less'
import {isUrl} from "utils"
import _ from 'lodash'
import InfiniteScroll from 'react-infinite-scroller'
import {getHasMenuNewFeature} from '../../common/version'

const {Header} = Layout

@connect(({base, app, oem}) => ({
    base,
    oem,
    app,
}))
export default class GlobalHeader extends React.Component {
    state = {
        appInfoHover: false,
        notice_visible:false,
        noticeLoading:false,
        hasMore:true,
        noticeListArr:[],
        offset:1,
        limit:6,
        total:0,
    }
    componentDidMount() {
        const {accessToken} = this.props.base
        if (accessToken) {
            this.props.dispatch({
                type: 'base/getTreeCurrent',
            })
        }
        this.getUnreadNum()//获取未读数
        this.getNoticeList()


    }

    logout = () => {
        this.props.dispatch({
            type: 'login/logout',
            payload: {},
        })
    }

    onMenuClick = ({key}) => {
        switch(key){
            case 'logout':
                this.logout()
                break
            case 'setting':
                router.push('/setting/index')
                break
            default:
                break
        }
    }

    getNewFeatureTip = (userID, item) => {
        if (userID && getHasMenuNewFeature(userID, item.name, item.children)) {
            return <span className={styles.newFeatureTip}></span>
        }else {
            return ''
        }
    }

    appClose = (item, index) => {
        this.props.dispatch({
            type: 'app/deleteRecentApp',
            payload: {
                item,
                index,
            },
        })
    }

    addFrequentApps = (item, index) => {
        this.props.dispatch({
            type: 'app/addFrequentApps',
            payload: {
                item,
                index,
            },
        })
    }

    deleteFrequentApps = (item, index) => {
        this.props.dispatch({
            type: 'app/deleteFrequentApps',
            payload: {
                item,
                index,
            },
        })
    }

    appsClick = (item, index) => {
        this.props.dispatch({
            type: 'app/appsClick',
            payload: {
                item,
                index,
            },
        })
    }

    renderAppBarNav = () => {
        const {recentApps = []} = this.props.app
        return recentApps.slice(0, 3).map((item, index) => {
            if(item.target === 'blank'){
                return (
                    <a
                        className={styles.app}
                        href={window.encodeURI(`${item.url}?access_token=${this.props.base.accessToken}`)}
                        key={`appBarNav-${item.id}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        title={item.name}
                    >
                        {item.name}
                        <img
                            onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                this.appClose(item, index)
                            }}
                            className={styles.close}
                            src={require('./images/close.png')}
                            alt={'close'}
                        />
                    </a>
                )
            }else{
                return (
                    <NavLink
                        key={`appBarNav-${item.id}`}
                        to={`/app/${index}`}
                        activeClassName={styles.barNavActive}
                        className={styles.app}
                    >
                        {item.name}
                        <img
                            onClick={(event) => {
                                event.stopPropagation()
                                event.preventDefault()
                                this.appClose(item, index)
                            }}
                            className={styles.close}
                            src={require('./images/close.png')}
                            alt={'close'}
                        />
                    </NavLink>
                )
            }
        })
    }

    renderAppInfoDropdown = () => {
        const {recentApps = [], frequentApps = []} = this.props.app
        return (
            <div className={styles.infoDropdown}>
                <div className={`${styles.appList} ${styles.recentApps}`}>
                    <div className={styles.infoTitle}>最近使用</div>
                    {
                        recentApps.slice(0, 10).map((item, index) => {
                            return (
                                <div
                                    className={styles.appItem}
                                    key={item.id}
                                >
                                    <span
                                        onClick={(event) => {
                                            this.appsClick(item, index)
                                        }}
                                        className={styles.itemName}
                                    >
                                        {item.name}
                                    </span>
                                    <img
                                        onClick={(event) => {
                                            this.appClose(item, index)
                                        }}
                                        className={styles.itemIcon}
                                        src={require('./images/delete.png')}
                                        alt={'close'}
                                    />
                                    <img
                                        onClick={(event) => {
                                            this.addFrequentApps(item, index)
                                        }}
                                        className={styles.itemIcon}
                                        src={require('./images/add.png')}
                                        alt={'close'}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
                <div className={styles.appList}>
                    <div className={styles.infoTitle}>常用应用</div>
                    {
                        frequentApps.slice(0, 10).map((item, index) => {
                            return (
                                <div
                                    className={styles.appItem}
                                    key={item.id}
                                >
                                    <span
                                        onClick={(event) => {
                                            this.appsClick(item, index)
                                        }}
                                        className={styles.itemName}
                                    >
                                        {item.name}
                                    </span>
                                    <img
                                        onClick={(event) => {
                                            this.deleteFrequentApps(item, index)
                                        }}
                                        className={styles.itemIcon}
                                        src={require('./images/delete.png')}
                                        alt={'close'}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }

    renderBarNav = () => {
        const {tree, initData} = this.props.base
        const userID = _.get(initData, 'user.account_id', '')

        return tree.map((item, i) => {
            let url = item.url
            if (isUrl(url)) {
                const urlObj = new URL(url)
                if (Number(urlObj.searchParams.get('token')) === 1) {
                    const {accessToken} = this.props.base
                    url = `${urlObj.origin}${urlObj.pathname}?token=${accessToken}`
                }
                return (
                    <a
                        key={`barNav-${item.id}`}
                        href={url}
                        target={item.target}
                    >
                        {item.name}
                    </a>
                )
            }
            return (
                <NavLink
                    key={`barNav-${item.id}`}
                    to={this.getLinkTo(item)}
                    isActive={(match, location)=>{
                        return location.pathname.split('/')[1] === item.slug
                    }}
                    activeClassName={styles.barNavActive}
                >
                    {item.name}{this.getNewFeatureTip(userID, item)}
                </NavLink>
            )
        })
    }

    getLinkTo = (item) => {
        return _.get(
            item,
            'children[0].children[0].url',
            _.get(item, 'children[0].url', _.get(item, 'url', '')),
        )
    }

    onVisibleChange = (visible)=>{
        this.setState({
            appInfoHover: visible
        })
    }

    // 获取消息公共列表 read :1=已读 0=未读 不传等于全部
    getUnreadNum = () =>{
        this.props.dispatch({
            type:'base/getUnreadNum',
            payload:{
                read: 0
            }
        })
    }
    getNoticeList = () =>{
        this.props.dispatch({
            type:'base/getNoticeList',
            payload:{
                read:'',
                offset: 0,
                limit: 10,
            },
            callback:(res)=>{
                if(res.data && res.meta.code === 200){
                    this.setState({
                        noticeListArr:res.data,
                        total:res.pagination.rows_found
                    })
                }
            }
        })
    }
    checkNotice = () =>{
        this.setState({
            notice_visible:true
        })
    }

    noticeClose = () =>{
        this.setState({
            notice_visible:false
        })
    }
    // niukefuClick = () => {
    //     this.props.dispatch({
    //         type: 'base/authToken',
    //         payload: {},
    //         callback: (data) => {
    //             const a = document.createElement("a")
    //             a.href = `${config.niukefuUrl}?access_token=${data.access_token}`
    //             a.target = '_blank'
    //             a.click()
    //         },
    //     })
    // }
    handleClickChange = (e) =>{
        this.setState({
            notice_visible:e
        })
    }
    jumpDetail = (val) =>{
        if(val.link && val.link.type === 'announcement'){
            this.setState({
                notice_visible:false
            },()=>{
                // 未读
                if(!val.read_at){
                    this.setReadStaus(val.id)
                }
                router.push(`/setting/notice/detail?id=`+val.link.id)
            })
        }
    }
    // 设置为已读
    setReadStaus = (id) =>{
        this.props.dispatch({
            type:'base/setReadStatus',
            payload:{
                id:id
            }
        })
    }
    checkMore = () =>{
        this.setState({
            notice_visible:false
        },()=>{
            router.push('/setting/notice')
        })
    }
    getData = () =>{
        const {offset} = this.state
        let noticeListArr =this.state.noticeListArr
        this.setState({
            noticeLoading:true
        })
        this.props.dispatch({
            type:'base/getNoticeList',
            payload:{
                read:'',
                offset: (offset - 1) * 10,
                limit: 10,
            },
            callback:(res) =>{
                noticeListArr = noticeListArr.concat(res.data)
                this.setState({
                    noticeListArr,
                    noticeLoading:false,
                })
            }
        })
    }
    handleInfiniteOnLoad = () =>{
        if (this.state.total === this.state.noticeListArr.length) {
            this.setState({
                noticeLoading:false,
                hasMore:false,
            })
            return
        }
        this.setState({
            noticeLoading: true,
            offset: this.state.offset + 1
        }, () => {
            this.getData()
        })
    }

    renderAppDownload = ()=>{
        return (
            <div className={styles.appDownload}>
                <div className={styles.title}>牛客服app下载</div>
                <Row>
                    <Col span={12}>
                        <img
                            src={require('./images/android.png')}
                            alt='牛客服app,android下载'
                            className={styles.code}
                        />
                        <div className={styles.tip}>安卓版</div>
                    </Col>
                    <Col span={12}>
                        <img
                            src={require('./images/ios.png')}
                            alt='牛客服app,ios下载'
                            className={styles.code}
                        />
                        <div className={styles.tip}>苹果版</div>
                    </Col>
                </Row>
            </div>
        )
    }
    goToVersionInfo =()=>{
        router.push('/setting/version_information')
    }
    render() {
        const {
            oemConfig = {},
        } = this.props.oem

        const {initData, accessToken ,unReadNum} = this.props.base
        // const freeVersion = _.get(initData, 'company.product_version.id') === 0
        const {notice_visible,noticeLoading,hasMore,noticeListArr,total} = this.state
        const menu = (
            <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
                {/*<Menu.Item key="setting">*/}
                {/*<Icon type="user"/>个人中心*/}
                {/*</Menu.Item>*/}
                <Menu.Item key="logout">
                    <Icon type="logout"/>退出登录
                </Menu.Item>
            </Menu>
        )
        const notice_title = (
            <div className={styles.notice_title}>
                <div className={styles.notice_title_box}>
                    消息通知
                    {
                        unReadNum>0 &&(
                            <span>（{unReadNum}条未读）</span>
                        )
                    }
                </div>
            </div>
        )
        const notice_content = (
            <div className={styles.noticeCotent}>
                <div className={styles.noticeListbox}>
                    <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loadMore={this.handleInfiniteOnLoad}
                        hasMore={!noticeLoading && hasMore}
                        useWindow={false}
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={noticeListArr}
                            renderItem={item =>(
                                <div className={styles.listItemWrap} onClick={() =>this.jumpDetail(item)}>
                                    <div className={`${styles.listItemWrap_box} ${item.read_at ? styles.activeContent : null}`}>
                                        <p className={styles.title}>
                                            {
                                                !item.read_at &&(
                                                    <span className={styles.statusIcon}></span>
                                                )
                                            }
                                            <span style={{verticalAlign:'middle'}}>{item.title}</span>
                                        </p>
                                        <p className={styles.time}>{item.created_at}</p>
                                    </div>
                                    {(noticeLoading && hasMore) && (
                                        <div className={styles.loaidngText}>
                                            <Spin />
                                        </div>
                                    )}
                                </div>

                            )}
                        />

                        {
                            (total > 0 && total === noticeListArr.length ) && (
                                <div className={styles.noMoreNotice}>
                                    没有更多消息通知了哦~
                                </div>
                            )
                        }
                    </InfiniteScroll>
                </div>
                <div className={styles.content_footer} onClick={this.checkMore}>查看更多</div>
            </div>
        )
        const { id } = this.props.base.initData.company ? this.props.base.initData.company.product_version:''
        //首页 客户管理 商城管理 个人号 营销平台 数据中心 系统设置
        return (
            <Header className={styles.topBar}>
                <div className={styles.logo}>
                    <Link
                        to="/home"
                        title="前往首页"
                    >
                        <img
                            src={oemConfig.logSrc}
                            alt={oemConfig.logAlt}
                        />
                    </Link>
                </div>
                <div className={styles.barNav}>
                    {
                        this.renderBarNav()
                    }
                </div>
                <div className={styles.appBar}>
                    {
                        this.renderAppBarNav()
                    }
                </div>
                <Popover
                    content={this.renderAppInfoDropdown()}
                    onVisibleChange={this.onVisibleChange}
                    placement="bottomRight"
                >
                    <div className={`${styles.appInfo}  ${this.state.appInfoHover ? styles.infoIconHover : ''}`}>
                        <div className={`${styles.infoIcon}`}>
                            <div className={`${styles.infoIconBlock} ${styles.topLeft}`}></div>
                            <div className={`${styles.infoIconBlock} ${styles.topRight}`}></div>
                            <div className={`${styles.infoIconBlock} ${styles.BottomLeft}`}></div>
                            <div className={`${styles.infoIconBlock} ${styles.BottomRight}`}></div>
                        </div>
                    </div>
                </Popover>
                <div className={styles.right}>
                    {/*免费版 */}
                    {

                        id === 0?<span className={styles.order_servive} onClick={this.goToVersionInfo}>订购服务</span>  :''
                    }

                    <Popover
                        placement="bottomLeft"
                        content={this.renderAppDownload()}
                        title={null}
                        trigger="click"
                        arrowPointAtCenter={true}
                    >
                        <img
                            src={require('./images/niukefu_icon.png')}
                            alt='牛客服app下载'
                            className={styles.appIcon}
                        />
                    </Popover>
                    <Popover overlayClassName={styles.noticePopoverWrap} placement="bottom" title={notice_title} visible={notice_visible} content={notice_content} trigger="click" onVisibleChange={this.handleClickChange}>
                        <Badge offset={[-4,4]} className={styles.notic_Ring} title="消息通知" onClick={this.checkNotice} dot={unReadNum > 0 ? true : false}>
                            <img src={require('assets/icons/icon_message.svg')} title="消息通知" alt='消息通知' className={styles.ringImg}/>
                        </Badge>
                    </Popover>

                    <a className={styles.helpcenter} without='true' href='http://newhelp.51zan.cn/manual' target='_blank' rel='noopener noreferrer' title='帮助中心'>
                        <img src={require('assets/images/head-helpcenter.svg')} alt='帮助中心' />
                        帮助
                    </a>
                    <Divider type="vertical"/>
                    <a
                        href={`${_.get(oemConfig, 'niukefu.url', '')}?access_token=${accessToken}`}
                        // onClick={this.niukefuClick}
                        target={'_blank'}
                    >
                        <img
                            className={styles.niukefu}
                            alt={_.get(oemConfig, 'niukefu.alt', '')}
                            src={_.get(oemConfig, 'niukefu.iconSrc', '')}
                        />
                        {_.get(oemConfig, 'niukefu.name', '')}
                    </a>
                    <Divider type="vertical"/>

                    <Dropdown overlay={menu}>
                        <span>
                            <span className={styles.name}>{_.get(initData, 'user.nickname', ' ')}</span>
                            <Icon style={{fontSize: 16}} type="down"/>
                        </span>
                    </Dropdown>
                </div>
            </Header>
        )
    }
}
