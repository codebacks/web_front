/**
 * 底部栏, 用于显示图片位置与总数
 */
import React from 'react'
import style from './style.scss'

export default props => {
    const ratio = (parseInt(props.ratio * 100, 10)) + '%'
    let zoom
    if (!props.error) {
        zoom = <div className={style.zoom}>{ratio}</div>
    }

    let index
    if (!props.single) {
        index = (
            <div className={style.index}>
                <span className={style.current}>{props.index + 1}</span>
                <span className={style.split}>/</span>
                <span className={style.total}>{props.images.length}</span>
            </div>
        )
    }
    return (
        <div className={style.footer}>
            <div className={style.info}>
                {zoom}
                {index}
            </div>
        </div>
    )
}
