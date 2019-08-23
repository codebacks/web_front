/**
     * 文件说明:
     * ----------------------------------------
     * 创建用户: leo
     * 创建日期 2018/10/15
     */

import React from 'react'
import PropTypes from 'prop-types'
import hoistStatics from 'hoist-non-react-statics'
import {setHOCDisplayName} from 'tools/util'
import {Modal} from "antd"
import _ from 'lodash'

const modalWarpDecorator = (option = {}) => {
    return (NewComponent) => {
        class ModalWarpEnhance extends React.PureComponent {
                static displayName = setHOCDisplayName(NewComponent, 'ModalWarpEnhance')

                static propTypes = {
                    modalOption: PropTypes.object.isRequired,
                    setModalOption: PropTypes.func,
                }

                static defaultProps = {
                    modalOption: {
                        destroyOnClose: true,
                    },
                }

                constructor(props) {
                    super(props)
                    this.onOkFn = null
                    this.state = {
                        modalStateOption: {},
                    }
                }

                getModalStateOptionState = (option) => {
                    return _.merge({}, this.state.modalStateOption, option)
                }

                componentWillUnmount() {
                    this.onOkFn = null
                }

                setOkFn = (fn) => {
                    this.onOkFn = fn
                }

                setModalOptionState = (modalStateOption = {}) => {
                    this.setState({
                        modalStateOption: this.getModalStateOptionState(modalStateOption),
                    })
                }

                onOk = (...arg) => {
                    if(typeof this.onOkFn === 'function') {
                        this.onOkFn(...arg)
                    }
                }

                getModalOptionFn = () => {
                    const fn = this.props.setModalOption || option.setModalOption || this.setModalOption
                    if(typeof fn !== 'function') {
                        throw new Error('setModalOption必须是函数')
                    }
                    return fn
                }

                setModalOption = ({highestOption, modalStateOption, modalOption, option, props, state}) => {
                    return {
                        ...option,
                        ...modalOption,
                        ...modalStateOption,
                        ...highestOption,
                    }
                }

                render() {
                    const {modalOption, ...otherProps} = this.props
                    const {modalStateOption} = this.state
                    const modalOptions = this.getModalOptionFn()({
                        highestOption: {
                            onOk: this.onOk,
                        },
                        modalStateOption,
                        modalOption,
                        option,
                        props: this.props,
                        state: this.state,
                    })

                    return (
                        <Modal
                            {...modalOptions}
                        >
                            <NewComponent
                                {...otherProps}
                                setModalOptionState={this.setModalOptionState}
                                onModalCancel={modalStateOption.onCancel || modalOption.onCancel}
                                setModalOkFn={this.setOkFn}
                            />
                        </Modal>
                    )
                }
        }

        ModalWarpEnhance.WrappedComponent = NewComponent

        return hoistStatics(ModalWarpEnhance, NewComponent)
    }
}

export default modalWarpDecorator
