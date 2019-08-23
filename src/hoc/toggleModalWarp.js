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
import Toggle from 'components/Toggle'
import {Modal} from "antd"
import _ from 'lodash'

const toggleModalWarpDecorator = (option = {}) => {
    return (NewComponent) => {
        class ToggleModalWarpEnhance extends React.PureComponent {
            static displayName = setHOCDisplayName(NewComponent, 'ToggleModalWarpEnhance')

            static propTypes = {
                modalOption: PropTypes.object.isRequired,
                setModalOption: PropTypes.func,
                renderBtn: PropTypes.func.isRequired,
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
                this.onCancelFn = null
            }

            setOkFn = (fn) => {
                this.onOkFn = fn
            }

            setOnCancelFn = (fn) => {
                this.onCancelFn = fn
            }

            onCancel = (setFalse, ...arg) => {
                if(typeof this.onCancelFn === 'function') {
                    this.onCancelFn(...arg)
                }

                setFalse()
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
                const {renderBtn, modalOption, ...otherProps} = this.props
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
                    <Toggle>
                        {(
                            {
                                setTrue,
                                status,
                                setFalse,
                            },
                        ) => (
                            <>
                                {
                                    renderBtn(setTrue)
                                }
                                <Modal
                                    {...modalOptions}
                                    visible={status}
                                    onCancel={(...arg) => {
                                        this.onCancel(setFalse, ...arg)
                                    }}
                                >
                                    <NewComponent
                                        {...otherProps}
                                        setModalOptionState={this.setModalOptionState}
                                        onModalCancel={setFalse}
                                        setModalOkFn={this.setOkFn}
                                        setModalOnCancelFn={this.setOnCancelFn}
                                    />
                                </Modal>
                            </>
                        )}
                    </Toggle>
                )
            }
        }

        ToggleModalWarpEnhance.WrappedComponent = NewComponent

        return hoistStatics(ToggleModalWarpEnhance, NewComponent)
    }
}

export default toggleModalWarpDecorator
