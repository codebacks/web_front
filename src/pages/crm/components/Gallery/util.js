/**
 * 一些图片操作的辅助工具函数
 */
export const ZOOM_STEP = 0.20
export const [MAX_ZOOM_SIZE, MIN_ZOOM_SIZE] = [3, 0.20]

export default {
    getPosition({width, height}, box) {
        let [boxWidth, boxHeight] = [box.offsetWidth, box.offsetHeight]
        const ratio = width / height
        let w, h
        if (width > boxWidth) {
            if (height > boxHeight) {
                const r1 = width / boxWidth
                const r2 = height / boxHeight
                if (r1 > r2) {
                    w = boxWidth
                } else {
                    h = boxHeight
                }

            } else {
                w = boxWidth
            }
        } else {
            if (height > boxHeight) {
                h = boxHeight
            } else {
                w = width
            }
        }
        if (w) {
            h = w / ratio
        } else {
            w = h * ratio
        }
        let top = (boxHeight - h) / 2
        let left = (boxWidth - w) / 2
        return {
            width: w,
            height: h,
            top, left
        }
    },
    getZoomOffset({width, height}, box, rotate = false) {
        const [boxWidth, boxHeight] = [box.offsetWidth, box.offsetHeight]
        let top, left
        if (rotate) {
            if (width > boxHeight) {
                top = (width - height) / 2
            } else {
                top = (boxHeight - height) / 2
            }
            if (height > boxWidth) {
                left = (height - width) / 2
            } else {
                left = (boxWidth - width) / 2
            }
        } else {
            if (width > boxWidth) {
                left = 0
            } else {
                left = (boxWidth - width) / 2
            }
            if (height > boxHeight) {
                top = 0
            } else {
                top = (boxHeight - height) / 2
            }
        }

        return {
            top, left
        }
    },
    getEvent(e) {
        if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
            return {
                pageX: e.touches[0].pageX,
                pageY: e.touches[0].pageY,
                which: 1
            }
        }
        return e
    },

    isInside(e, box) {
        let rect = box.getBoundingClientRect()
        const x = e.pageX - document.body.scrollLeft
        const y = e.pageY - document.body.scrollTop
        if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
            return true
        }
        return false
    },

    isRotation(angle) {
        return angle % 180 !== 0
    },

    getZoomRatio(v, out=false) {
        const n = parseInt(v / ZOOM_STEP, 10)
        if(out) { // 缩小
            return Math.max(MIN_ZOOM_SIZE, (n - 1) * ZOOM_STEP)
        } else { // 放大
            return Math.min(MAX_ZOOM_SIZE, (n + 1) * ZOOM_STEP)
        }
    }

}
