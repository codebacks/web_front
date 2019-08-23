import React, {Component} from 'react'
import request from 'utils/request'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import {setHOCDisplayName} from 'tools/utils'

const serviceEnhance = (NewComponent) => {
    class Service extends Component {
        static displayName = setHOCDisplayName(NewComponent, 'leo-Service')

        static propTypes = {
            wrappedComponentRef: PropTypes.func,
        }

        _isMounted = false

        componentDidMount() {
            this._isMounted = true
        }

        componentWillUnmount() {
            this._isMounted = false
        }

        request = (...arg) => {
            return new Promise((resolve, reject) => {
                request(...arg).then((...arg) => {
                    if(this._isMounted) {
                        resolve(...arg)
                    }else {
                        reject({
                            ...arg,
                            isMounted: false,
                            error: new Error('component is mounted'),
                        })
                    }
                }).catch((error) => {
                    reject({
                        isMounted: this._isMounted,
                        error,
                    })
                })
            })
        }

        getRef = (ref) => {
            if(typeof this.props.getInnerRef === 'function') {
                this.props.getInnerRef(ref)
            }
        }

        render() {
            return (
                <NewComponent
                    ref={this.getRef}
                    {...this.props}
                    request={this.request}
                />
            )
        }
    }

    Service.WrappedComponent = NewComponent

    return hoistStatics(Service, NewComponent)
}

export default serviceEnhance
