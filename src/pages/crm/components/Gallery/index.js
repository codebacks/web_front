'use strict'
/**
 * 弹出层容器: 弹出层, 右上角关闭按钮, 左右切换
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import Util, {MAX_ZOOM_SIZE, MIN_ZOOM_SIZE, ZOOM_STEP} from './util'
import ToolBar from './Toolbar'
import ImageBox from './ImageBox'
import Footer from './Footer'

import style from './style.scss'
/**
 * 单位时间间隔wait 内最多只能执行一次fn
 * 如果单位时间内多次触发，接受第一次，此时第二次，第二次将在第一次执行完wait后执行
 * 若在第二次等待过程中，第三次进来，则第二次会被放弃（参数被替换）
 * 同理，多次进来，第一次执行后等待wait，执行的总是最后一次
 * @param fn
 * @param wait
 * @returns {Function}
 */
function throttle(fn, wait=50) {
    let context, args, timeout, result
    let previous = 0
    let later = function () {
        previous = new Date()
        timeout = null
        result = fn.apply(context, args)
    }
    return function () {
        let now = new Date()
        let remaining = wait - (now - previous)
        context = this
        args = arguments // 参数被替换，因此多次时候，等待的总是用最后一次
        if (remaining <= 0) {
            clearTimeout(timeout)
            timeout = null
            previous = now
            result = fn.apply(context, args)
        } else if (!timeout) {
            timeout = setTimeout(later, remaining)
        }
        return result
    }
}

export default class extends Component {
    static defaultProps = {
        images: [],
        src: undefined,
        single: false,
        toolbar: true,
        onClose: function () {
        }
    };

    static propTypes = {
        images: PropTypes.array.isRequired,
        src: PropTypes.string,
        single: PropTypes.bool,
        toolbar: PropTypes.bool,
        onClose: PropTypes.func
    };

    state = {
        index: 0,
        src: undefined,
        loading: true,
        error: false,
        width: 0,
        height: 0,
        rotate: 0,
        ratio: 1,
        top: undefined,
        left: undefined,
        moving: false,
        disableZoomIn: false,
        disableZoomOut: false,
        disableNext: true,
        disablePrev: true
    };

    constructor(props) {
        super(props)
        let index = 0
        let src = props.src
        props.images.some((v, i)=> {
            if (v === src) {
                index = i
                return true
            }
        })
        src = props.images[index]

        this.state.index = index
        this.state.src = src
        this.state.disableNext = index >= props.images.length - 1
        this.state.disablePrev = index <= 0
        this._single = props.single && props.images.length === 1
        this.handleWheel = throttle(this.handleWheel, 100)
        this.handleResize = throttle(this.handleResize)
        this.handleMove = throttle(this.handleMove)
    }

    // componentWillMount() {
    //     document.body.className += ' hide-scroll'
    // }

    componentDidMount() {
        document.body.className += ' hide-scroll'
        document.body.addEventListener('keyup', this.handleKeyUp)
        window.addEventListener('resize', this.handleResize)
        document.addEventListener('mousedown', this.handleMoveStart)
        document.addEventListener('mousemove', this.handleMove)
        document.addEventListener('mouseup', this.handleMoveEnd)
        document.addEventListener('touchstart', this.handleMoveStart)
        document.addEventListener('touchmove', this.handleMove)
        document.addEventListener('touchend', this.handleMoveEnd)
        document.addEventListener('wheel', this.handleWheel)

        this._box = ReactDOM.findDOMNode(this.refs.content)
        this.loadImage(this.state.src)
    }

    componentWillUnmount() {
        document.body.className = document.body.className.replace('hide-scroll', '')
        document.body.removeEventListener('keyup', this.handleKeyUp)
        window.removeEventListener('resize', this.handleResize)
        document.removeEventListener('mousedown', this.handleMoveStart)
        document.removeEventListener('mousemove', this.handleMove)
        document.removeEventListener('mouseup', this.handleMoveEnd)
        document.removeEventListener('touchstart', this.handleMoveStart)
        document.removeEventListener('touchmove', this.handleMove)
        document.removeEventListener('touchend', this.handleMoveEnd)
        document.removeEventListener('wheel', this.handleWheel)
    }

    handleClose = (e) => {
        e.preventDefault()
        this.props.onClose()
    };

    handleKeyUp = (e) => {
        switch (e.keyCode) {
        case 27:
            this.props.onClose()
            break
        case 37:
            if (!this._single) {
                this.handlePrev()
            }
            break
        case 39:
            if (!this._single) {
                this.handleNext()
            }
            break
        }
    };

    handleResize = () => {
        if (!this.state.error) {
            const {width, height, rotate} = this.state
            const box = this._box
            let {top, left} = Util.getZoomOffset({width, height}, box, Util.isRotation(rotate))
            this.setState({
                top, left
            })
        }
    };

    handleWheel = (e) => {
        if (!this.state.error) {
            const box = this._box
            if (Util.isInside(e, box) && e.deltaY !== 0) {
                this.handleZoom(e.deltaY < 0)
            }
        }
    };

    handleNext = () => {
        const max = this.props.images.length - 1
        const min = 0
        let index = this.state.index + 1
        if (index > max) {
            this.setState({
                disableNext: true
            })
        } else {
            this.setState({
                index,
                loading: true,
                disableNext: index >= max,
                disablePrev: index <= min
            })
            this.loadImage(this.props.images[index])
        }
    };

    handlePrev = () => {
        const max = this.props.images.length - 1
        const min = 0
        let index = this.state.index - 1
        if (index < min) {
            this.setState({
                disablePrev: true
            })
        } else {
            this.setState({
                index,
                loading: true,
                disableNext: index >= max,
                disablePrev: index <= min
            })
            this.loadImage(this.props.images[index])
        }
    };

    handleMoveStart = (e) => {
        e.preventDefault()
        const event = Util.getEvent(e)
        const box = this._box
        if (!Util.isInside(event, box) || event.which !== 1) {
            return
        }
        this._point = [event.pageX, event.pageY]
        this._boxWidth = box.offsetWidth
        this._boxHeight = box.offsetHeight
        this.setState({
            moving: true
        })
    };

    handleMoveEnd = (e) => {
        e.preventDefault()
        this._point = null
        this.setState({
            moving: false
        })
    };

    handleMove = (e) => {
        e.preventDefault()
        if (!this._point) {
            return
        }

        const event = Util.getEvent(e)
        const state = this.state
        let x, y
        x = event.pageX - this._point[0]
        y = event.pageY - this._point[1]
        this._point = [event.pageX, event.pageY]

        const left = state.left + x
        const top = state.top + y
        const {width, height} = state
        if (Util.isRotation(state.rotate)) {
            if (left >= (height - width) / 2 || left <= this._boxWidth - (height + width) / 2) {
                x = 0
            }
            if (top >= (width - height) / 2 || top <= this._boxHeight - (width + height) / 2) {
                y = 0
            }
        } else {
            if (left >= 0 || left <= this._boxWidth - state.width) {
                x = 0
            }
            if (top >= 0 || top <= this._boxHeight - state.height) {
                y = 0
            }
        }

        this.setState({
            top: state.top + y,
            left: state.left + x
        })
    };

    loadImage = (src) => {
        if (this._loader) {
            this._loader.onload = null
            this._loader.onerror = null
            this._loader = null
        }
        let img = new Image()
        const that = this
        img.onload = function () {
            img.onload = null
            img.onerror = null
            img = null
            const box = that._box
            const {width, height, top, left} = Util.getPosition({width: this.width, height: this.height}, box)
            const ratio = width / this.width
            that._width = this.width
            that._height = this.height
            that.setState({
                loading: false,
                error: false,
                rotate: 0,
                disableZoomOut: ratio <= MIN_ZOOM_SIZE,
                disableZoomIn: ratio >= MAX_ZOOM_SIZE,
                ratio,
                width, height, top, left, src
            })
        }
        img.onerror = () => {
            img.onload = null
            img.onerror = null
            img = null
            this.setState({
                loading: false,
                error: true,
                src
            })
        }
        img.src = src
        this._loader = img
    };

    handleZoom = (out = false) => {
        const {width, rotate} = this.state
        const ratio = width / this._width
        if ((ratio > MIN_ZOOM_SIZE && out) || (ratio < MAX_ZOOM_SIZE && !out)) {
            const r = Util.getZoomRatio(ratio, out)
            let w = this._width * r
            let h = this._height * r
            const box = this._box
            const offset = Util.getZoomOffset({width: w, height: h}, box, Util.isRotation(rotate))

            this.setState({
                width: w,
                height: h,
                top: offset.top,
                left: offset.left,
                disableZoomOut: r <= MIN_ZOOM_SIZE,
                disableZoomIn: r >= MAX_ZOOM_SIZE,
                ratio: r
            })
        } else {
            if (out) {
                this.setState({
                    disableZoomOut: true
                })
            } else {
                this.setState({
                    disableZoomIn: true
                })
            }
        }
    };

    handleRotate = (angle) => {
        const rotate = this.state.rotate + angle
        const box = this._box
        let {top, left} = Util.getZoomOffset({width: this.state.width, height: this.state.height}, box, Util.isRotation(rotate))
        this.setState({
            rotate, top, left
        })
    };

    render() {
        const single = this._single
        let prev, next
        if (!single) {
            if (this.state.disablePrev) {
                prev = <div className={`${style.prev} icon-left-open-big ${style.disable}`}></div>
            } else {
                prev = <div className={`${style.prev} icon-left-open-big`} onClick={this.handlePrev}></div>
            }
            if (this.state.disableNext) {
                next = <div className={`${style.next} icon-right-open-big ${style.disable}`}></div>
            } else {
                next = <div className={`${style.next} icon-right-open-big`} onClick={this.handleNext}></div>
            }
        }

        let toolbar
        if (this.props.toolbar) {
            toolbar = <ToolBar {...this.props} {...this.state}
                handleZoom={this.handleZoom}
                handleRotate={this.handleRotate}
            />
        }
        return (
            <div className={style.gallery}>
                <ImageBox ref="content" {...this.props} {...this.state}
                    loadImage={this.loadImage}
                />
                <a href="#" onClick={this.handleClose} className={`${style.close} icon-cancel`}/>
                {prev}
                {next}
                {toolbar}
                <Footer {...this.props} {...this.state}/>
            </div>
        )
    }
}
