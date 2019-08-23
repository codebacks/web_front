import React from 'react'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import IframeContent from 'layouts/AppLayout/components/IframeContent'

@hot(module)
@connect(({app, base}) => ({
    app,
    base,
}))
@documentTitleDecorator()
export default class Index extends React.Component {

    state = {
        recentApp: {},
    }

    componentDidMount() {
        const {query: {id} = {}} = this.props.location
        this.props.dispatch({
            type: 'app/getApp',
            payload: {
                id,
            },
            callback: (data) => {
                this.setState({
                    recentApp: data,
                })
            },
        })
    }

    render() {
        const {recentApp} = this.state
        const {accessToken} = this.props.base

        return (
            <div className={styles.main}>
                <IframeContent
                    base={this.props.base}
                    key={recentApp.id}
                    item={recentApp}
                    show={true}
                    dispatch={this.props.dispatch}
                    url={recentApp.preview_url}
                    accessToken={accessToken}
                />
            </div>
        )
    }
}
