import React, {Fragment} from 'react'
import {Modal, Spin} from 'antd'
import {connect} from "dva/index"
import _ from 'lodash'
import styles from './index.scss'
import createFaceHtml from 'components/Face/createFaceHtml'

@connect(({base, wx_moments, loading}) => ({
    base,
    wx_moments,
    commentsLoading: loading.effects['wx_moments/momentComments']
}))
export default class MomentDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    componentDidMount() {
        this.loadComments()
    }

    componentWillUnmount() {
    }

    loadComments = () => {

    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {visible, commentsLoading} = this.props
        const {comments} = this.props.wx_moments


        return (
            <Modal
                centered={true}
                title="延时评论"
                visible={visible}
                wrapClassName={styles.wrapper}
                maskClosable={false}
                destroyOnClose={true}
                onCancel={this.handleCancel}
                footer={null}>
                <Spin spinning={!!commentsLoading}>
                    <div className={styles.comments}>
                        {
                            comments.map((comment, index)=>{
                                return <div className={styles.item}>
                                    {createFaceHtml({tagName: 'pre', tagProps: {className: styles.comment}, values: comment})}
                                </div>
                            })
                        }
                    </div>
                </Spin>
            </Modal>
        )
    }
}
