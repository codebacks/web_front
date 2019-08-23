/**
 * 工具条, 显示下载/缩放/旋转 操作
 */

import React from 'react'
import style from './style.scss'

export default props => {
    let download
    if (props.src) {
        download = (
            <a href={props.src} download>
                <span className={`${style.item} icon-download`}/>
            </a>
        )
    }
    let zoomIn
    if(props.error || props.loading || props.disableZoomIn) {
        zoomIn = <span className={`${style.item} icon-zoom-in ${style.disable}`}/>
    } else {
        zoomIn = <span className={`${style.item} icon-zoom-in`} onClick={props.handleZoom.bind(this, false)}/>
    }

    let zoomOut
    if(props.error || props.loading || props.disableZoomOut) {
        zoomOut = <span className={`${style.item} icon-zoom-out ${style.disable}`}/>
    } else {
        zoomOut = <span className={`${style.item} icon-zoom-out`} onClick={props.handleZoom.bind(this, true)}/>
    }

    let rotateRight
    if(props.error) {
        rotateRight = <span className={`${style.item} icon-ccw ${style.disable}`}/>
    } else {
        rotateRight = <span className={`${style.item} item icon-ccw`} onClick={props.handleRotate.bind(this, -90)}/>
    }

    let rotateLeft
    if(props.error) {
        rotateLeft = <span className={`${style.item} icon-cw ${style.disable}`}/>
    } else {
        rotateLeft = <span className={`${style.item} icon-cw`} onClick={props.handleRotate.bind(this, 90)}/>
    }

    return (
        <div className={style.toolbar}>
            {zoomIn}
            {zoomOut}
            {rotateRight}
            {rotateLeft}
            {download}
        </div>
    )
}
