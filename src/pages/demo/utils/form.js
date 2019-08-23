/**
 **@Description:
 **@author: leo
 */

import request from './request'
import {Form} from 'antd'

export {request}

const leoFormValue = Symbol('leoFormValue')

const getTranformValue = (transform, data) => {
    var {convert, name} = transform
    if(convert){
        return convert(data[name])
    }else {
        return data[name]
    }
}

export function objToAntdForm(obj, transformArr = []) {
    const form = {}

    transformArr.forEach((key) => {
        var transform = {}
        if(typeof key === 'object'){
            transform = key
        } else {
            transform = {name: key}
        }
       
        const name = transform.name
        const value = getTranformValue(transform, obj)

        if(value && value[leoFormValue]) {
            form[name] = Form.createFormField(value)
        }else {
            form[name] = Form.createFormField({
                value: value,
                [leoFormValue]: true,
            })
        }
    })

    return form
}

export function AntdFormToObj(form) {
    form = Object.assign({}, form)
    Object.keys(form).forEach((key)=>{
        const value = form[key]
        if(value && value[leoFormValue]) {
            form[key] = value.value
        }
    })
    return form
}