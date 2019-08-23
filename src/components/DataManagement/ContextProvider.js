/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */

import React from 'react'
import PropTypes from "prop-types"
import _ from 'lodash'
import {
    assignStateByPath,
    setStateByPath,
} from './utils'

export default function createContextProvider(Context) {
    return class ContextProvider extends React.PureComponent {
        static propTypes = {
            initStore: PropTypes.object.isRequired,
        }

        static defaultProps = {
            initStore: {},
        }

        constructor(props) {
            super(props)
            this.state = props.initStore
        }

        assignStoreByPath = ({path = '', value = {}}, cb) => {
            return this.setState(assignStateByPath({
                state: this.state,
                path,
                value,
            }), cb)
        }

        setStoreByPath = ({path = '', value = {}}, cb) => {
            return this.setState(setStateByPath({
                state: this.state,
                path,
                value,
            }), cb)
        }

        setStoreDeep = (state = {}, cb) => {
            return this.setState(_.defaultsDeep({}, state, this.state), cb)
        }

        setStore = (...arg)=>{
            return this.setState(...arg)
        }

        render() {
            const {
                contextProps
            } = this.props

            return (
                <Context.Provider
                    value={{
                        contextProps: contextProps,
                        store: this.state,
                        setStoreDeep: this.setStoreDeep,
                        assignStoreByPath: this.assignStoreByPath,
                        setStoreByPath: this.setStoreByPath,
                        setStore: this.setStore,
                    }}
                >
                    {this.props.children}
                </Context.Provider>
            )
        }
    }
}
