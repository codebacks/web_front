import _ from 'lodash'

function getRaven() {
    return _.get(window, 'Raven')
}

export function warpExtra(extra) {
    if(typeof extra === 'string'){
        return {msg: extra}
    }

    return extra
}

export function warpError(err) {
    if(err instanceof Error){
        return err
    }else {
        if(typeof err === 'object'){
            try {
                return JSON.stringify(err)
            }catch(e) {
                return err
            }
        }

        return err
    }
}

export function captureException(...arg) {
    const Raven = getRaven()
    if(Raven && typeof Raven.captureException === 'function') {
        Raven.captureException(...arg)
    }
}