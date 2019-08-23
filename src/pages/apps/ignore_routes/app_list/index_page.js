import React from 'react'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import ImgBlock from 'business/ImgBlock'
import EllipsisPopover from "components/EllipsisPopover"
import {winOpen} from 'utils'
import {router} from 'umi'
import _ from "lodash"
import {message, Modal} from "antd"

@hot(module)
@connect(({apps_appList, app, base, oem, loading}) => ({
    apps_appList,
    app,
    base,
    oem,
}))
@documentTitleDecorator()
export default class Index extends React.Component {
    componentDidMount() {
        this.props.dispatch({
            type: 'apps_appList/apps',
        })
        this.props.dispatch({
            type: 'apps_appList/previewApps',
        })
    }

    previewAppsOpen = (item) => {
        if (item.target === 'blank') {
            winOpen(window.encodeURI(`${item.preview_url}?access_token=${this.props.base.accessToken}`))
        }else {
            router.push(`/app_preview?id=${item.id}`)
        }
    }

    appOpen = (item) => {
        this.props.dispatch({
            type: 'app/appsClick',
            payload: {
                item,
            },
        })
    }

    cardClick = (item, type) => {
        if (type === 'previewApps') {
            this.previewAppsOpen(item)
        }else {
            if (item.is_granted) {
                this.appOpen(item)
            }else {
                if (_.get(this, 'props.base.initData.user.type') === 1) {
                    Modal.confirm({
                        title: '授权',
                        content: '授权该应用访问您的数据？',
                        width: 520,
                        okText: '授权',
                        onOk: () => {
                            return new Promise((resolve, reject) => {
                                this.props.dispatch({
                                    type: 'apps_appList/grantApp',
                                    payload: {
                                        id: item.id,
                                    },
                                    callback: () => {
                                        message.success('授权成功')
                                        this.props.dispatch({
                                            type: 'apps_appList/apps',
                                        })
                                        resolve()
                                    },
                                })
                            })
                        },
                    })
                }else {
                    Modal.confirm({
                        title: '授权',
                        width: 520,
                        okText: '申请授权',
                        content: (
                            <div className={styles.grantApp}>
                                <p>该应用需要授权后才能使用，请联系管理员进行授权</p>
                                <p>授权入口【商家后台-应用-授权管理-待授权】</p>
                            </div>
                        ),
                        onOk: () => {
                            return new Promise((resolve, reject) => {
                                this.props.dispatch({
                                    type: 'apps_appList/grantApp',
                                    payload: {
                                        id: item.id,
                                    },
                                    callback: () => {
                                        message.success('申请提交成功')
                                        this.props.dispatch({
                                            type: 'apps_appList/apps',
                                        })
                                        resolve()
                                    },
                                })
                            })
                        },
                    })
                }
            }
        }
    }

    renderApps = (apps = [], type) => {
        return apps.map((item, i) => {
            return (
                <div className={styles.cardWrap} key={item.id}>
                    <div
                        className={styles.card}
                        onClick={() => {
                            this.cardClick(item, type)
                        }}
                    >
                        {
                            !item.is_public && (
                                <img
                                    src={require('./images/private.png')}
                                    alt={'private'}
                                    className={styles.private}
                                />
                            )
                        }
                        <div className={styles.photo}>
                            <ImgBlock
                                src={item.logo}
                                alt={'logo'}
                            />
                        </div>
                        <div className={styles.rightBlock}>
                            <div className={styles.title}>
                                {item.name}
                            </div>
                            <div className={styles.tip}>{item.nickname}</div>
                            <EllipsisPopover
                                ellipsisClassName={styles.desc}
                                lines={2}
                                content={item.desc}
                            />
                        </div>
                    </div>
                </div>
            )
        })
    }

    render() {
        const {apps, previewApps = []} = this.props.apps_appList
        const {
            oemConfig = {},
        } = this.props.oem

        const help = oemConfig.id === 'siyuguanjia' ? {
            url: 'https://www.kancloud.cn/newsystem51/puqiucrm/1091562',
        } : undefined

        return (
            <div className={styles.main}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={help}
                />
                <div className={styles.apps}>
                    {
                        apps.length ? this.renderApps(apps, 'app') : (
                            <div className={styles.emptyTit}>
                                这里将陆续上线更多扩展应用，敬请期待！
                            </div>
                        )
                    }
                </div>
                {
                    !!previewApps.length && (
                        <div className={styles.previewAppsTitle}>
                            预览
                        </div>
                    )
                }
                <div className={styles.apps}>
                    {this.renderApps(previewApps, 'previewApps')}
                </div>
            </div>
        )
    }
}
