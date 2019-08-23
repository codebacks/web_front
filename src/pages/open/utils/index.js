/**
 **@Description:
 **@author: A
 */

import request from './request'
import {Form} from 'antd'

export {request}
const leoFormValue = Symbol('leoFormValue')

const getTranformValue = (transform, data) => {   
    var {convert, name} = transform
    const value = data[name]
    if(value && value[leoFormValue]){
        return value
    }    
    if(convert){
        return convert(value)
    }else {
        return value
    }
}
export function objToAntdForm(obj, transformArr = []) {
    const form = {}

    transformArr.forEach((key) => {
        // const value = obj[key]

        // if(value && value[leoFormValue]) {
        //     form[key] = Form.createFormField(obj[key])
        // }else {
        //     form[key] = Form.createFormField({
        //         value: obj[key],
        //         [leoFormValue]: true,
        //     })
        // }


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

