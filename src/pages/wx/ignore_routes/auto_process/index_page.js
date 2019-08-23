/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/15
 */

import React, {PureComponent} from 'react'
import {
    Switch,
} from 'antd'
import {connect} from "dva/index"
import ContentHeader from 'business/ContentHeader'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import {hot} from "react-hot-loader"

@hot(module)
@connect(({wx_autoProcess, loading}) => ({
    wx_autoProcess,
    settingLoading: loading.effects['wx_autoProcess/setting'],
    settingUpdateLoading: loading.effects['wx_autoProcess/settingUpdate'],
}))
@documentTitleDecorator()
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.setting()
    }

    setting = () => {
        this.props.dispatch({
            type: 'wx_autoProcess/setting',
            payload: {},
        })
    }

    onChange = (checked, name) => {
        this.props.dispatch({
            type: 'wx_autoProcess/settingUpdate',
            payload: {
                [name]: checked,
            },
        })
    }

    render() {
        const {
            wx_autoProcess,
            settingLoading,
            settingUpdateLoading,
        } = this.props
        const {
            auto_bind_aliwangwang,
            auto_bind_cellphone,
            auto_bind_jd,
            auto_bind_order,
        } = wx_autoProcess
        const loading = settingLoading || settingUpdateLoading

        return (
            <div className={styles.autoProcessWarp}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%99%BA%E8%83%BD%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <div className={styles.autoProcess}>
                    <div className={styles.title}>
                        牛客服上与客户对话过程中，触发以下关键内容时系统自动处理
                    </div>
                    <div className={styles.line}>
                        <Switch
                            checked={auto_bind_order}
                            checkedChildren="开"
                            unCheckedChildren="关"
                            loading={loading}
                            onChange={(checked) => {
                                this.onChange(checked, 'auto_bind_order')
                            }}
                        />
                        <span className={styles.name}>订单号自动绑定</span>
                        <div className={styles.tip}>
                            开启后，当客户发送订单号，系统会自动识别出对应的购物账号并与客户进行绑定
                        </div>
                    </div>
                    <div className={styles.line}>
                        <Switch
                            checked={auto_bind_aliwangwang}
                            checkedChildren="开"
                            unCheckedChildren="关"
                            loading={loading}
                            onChange={(checked) => {
                                this.onChange(checked, 'auto_bind_aliwangwang')
                            }}
                        />
                        <span className={styles.name}>旺旺号自动关联</span>
                        <div className={styles.tip}>
                            开启后，当客户仅发送<span className={styles.point}>旺旺号：XXXXXXX</span>时，系统会自动识别出对应的购物账号并与客户进行关联
                        </div>
                        <div className={styles.tip}>
                            建议将上述内容添加至快捷回复及自动回复中，以便更好的引导客户填写内容
                        </div>
                    </div>
                    <div className={styles.line}>
                        <Switch
                            checked={auto_bind_jd}
                            checkedChildren="开"
                            unCheckedChildren="关"
                            loading={loading}
                            onChange={(checked) => {
                                this.onChange(checked, 'auto_bind_jd')
                            }}
                        />
                        <span className={styles.name}>京东号自动关联</span>
                        <div className={styles.tip}>
                            开启后，当客户仅发送<span className={styles.point}>京东号：XXXXXXX</span>时，系统会自动识别出对应的购物账号并与客户进行关联
                        </div>
                        <div className={styles.tip}>
                            建议将上述内容添加至快捷回复及自动回复中，以便更好的引导客户填写内容
                        </div>
                    </div>
                    <div className={styles.line}>
                        <Switch
                            checked={auto_bind_cellphone}
                            checkedChildren="开"
                            unCheckedChildren="关"
                            loading={loading}
                            onChange={(checked) => {
                                this.onChange(checked, 'auto_bind_cellphone')
                            }}
                        />
                        <span className={styles.name}>手机号自动关联</span>
                        <div className={styles.tip}>
                            开启后，当客户发送手机号时（不包含其他任何内容），系统会自动识别出对应的购物账号并与客户进行关联
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
