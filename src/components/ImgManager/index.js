/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/26
 */

import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

class ImgManager extends PureComponent {
    static displayName = 'leoUi-ImgLoader'

    static propTypes = {
        defaultSrc: PropTypes.string,
        imgSrc: PropTypes.string,
        errorSrc: PropTypes.string,
        loadingSrc: PropTypes.string,
        render: PropTypes.func,
    }

    static defaultProps = {
        defaultSrc: '',
        render(imgSrc) {
            return <img alt={''} src={imgSrc}/>
        },
    }

    constructor(props) {
        super(props)
        this.state = {
            imgSrc: props.defaultSrc,
            imgState: 'init',
        }
        this.img = null
    }

    componentDidMount() {
        this._isMounted = true
        this.loadImg()
    }

    componentDidUpdate(prevProps) {
        if(prevProps.imgSrc !== this.props.imgSrc) {
            this.destroyImg()
            this.loadImg()
        }
    }

    componentWillUnmount() {
        this._isMounted = false
        this.destroyImg()
    }

    imgLoad = () => {
        if(this._isMounted) {
            const {imgSrc} = this.props
            this.setState({
                imgSrc,
                imgState: 'load',
            })
        }
    }

    getImgSrc(imgSrc) {
        return imgSrc || this.props.defaultSrc
    }

    imgError = () => {
        if(this._isMounted) {
            this.setState(() => {
                return {
                    imgSrc: this.props.errorSrc,
                    imgState: 'error',
                }
            })
        }
    }

    loadImg() {
        const {imgSrc, loadingSrc} = this.props
        const img = this.img = new Image()
        img.addEventListener('load', this.imgLoad, false)
        img.addEventListener('error', this.imgError, false)
        img.src = imgSrc

        this.setState(() => {
            return {
                imgSrc: loadingSrc,
                imgState: 'loading',
            }
        })
    }

    destroyImg() {
        if(this.img) {
            this.img.removeEventListener('load', this.imgLoad, false)
            this.img.removeEventListener('error', this.imgError, false)
            this.img.src = ''
            this.img = null
        }
    }

    render() {
        const {render} = this.props
        const {imgSrc, imgState} = this.state
        return render(this.getImgSrc(imgSrc), imgState)
    }
}

export default ImgManager
