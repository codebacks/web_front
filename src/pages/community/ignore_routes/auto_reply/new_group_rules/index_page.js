import React from 'react'
import {
    Row,
    Col,
    Divider, Button,
} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import GroupMatchContents from '../components/GroupMatchContents'
import GroupReplyContents from '../components/GroupReplyContents'
import styles from './index.less'
import router from "umi/router"
import ContentHeader from 'business/ContentHeader'

@connect(({community_groupRules, loading}) => ({
    community_groupRules,
    categoryUpdateLoading: loading.effects['community_groupRules/categoryUpdate'],
}))
@documentTitleDecorator({
    title: '新建群规则',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'community_groupRules/resetState',
        })
    }

    cancel = ()=>{
        this.props.dispatch({
            type: 'community_groupRules/resetState',
        })
        router.push('/community/auto_reply?type=group_auto_reply')
    }

    ok = ()=>{
        this.props.dispatch({
            type: 'community_groupRules/categoryUpdate',
            callback: () => {
                this.cancel()
            },
        })
    }

    render() {
        return (
            <div className={styles.newRules}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '自动回复',
                                path: '/community/auto_reply?type=group_auto_reply',
                            },
                            {
                                name: '新建群规则',
                            },
                        ]
                    }
                />
                <div className={styles.contents}>
                    <Row type={'flex'}>
                        <Col span={12}>
                            <GroupMatchContents/>
                        </Col>
                        <Col span={1} className={styles.center}>
                            <Divider type="vertical" className={styles.vertical}/>
                        </Col>
                        <Col span={11}>
                            <GroupReplyContents/>
                        </Col>
                    </Row>
                    <div className={styles.btnBar}>
                        <Button
                            loading={this.props.categoryUpdateLoading}
                            type="primary"
                            className={styles.btn}
                            onClick={this.ok}
                        >
                            确定
                        </Button>
                        <Button
                            loading={this.props.categoryUpdateLoading}
                            onClick={this.cancel}
                        >
                            取消
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}
