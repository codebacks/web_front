import React from 'react'
import styles from './index.less'
import {hot} from 'react-hot-loader'
import {connect} from 'dva/index'
import documentTitleDecorator from 'hoc/documentTitle'
import IframeContent from './components/IframeContent'
import pathToRegexp from "path-to-regexp"
import {router} from 'umi'
import _ from 'lodash'

const path = `/app/:id`
const keys = []
const pathRegexp = pathToRegexp(path, keys)

function getMatch(props) {
    const pathname = props.routing.location.pathname
    const match = pathRegexp.exec(pathname)
    if (!match) return null
    const [url, ...values] = match
    const isExact = pathname === url

    return {
        url: path === "/" && url === "" ? "/" : url,
        path,
        isExact,
        params: keys.reduce((memo, key, index) => {
            memo[key.name] = values[index]
            return memo
        }, {}),
    }
}

const maxIframe = 3

@hot(module)
@connect(({app, base, routing}) => ({
    app,
    base,
    routing,
}))
@documentTitleDecorator()
export default class Index extends React.Component {
    state = {}

    static getDerivedStateFromProps(props, state) {
        const match = getMatch(props)
        if (match) {
            const {params: {id} = {}} = match
            const {recentApps = [], recentAppsInit} = props.app
            const len = recentApps.length
            if (id >= maxIframe) {
                router.push('/apps/app_list')
            }else if (recentAppsInit && len < 1) {
                router.push('/apps/app_list')
            }else if (recentAppsInit && !recentApps[id]) {
                router.push(`/app/${id - 1}`)
            }
        }

        return null
    }

    componentDidMount() {
        // window.addEventListener("message", this.message, false)
    }

    message = (event)=>{
        // console.log(event.data, typeof event.data)
    }

    componentWillUnmount() {
        // window.removeEventListener("message", this.message)
    }

    renderApp = (match) => {
        const {base, app} = this.props
        const {recentApps = []} = app
        const {accessToken} = base
        const id = _.get(match, 'params.id', -1)

        return recentApps.slice(0, maxIframe).map((item, index) => {
            return (
                <IframeContent
                    dispatch={this.props.dispatch}
                    key={item.id}
                    url={item.url}
                    item={item}
                    show={Number(id) === index}
                    accessToken={accessToken}
                />
            )
        })
    }

    render() {
        const match = getMatch(this.props)

        return (
            <div
                className={styles.main}
                style={{
                    display: !match && 'none',
                }}
            >
                {
                    this.renderApp(match)
                }
            </div>
        )
    }
}
