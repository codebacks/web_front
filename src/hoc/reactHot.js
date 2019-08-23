/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/15
 */

import {hot, setConfig} from 'react-hot-loader'

const reactHotDecorator = (option = {}) => {
    return (NewComponent) => {
        option = Object.assign({logLevel: 'error'}, option)
        setConfig(option)

        return hot(module)(NewComponent)
    }
}

export default reactHotDecorator