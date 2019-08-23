/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/11
 */
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import {setHOCDisplayName} from 'tools/util'


const GetRefDecorator = () => {
    return (NewComponent) => {
        class GetRefEnhance extends Component {
            static displayName = setHOCDisplayName(NewComponent, 'getRefEnhance')

            static propTypes = {
                getLeoRef: PropTypes.object,
            }

            render() {
                const {getLeoRef, ...otherProps} = this.props
                return (
                    <NewComponent
                        ref={getLeoRef}
                        {...otherProps}
                    />
                )
            }
        }

        GetRefEnhance.WrappedComponent = NewComponent

        return hoistStatics(GetRefEnhance, NewComponent)
    }

}

export default GetRefDecorator