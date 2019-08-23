import React, {PureComponent} from 'react'
import { Input, Button, message } from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import styles from './index.less'

const TextArea = Input.TextArea
const _state = {
    isEdit: false,
    record: null,
}

@connect(({base, community_groupCodeAddActivity, loading}) => ({
    base,
    community_groupCodeAddActivity,
    addLoading: loading.effects['community_groupCodeAddActivity/add'],
}))
@documentTitleDecorator({
    title: '新建活动',
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            ..._state
        }
    }

    componentDidMount() {
        const { state } = this.props.location
        if(state) {
            const record = state.record
            const type = state.type
            this.setState({
                isEdit: type === 'edit',
                record: record,
            }, () => {
                this.state.isEdit && this.props.dispatch({
                    type: 'community_groupCodeAddActivity/setProperty',
                    payload: {
                        title: record.title,
                        remark: record.remark,
                    },
                })
            })
        }
    }

    componentWillUnmount() {
        this.setState({..._state})
        this.props.dispatch({
            type: 'community_groupCodeAddActivity/resetState'
        })
    }

    handleChange = (key, e) => {
        const val = e.target.value
        this.props.dispatch({
            type: 'community_groupCodeAddActivity/setProperty',
            payload: {
                [key]: val,
            },
        })
    }

    ok = () => {
        const { title } = this.props.community_groupCodeAddActivity
        const { dispatch } = this.props
        const { isEdit } = this.state
        if(!title) {
            message.warning('请输入群活动名称')
        }else{
            let effect = isEdit ? 'set': 'add'
            dispatch({
                type: `community_groupCodeAddActivity/${effect}`,
                payload: {
                    id: this.state.record?.id
                },
                callback: () => {
                    message.success(`${isEdit ? '更新': '新建'}活动成功！`, 1)
                    this.cancel()
                }
            })
        }
    }

    cancel = () => {
        this.setState({
            ..._state
        }, () => {
            this.props.dispatch({
                type: 'community_groupCodeAddActivity/resetState'
            })
            setTimeout(()=>{
                router.push('/community/group_code')
            }, 500)
        })
    }

    render() {
        const { title, remark, } = this.props.community_groupCodeAddActivity
        const { addLoading, } = this.props

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {
                                name: '群活动',
                                path: '/community/group_code'
                            },
                            {
                                name: '新建活动',
                            },
                        ]
                    }
                />
                <div className={styles.addActivity}>
                    <div className={styles.row}>
                        <div className={styles.txt}><span style={{color: 'red'}}>* </span>群活动名称：</div>
                        <Input
                            placeholder="请输入群活动名称，限30字内"
                            value={title}
                            onChange={(e) => this.handleChange('title', e)}
                            maxLength={30}
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={styles.txt}>备注说明：</div>
                        <TextArea
                            placeholder="请输入备注，200字以内"
                            value={remark}
                            onChange={(e) => this.handleChange('remark', e)}
                            maxLength={200}
                            rows={6}
                        />
                    </div>
                    <div className={styles.row}>
                        <Button type='primary' onClick={this.ok} style={{marginRight: 30}} loading={addLoading}>确定</Button>
                        <Button onClick={this.cancel}>取消</Button>
                    </div>
                </div>
            </div>
        )
    }
}
