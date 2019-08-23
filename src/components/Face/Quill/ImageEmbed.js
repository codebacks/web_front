/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */
import {HZFaceKey} from '../utils'
import {Quill} from 'react-quill'

let Embed = Quill.import('blots/embed')

class ImageEmbed extends Embed {
    static create(value) {
        let node = super.create()
        node.setAttribute('alt', value.alt)
        node.setAttribute('src', value.src)
        if(value[HZFaceKey]){
            node.setAttribute(HZFaceKey, value[HZFaceKey])
        }
        return node
    }

    static value(node) {
        const value = {
            alt: node.getAttribute('alt'),
            src: node.getAttribute('src'),
        }

        const HZFaceValue = node.getAttribute(HZFaceKey)
        if(HZFaceValue){
            value[HZFaceKey] = node.getAttribute(HZFaceKey)
        }

        return value
    }
}

ImageEmbed.blotName = 'image'
ImageEmbed.tagName = 'img'
Quill.register(ImageEmbed, true)