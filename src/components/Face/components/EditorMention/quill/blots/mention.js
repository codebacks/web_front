/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/31
 */

import Quill from 'quill'
import {HZMentionTagName, HZMentionIdKey} from '../../utils'

const Embed = Quill.import('blots/embed')

class MentionBlot extends Embed {
    static create(data) {
        const node = super.create()
        node.innerHTML = data.renderMentionContent
        node.dataset.renderMentionContent = data.renderMentionContent
        node.dataset[HZMentionIdKey] = data.id
        node.dataset.value = data.value
        node.dataset.denotationChar = data.denotationChar
        node.className = data.mentionClassName
        return node
    }

    static value(domNode) {
        return {
            id: domNode.dataset[HZMentionIdKey],
            value: domNode.dataset.value,
            renderMentionContent: domNode.dataset.renderMentionContent,
            mentionClassName: domNode.className,
            denotationChar: domNode.dataset.denotationChar,
        }
    }
}

MentionBlot.blotName = 'mention'
MentionBlot.tagName = HZMentionTagName

Quill.register(MentionBlot)