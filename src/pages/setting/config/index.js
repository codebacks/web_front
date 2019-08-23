/**
 **@Description:
 **@author: leo
 */
import {getCurrentOem} from '@/common/oem-config'

const config = require(`./${HUZAN_ENV}.js`)

const all = {
    ...config.default,
    ...config[getCurrentOem()],
}

export default Object.assign({
    apiHost: '',
}, all)
