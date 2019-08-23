/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/19
 */

import React, {useState, useCallback, useRef} from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'antd'
import useToggle from 'hooks/useToggle'
import _ from 'lodash'

const hooksModalDecorator = (option = {}) => {
    return function createHooksModal(ModalContent) {
        function HooksModal(props) {
            const {renderBtn, modalOption, ...otherProps} = props
            const [status, toggle] = useToggle(false)
            const [modalStateOption, setModalStateOption] = useState({})
            const cancelFnRef = useRef(null)
            const okFnRef = useRef(null)

            const setOnCancelFn = (fn) => {
                cancelFnRef.current = fn
            }

            const setOkFn = (fn) => {
                okFnRef.current = fn
            }

            const setTrue = useCallback(() => {
                toggle(true)
            }, [toggle])

            const setFalse = useCallback(() => {
                toggle(false)
            }, [toggle])

            const setModalOptionState = useCallback(
                (nextValue) => {
                    setModalStateOption(_.merge({}, modalStateOption, nextValue))
                },
                [modalStateOption],
            )

            const onOk = useCallback((...arg) => {
                if (typeof okFnRef.current === 'function') {
                    okFnRef.current(...arg)
                }
            }, [])

            const onCancel = useCallback(
                (...arg) => {
                    if (typeof cancelFnRef.current === 'function') {
                        cancelFnRef.current(...arg)
                    }

                    setFalse()
                },
                [setFalse],
            )

            const setModalOption = useCallback(() => {
                return {
                    ...option,
                    ...modalOption,
                    ...modalStateOption,
                }
            }, [modalOption, modalStateOption])

            const getModalOptionFn = useCallback(() => {
                const fn = props.setModalOption || option.setModalOption || setModalOption
                if (typeof fn !== 'function') {
                    throw new Error('setModalOption必须是函数')
                }

                return fn
            }, [props.setModalOption, setModalOption])

            const modalOptions = getModalOptionFn()({
                highestOption: {
                    onOk,
                    onCancel,
                    visible: status,
                },
                modalStateOption,
                modalOption,
                option,
                props,
                state: modalStateOption,
            })

            return (
                <>
                    {renderBtn(setTrue)}
                    <Modal visible={status} onOk={onOk} onCancel={onCancel} {...modalOptions}>
                        <ModalContent
                            {...otherProps}
                            modalOptions={modalOptions}
                            setModalOptionState={setModalOptionState}
                            onModalCancel={setFalse}
                            setModalOkFn={setOkFn}
                            setModalOnCancelFn={setOnCancelFn}
                        />
                    </Modal>
                </>
            )
        }

        HooksModal.defaultProps = {
            modalOption: {},
        }

        HooksModal.propTypes = {
            modalOption: PropTypes.object,
            setModalOption: PropTypes.func,
            renderBtn: PropTypes.func.isRequired,
        }

        return React.memo(HooksModal)
    }
}

export default hooksModalDecorator
