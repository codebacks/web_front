import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
import {hot} from "react-hot-loader"
import {Form, Spin, Switch, Tabs} from 'antd'
import {connect} from 'dva'
import styles from './index.less'
import PropTypes from 'prop-types'
import _ from "lodash"
import EllipsisPopover from "components/EllipsisPopover"
import ActionSetting from './components/ActionSetting'
import NewFriends from './components/NewFriends'
import AutoReply from './components/AutoReply'

const TabPane = Tabs.TabPane
const FormItem = Form.Item

const defaultContents = [
    {
        key: 'new_friends',
        title: '入群问候设置',
        Content: NewFriends,
        getSwitchLoading() {
            const {
                chatroomCommonsSetStatusLoading,
                chatroomCommonsSettingsLoading,
            } = this.props

            return chatroomCommonsSetStatusLoading || chatroomCommonsSettingsLoading
        },
        getSwitchState() {
            const {
                chatroomCommonsSettings: {
                    auto_greet_status,
                },
            } = this.props.community_groupSetting

            return Boolean(auto_greet_status)
        },
        handleSwitchChange(e) {
            const {fetchOption} = this.props
            this.props.dispatch({
                type: 'community_groupSetting/chatroomCommonsSetStatus',
                payload: {
                    body: {
                        ...fetchOption,
                        status_board_position: 0,
                        status: e ? 1 : 0,
                    },
                },
                callback: () => {
                    this.chatroomCommonsSettings()
                },
            })
        },
    },
    {
        key: 'auto_reply',
        title: '自动回复设置',
        Content: AutoReply,
        getSwitchLoading() {
            const {
                chatroomCommonsSetStatusLoading,
                chatroomCommonsSettingsLoading,
            } = this.props

            return chatroomCommonsSetStatusLoading || chatroomCommonsSettingsLoading
        },
        getSwitchState() {
            const {
                chatroomCommonsSettings: {
                    auto_reply_status,
                },
            } = this.props.community_groupSetting

            return Boolean(auto_reply_status)
        },
        handleSwitchChange(e) {
            const {fetchOption} = this.props
            this.props.dispatch({
                type: 'community_groupSetting/chatroomCommonsSetStatus',
                payload: {
                    body: {
                        ...fetchOption,
                        status_board_position: 1,
                        status: e ? 1 : 0,
                    },
                },
                callback: () => {
                    this.chatroomCommonsSettings()
                },
            })
        },
    },
    {
        key: 'action_setting',
        title: '行为管理设置',
        Content: ActionSetting,
        getSwitchLoading() {
            const {
                chatroomCommonsSetStatusLoading,
                chatroomCommonsSettingsLoading,
            } = this.props

            return chatroomCommonsSetStatusLoading || chatroomCommonsSettingsLoading
        },
        getSwitchState() {
            const {
                chatroomCommonsSettings: {
                    behavior_status,
                },
            } = this.props.community_groupSetting

            return Boolean(behavior_status)
        },
        handleSwitchChange(e) {
            const {fetchOption} = this.props
            this.props.dispatch({
                type: 'community_groupSetting/chatroomCommonsSetStatus',
                payload: {
                    body: {
                        ...fetchOption,
                        status_board_position: 2,
                        status: e ? 1 : 0,
                    },
                },
                callback: () => {
                    this.chatroomCommonsSettings()
                },
            })
        },
    },
]

@hot(module)
@connect(
    (
        {
            community_groupSetting,
            loading,
        },
    ) => ({
        community_groupSetting,
        chatroomCommonsSettingsLoading: loading.effects['community_groupSetting/chatroomCommonsSettings'],
        chatroomCommonsSetStatusLoading: loading.effects['community_groupSetting/chatroomCommonsSetStatus'],
    }),
)
@toggleModalWarp({
    title: "群设置",
    width: 1024,
    destroyOnClose: true,
    maskClosable: false,
    footer: null,
})
export default class GroupSetting extends PureComponent {
    static propTypes = {
        fetchOption: PropTypes.object.isRequired,
        setContents: PropTypes.func,
        handleSwitchChange: PropTypes.func,
    }

    static defaultProps = {}

    constructor(props) {
        super(props)
        this.contents = _.merge([], defaultContents)
        if(props.setContents) {
            this.contents = props.setContents(this.contents)
        }

        this.state = {
            activeKey: _.get(this.contents, [0, 'key'], ''),
        }
        props.setModalOnCancelFn(this.props.refresh)
    }

    chatroomCommonsSettings = () => {
        const {
            fetchOption,
        } = this.props

        this.props.dispatch({
            type: 'community_groupSetting/chatroomCommonsSettings',
            payload: fetchOption,
        })
    }

    componentDidMount() {
        this.chatroomCommonsSettings()
    }

    renderContent = ({key, activeKey, Content, disabledSettings}) => {
        if(key === activeKey) {
            return (
                <Content
                    {...this.props}
                    disabledSettings={disabledSettings}
                />
            )
        }else {
            return null
        }
    }

    handleChange = (key) => {
        this.setState({
            activeKey: key,
        })
    }

    renderTabPanes = () => {
        const {activeKey} = this.state

        return this.contents.map((item, i) => {
            const disabledSettings = !item.getSwitchState.call(this)

            return (
                <TabPane
                    tab={(
                        <div>
                            <span className={styles.titleTxt}>{item.title}</span>
                            <div
                                className={styles.switchWarp}
                            >
                                <Switch
                                    checkedChildren="启用"
                                    unCheckedChildren="禁用"
                                    loading={!!item.getSwitchLoading.call(this)}
                                    checked={!disabledSettings}
                                    onChange={(...arg) => {
                                        item.handleSwitchChange.call(this, ...arg)
                                        const {handleSwitchChange} = this.props
                                        if(handleSwitchChange) {
                                            handleSwitchChange.call(this, ...arg)
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    key={item.key}
                >
                    {this.renderContent({key: item.key, activeKey, Content: item.Content, disabledSettings})}
                </TabPane>
            )
        })
    }

    getContent = () => {
        const {
            community_groupSetting,
            fetchOption: {
                setting_level,
            } = {},
        } = this.props
        const {activeKey} = this.state
        const {
            chatroomCommonsSettings,
        } = community_groupSetting

        const formItemLayout = {
            labelCol: {span: 2},
            wrapperCol: {span: 20},
        }

        const level_is_higher = Boolean(chatroomCommonsSettings.level_is_higher)

        return (
            <div className={styles.hasSetting}>
                <div>
                    <FormItem
                        {...formItemLayout}
                        label={setting_level === 500 ? '活动名称' : '群名称'}
                        colon={true}
                    >
                        <EllipsisPopover lines={1} content={chatroomCommonsSettings.name} ellipsisClassName={styles.groupName}/>
                    </FormItem>
                    {
                        level_is_higher && (
                            <FormItem
                                {...formItemLayout}
                                label="配置类型"
                                colon={true}
                            >
                                {chatroomCommonsSettings.type_name}
                                <span
                                    className={styles.mark}>{`该群已被群活动【${chatroomCommonsSettings.extra_name || ''}】所配置，请至【群活动-群配置】中进行修改`}</span>
                            </FormItem>
                        )
                    }
                </div>
                {
                    !level_is_higher && (
                        <Tabs activeKey={activeKey} onChange={this.handleChange}>
                            {
                                this.renderTabPanes()
                            }
                        </Tabs>
                    )
                }
            </div>
        )
    }

    render() {
        const {
            chatroomCommonsSetStatusLoading,
            chatroomCommonsSettingsLoading,
        } = this.props

        return (
            <div className={styles.container}>
                <Spin spinning={!!chatroomCommonsSettingsLoading || !!chatroomCommonsSetStatusLoading}>
                    {this.getContent()}
                </Spin>
            </div>
        )
    }
}
