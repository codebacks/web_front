/**
 **@Description:
 **@author: leo
 */

import request from './request'
import {Form} from 'antd'

export {request}
const leoFormValue = Symbol('leoFormValue')

export function findParents(item, parentName = 'parent') {
    const parents = []

    while(item[parentName]) {
        parents.unshift(item[parentName])
        item = item[parentName]
    }

    return parents
}

export function forEachParents(item, cb, parentName = 'parent') {
    while(item[parentName]) {
        cb(item[parentName])
        item = item[parentName]
    }
}

export function objToAntdForm(obj, transformArr = []) {
    const form = {}

    transformArr.forEach((key) => {
        const value = obj[key]
        if(value && value[leoFormValue]) {
            form[key] = Form.createFormField(obj[key])
        }else {
            form[key] = Form.createFormField({
                value: obj[key],
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