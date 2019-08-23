/**
 * 从 qrcode.react [https://github.com/zpao/qrcode.react] 复制的代码，
 * 因为 qrcode.react 默认使用 window.devicePixelRatio 属性。导致在2K屏和3K屏下，下载下来的二维码图的大小和web显示的图片大小不一致
 * 
 * 使用方式和qrcode.react 一直，增加useDevicePixelRatio 来判断是否使用 window.devicePixelRatio功能。默认为true
 * created by luolong
 */

import React from 'react'
import QRCodeImpl from 'qr.js/lib/QRCode'
const ErrorCorrectLevel = require('qr.js/lib/ErrorCorrectLevel')

const DEFAULT_PROPS = {
    size: 128,
    level: 'L',
    bgColor: '#FFFFFF',
    fgColor: '#000000'
}


// Convert from UTF-16, forcing the use of byte-mode encoding in our QR Code.
// This allows us to encode Hanji, Kanji, emoji, etc. Ideally we'd do more
// detection and not resort to byte-mode if possible, but we're trading off
// a smaller library for a smaller amount of data we can potentially encode.
// Based on http://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/
function convertStr(str) {
    let out = ''
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i)
        if (charcode < 0x0080) {
            out += String.fromCharCode(charcode)
        } else if (charcode < 0x0800) {
            out += String.fromCharCode(0xc0 | (charcode >> 6))
            out += String.fromCharCode(0x80 | (charcode & 0x3f))
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            out += String.fromCharCode(0xe0 | (charcode >> 12))
            out += String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f))
            out += String.fromCharCode(0x80 | (charcode & 0x3f))
        } else {
        // This is a surrogate pair, so we'll reconsitute the pieces and work
        // from that
            i++
            charcode =
          0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
            out += String.fromCharCode(0xf0 | (charcode >> 18))
            out += String.fromCharCode(0x80 | ((charcode >> 12) & 0x3f))
            out += String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f))
            out += String.fromCharCode(0x80 | (charcode & 0x3f))
        }
    }
    return out
}

class QRCodeCanvas extends React.PureComponent {
    _canvas = null
  
    static defaultProps = DEFAULT_PROPS;
  
    componentDidMount() {
        this.update()
    }
  
    componentDidUpdate() {
        this.update()
    }
  
    update() {
        const {value, size, level, bgColor, fgColor , useDevicePixelRatio} = this.props
  
        // We'll use type===-1 to force QRCode to automatically pick the best type
        const qrcode = new QRCodeImpl(-1, ErrorCorrectLevel[level])
        qrcode.addData(convertStr(value))
        qrcode.make()
  
        if (this._canvas != null) {
            const canvas = this._canvas
  
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                return
            }
            const cells = qrcode.modules
            if (cells === null) {
                return
            }
            const tileW = size / cells.length
            const tileH = size / cells.length
            const scale = useDevicePixelRatio ? (window.devicePixelRatio || 1 ) : 1
            canvas.height = canvas.width = size * scale
            ctx.scale(scale, scale)
  
            cells.forEach(function(row, rdx) {
                row.forEach(function(cell, cdx) {
                    ctx && (ctx.fillStyle = cell ? fgColor : bgColor)
                    const w = Math.ceil((cdx + 1) * tileW) - Math.floor(cdx * tileW)
                    const h = Math.ceil((rdx + 1) * tileH) - Math.floor(rdx * tileH)
                    ctx &&
              ctx.fillRect(
                  Math.round(cdx * tileW),
                  Math.round(rdx * tileH),
                  w,
                  h
              )
                })
            })
        }
    }
  
    render() {
        const {
            value,
            size,
            level,
            bgColor,
            fgColor,
            style,
            ...otherProps
        } = this.props
        const canvasStyle = {height: size, width: size, ...style}
        return (
            <canvas
                style={canvasStyle}
                height={size}
                width={size}
                ref={(ref) =>
                    (this._canvas = ref)
                }
                {...otherProps}
            />
        )
    }
}

const QRCode = (props) => {
    const {renderAs, useDevicePixelRatio,...otherProps} = props
    const Component = QRCodeCanvas
    return <Component {...otherProps} />
}
  
QRCode.defaultProps = {renderAs: 'canvas',  useDevicePixelRatio: true, ...DEFAULT_PROPS}
  
export default QRCode