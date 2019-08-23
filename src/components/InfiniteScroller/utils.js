/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/3/15
 */

const availablePrefixs = ['moz', 'ms', 'webkit']

function requestAnimationFramePolyfill() {
    let lastTime = 0
    return function(callback) {
        const currTime = new Date().getTime()
        const timeToCall = Math.max(0, 16 - (currTime - lastTime))
        const id = window.setTimeout(function() {
            callback(currTime + timeToCall)
        }, timeToCall)
        lastTime = currTime + timeToCall
        return id
    }
}

const noop = () => {
}

export default function getRequestAnimationFrame() {
    if (typeof window === 'undefined') {
        return noop
    }
    if (window.requestAnimationFrame) {
        return window.requestAnimationFrame.bind(window)
    }

    const prefix = availablePrefixs.filter(key => `${key}RequestAnimationFrame` in window)[0]

    return prefix ? window[`${prefix}RequestAnimationFrame`].bind(window) : requestAnimationFramePolyfill()
}

export function cancelRequestAnimationFrame() {
    if (typeof window === 'undefined') {
        return noop
    }
    if (window.cancelAnimationFrame) {
        return window.cancelAnimationFrame.bind(window)
    }
    const prefix = availablePrefixs.filter(
        key => `${key}CancelAnimationFrame` in window || `${key}CancelRequestAnimationFrame` in window,
    )[0]

    return prefix
        ? (window[`${prefix}CancelAnimationFrame`] || window[`${prefix}CancelRequestAnimationFrame`]).bind(window)
        : clearTimeout.bind(window)
}

const reqAnimFrame = getRequestAnimationFrame()
const cancelAnimFrame = cancelRequestAnimationFrame()

export function throttleByAnimationFrame(fn, first = true) {
    let requestId = null
    let i = 0

    const later = args => () => {
        requestId = null
        if (first) {
            i > 1 && fn(...args)
        }else {
            fn(...args)
        }
    }

    const throttled = (...args) => {
        if (requestId == null) {
            i = 0
            first && fn(...args)
            requestId = reqAnimFrame(later(args))
        }
        i++
    }

    throttled.cancel = () => cancelAnimFrame(requestId)

    return throttled
}

const hasNativePerformanceNow =
    typeof performance === 'object' && typeof performance.now === 'function'

const now = hasNativePerformanceNow
    ? () => performance.now()
    : () => Date.now()

export function cancelTimeout(timeoutID) {
    cancelAnimFrame(timeoutID.id)
}

export function requestTimeout(callback, delay) {
    const start = now()

    function tick() {
        if (now() - start >= delay) {
            callback.call(null)
        }else {
            timeoutID.id = reqAnimFrame(tick)
        }
    }

    const timeoutID = {
        id: reqAnimFrame(tick),
    }

    return timeoutID
}
