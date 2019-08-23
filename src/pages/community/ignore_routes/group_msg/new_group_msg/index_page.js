import React, {PureComponent} from 'react'
import {
    Steps,
    Icon,
} from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import styles from './index.less'
import SelectGroupWeChat from './components/SelectGroupWeChat'
import CheckWeChatGroup from './components/CheckWeChatGroup'
import SentMsg from './components/SentMsg'
import ContentHeader from 'business/ContentHeader'

const Step = Steps.Step

const steps = [
    {
        title: '选择微信号',
        Content: SelectGroupWeChat,
    }, {
        title: '核对微信群',
        Content: CheckWeChatGroup,
    }, {
        title: '发送消息',
        Content: SentMsg,
    },
]

@connect(({base, community_automaticNewGroupMsg}) => ({
    base,
    community_automaticNewGroupMsg,
}))
@documentTitleDecorator({
    title: '新增群发',
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
    }

    next = () => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/nextStepsCurrent',
        })
    }

    prev = () => {
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/prevStepsCurrent',
        })
    }

    cancel = () => {
        router.push('/community/group_msg')
        this.props.dispatch({
            type: 'community_automaticNewGroupMsg/resetState',
        })
    }

    render() {
        const {stepsCurrent} = this.props.community_automaticNewGroupMsg
        const Content = steps[stepsCurrent].Content

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群内群发',
                                path: '/community/group_msg'
                            },
                            {
                                name: '新建群发',
                            },
                        ]
                    }
                />
                <div className={styles.automaticNewGroupMsg}>
                    <div className={styles.steps}>
                        <Steps current={stepsCurrent}>
                            {steps.map(item => <Step key={item.title} title={item.title}/>)}
                        </Steps>
                    </div>
                    <div className={styles.content}>
                        {
                            <Content
                                {...this.props}
                                next={this.next}
                                prev={this.prev}
                                cancel={this.cancel}
                            />
                        }
                    </div>
                </div>
            </div>
        )
    }
}
