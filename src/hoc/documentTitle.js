/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/14
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import DocumentTitle from 'react-document-title'
import pathToRegexp from 'path-to-regexp'
import {setHOCDisplayName} from 'tools/util'
import withRouter from 'umi/withRouter'
import {connect} from 'dva'

function treeForEach(treeData, cb) {
    treeData.forEach((data) => {
        cb(data)
        if(data.children) {
            treeForEach(data.children, cb)
        }
    })
}

const documentTitleDecorator = (option = {}) => {

    return (NewComponent) => {

        @connect(({base, oem}) => ({
            base,
            oem,
        }))
        @withRouter
        class DocumentTitleEnhance extends Component {
            static displayName = setHOCDisplayName(NewComponent, 'DocumentTitleEnhance')

            static propTypes = {
                wrappedComponentRef: PropTypes.func,
                base: PropTypes.object.isRequired,
                match: PropTypes.object.isRequired,
            }

            getPageTitle = () => {
                const {base, match} = this.props
                const {
                    oemConfig = {},
                } = this.props.oem
                option = Object.assign({title: oemConfig.title || ''}, option)
                const {overrideTitle} = option
                if(typeof overrideTitle === 'function') {
                    return overrideTitle(this.props)
                }else if(overrideTitle) {
                    return overrideTitle
                }

                let title = option.title
                if(base.tree && base.tree.length) {
                    const matchPath = match.path.trim()
                    treeForEach(base.tree, (item) => {
                        if(pathToRegexp(item.url).test(matchPath) && item.name) {
                            title = item.name
                        }
                    })
                }
                return title
            }

            render() {
                const {wrappedComponentRef} = this.props
                const title = this.getPageTitle()
                return (
                    <DocumentTitle title={title}>
                        <NewComponent
                            documentTitle={title}
                            ref={wrappedComponentRef}
                            {...this.props}
                        />
                    </DocumentTitle>
                )
            }
        }

        DocumentTitleEnhance.WrappedComponent = NewComponent

        return hoistStatics(DocumentTitleEnhance, NewComponent)
    }
}

export default documentTitleDecorator
