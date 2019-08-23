/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/8
 */
import Schema from 'async-validator'
import _ from 'lodash'

export function initValidator(descriptor) {
    return {
        validator: new Schema(descriptor),
        formStates: getInitFormStates(descriptor),
    }
}

export function getErrorMessage(errors) {
    return `${_.get(errors, '[0].field')}${_.get(errors, '[0].message')}`
}

export function getInitFormStates(descriptor) {
    const formStates = {}
    Object.keys(descriptor).forEach((key) => {
        formStates[key] = {
            // validateStatus: '',
            help: '',
        }
    })
    return formStates
}

export function defaultFormatMessages(messages) {
    return messages.map(({message}) => {
        return message
    }).join(',')
}

function getAntdBeforeValidateFormStates(formData) {
    const formStates = {}
    Object.keys(formData).forEach((key) => {
        formStates[key] = {
            validateStatus: 'validating',
            help: '验证中...',
        }
    })

    return formStates
}

function getAntdFormStates(formData, fields, formatMessages = defaultFormatMessages) {
    const formStates = {}
    Object.keys(formData).forEach((key) => {
        const messages = _.get(fields, key)
        if(messages) {
            formStates[key] = {
                validateStatus: 'error',
                help: formatMessages(messages),
            }
        }else {
            formStates[key] = {
                // validateStatus: '',
                help: '',
            }
        }
    })

    return formStates
}

export function validateAll(
    {
        validator,
        formData,
        callback,
        beforeValidate,
        getBeforeValidateFormStates = getAntdBeforeValidateFormStates,
        getFormStates = getAntdFormStates,
    },
) {
    if(formData) {
        if(typeof beforeValidate === 'function') {
            beforeValidate(getBeforeValidateFormStates(formData))
        }
        validator.validate(formData, (errors, fields) => {
            if(typeof callback === 'function') {
                callback(
                    errors,
                    fields,
                    getFormStates(formData, fields),
                )
            }
        })
    }
}

export function validate(
    {
        validator,
        newForm = {},
        oldForm = {},
        beforeValidate,
        getBeforeValidateFormStates = getAntdBeforeValidateFormStates,
        callback,
        getFormStates = getAntdFormStates,
    },
) {
    const formData = {}
    let isValidator = false
    Object.keys(newForm).forEach((key) => {
        if(newForm[key] !== oldForm[key]) {
            isValidator = true
        }
        formData[key] = newForm[key]
    })

    if(isValidator) {
        if(typeof beforeValidate === 'function') {
            beforeValidate(getBeforeValidateFormStates(formData))
        }
        validator.validate(formData, (errors, fields) => {
            if(typeof callback === 'function') {
                callback(
                    errors,
                    fields,
                    getFormStates(formData, fields),
                )
            }
        })
    }
}
