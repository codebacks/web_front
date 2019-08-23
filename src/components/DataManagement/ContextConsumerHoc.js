/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 *
    @consumerHoc({
        mapStoreToProps: (
            {
                contextProps,
                setStoreDeep,
                assignStoreByPath,
                setStoreByPath,
                setStore,
                store: {
                    tabsActiveKey,
                    index,
                    tabsData,
                },
            },
            props,
        ) => {
            return {
                ...props,
                ...{
                    tabsActiveKey,
                    index,
                    setStoreDeep,
                    tabsData,
                },
            }
        },
    })
 */

import React, {PureComponent} from "react"
import {setHOCDisplayName} from "tools/util"
import hoistStatics from "hoist-non-react-statics"

const defaultOption = {
    mapStoreToProps: (value, props) => {
        return {
            ...value,
            ...props,
        }
    },
}

const contextConsumerHocWarp = (context) => {
    return (option) => {
        option = Object.assign({}, defaultOption, option)

        return (NewComponent) => {
            class contextConsumerHoc extends PureComponent {
                static displayName = setHOCDisplayName(NewComponent, 'contextConsumerHoc')

                render() {
                    return (
                        <context.Consumer>
                            {
                                (value) => {
                                    const props = option.mapStoreToProps(value, this.props)

                                    return (
                                        <NewComponent
                                            {...props}
                                        />
                                    )
                                }
                            }
                        </context.Consumer>
                    )
                }
            }

            contextConsumerHoc.WrappedComponent = NewComponent

            return hoistStatics(contextConsumerHoc, NewComponent)
        }
    }
}

export default contextConsumerHocWarp