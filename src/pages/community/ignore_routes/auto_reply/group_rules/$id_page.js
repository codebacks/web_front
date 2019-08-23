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
    categoryLoading: loading.effects['community_groupRules/category'],
}))
@documentTitleDecorator({
    title: '编辑群规则',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const id = this.props.match.params.id

        this.props.dispatch({
            type: 'community_groupRules/category',
            payload: id,
        })
    }

    cancel = () => {
        this.props.dispatch({
            type: 'community_groupRules/resetState',
        })
        router.push('/community/auto_reply?type=group_auto_reply')
    }

    ok = () => {
        const id = this.props.match.params.id

        this.props.dispatch({
            type: 'community_groupRules/categoryUpdate',
            payload: {
                id,
            },
            callback: () => {
                this.cancel()
            },
        })
    }

    render() {
        const {
            categoryUpdateLoading,
            categoryLoading,
        } = this.props

        return (
            <div className={styles.rules}>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '自动回复',
                                path: '/community/auto_reply?type=group_auto_reply',
                            },
                            {
                                name: '编辑群规则',
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
                            loading={categoryUpdateLoading || categoryLoading}
                            type="primary"
                            className={styles.btn}
                            onClick={this.ok}
                        >
                            确定
                        </Button>
                        <Button
                            loading={categoryUpdateLoading || categoryLoading}
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
