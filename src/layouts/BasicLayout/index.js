import React from 'react'
import {Layout} from 'antd'
import DocumentTitle from 'react-document-title'
import {connect} from 'dva'
import _ from 'lodash'
import router from 'umi/router'
import GlobalHeader from 'components/GlobalHeader'
import {$on, $off} from 'tools/dom/event'
import styles from './index.less'
import {matchGlobalPagePaths, checkPathList, urlToList, matchIgnoreCheckPagesPermissionPaths} from 'utils'
import withRouter from "umi/withRouter"
import AppLayout from 'layouts/AppLayout'

@withRouter
@connect(({base, oem}) => ({
    base,
    oem,
}))
export default class Index extends React.PureComponent {
    componentDidMount() {
        if(!matchGlobalPagePaths(this.props.location.pathname)) {
            const {accessToken} = this.props.base
            if(accessToken) {
                this.props.dispatch({
                    type: 'base/getInitData',
                })
            }else {
                const {search} = this.props.location
                router.replace(`/login${search}`)
            }
        }

        this.resizeFn = _.throttle((e) => {
            this.props.dispatch({
                type: 'base/setOffset',
            })
        }, 200)

        $on({
            elems: window,
            event: 'resize',
            callback: this.resizeFn,
        })
    }

    componentDidUpdate(prevProps, prevState) {
        const accessToken = _.get(this, 'props.base.accessToken')
        const pathname = _.get(this, 'props.location.pathname')
        if(!accessToken && !matchGlobalPagePaths(pathname)) {
            router.replace(`/login${_.get(this, 'props.location.search')}`)
            return
        }
        const prevPathname = _.get(prevProps, 'location.pathname')
        const prevFlatTree = _.get(prevProps, 'base.flatTree')
        const flatTree = _.get(this, 'props.base.flatTree')

        if(prevPathname !== pathname || prevFlatTree !== flatTree) {
            this.checkPagesPermission(flatTree, pathname)
        }
    }

    componentWillUnmount() {
        if(this.resizeFn) {
            this.resizeFn.cancel()
            $off({elems: window, event: 'resize', callback: this.resizeFn})
        }
    }

    checkPagesPermission = (flatTree, pathname) => {
        if(flatTree !== null && !matchIgnoreCheckPagesPermissionPaths(pathname)) {
            const pathnameList = urlToList(pathname)
            const noPermission = flatTree.findIndex((item) => {
                return checkPathList(item.url, pathnameList)
            }) === -1

            if(noPermission) {
                router.push('/403')
            }
        }
    }

    getPageTitle() {
        const {
            oemConfig: {
                title = '',
            } = {},
        } = this.props.oem

        return title
    }

    render() {
        const {children, location} = this.props

        let {pathname} = location
        pathname = pathname.startsWith('/') ? pathname : `/${pathname}`
        if(pathname.startsWith('/ui')) {
            return <div style={{height: '100%'}}>{children}</div>
        }

        if(matchGlobalPagePaths(location.pathname)) {
            return children
        }

        return (
            <DocumentTitle title={this.getPageTitle()}>
                <Layout className={styles.layout}>
                    <GlobalHeader {...this.props}/>
                    {children}
                    <AppLayout/>
                </Layout>
            </DocumentTitle>
        )
    }
}
