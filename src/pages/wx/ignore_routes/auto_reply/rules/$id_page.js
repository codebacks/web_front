import React from 'react'
import {
    Row,
    Col,
    Divider, Button,
} from 'antd'
import {connect} from "dva/index"
import documentTitleDecorator from 'hoc/documentTitle'
import MatchContents from '../components/MatchContents'
import ReplyContents from '../components/ReplyContents'
import styles from './index.less'
import router from "umi/router"
import ContentHeader from 'business/ContentHeader'

@connect(({wx_Rules, loading}) => ({
    wx_Rules,
    categoryUpdateLoading: loading.effects['wx_Rules/categoryUpdate'],
    categoryLoading: loading.effects['wx_Rules/category'],
}))
@documentTitleDecorator({
    title: '编辑规则',
})
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {
        const id = this.props.match.params.id

        this.props.dispatch({
            type: 'wx_Rules/category',
            payload: id,
        })
    }

    cancel = () => {
        this.props.dispatch({
            type: 'wx_Rules/resetState',
        })
        router.push('/wx/auto_reply?type=auto_reply')
    }

    ok = () => {
        const id = this.props.match.params.id

        this.props.dispatch({
            type: 'wx_Rules/categoryUpdate',
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
                                name: '好友自动回复',
                                path: '/wx/auto_reply?type=auto_reply',
                            },
                            {
                                name: '编辑规则',
                            },
                        ]
                    }
                />
                <div className={styles.contents}>
                    <Row type={'flex'}>
                        <Col span={12}>
                            <MatchContents/>
                        </Col>
                        <Col span={1} className={styles.center}>
                            <Divider type="vertical" className={styles.vertical}/>
                        </Col>
                        <Col span={11}>
                            <ReplyContents/>
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
