/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/10/31
 */

import Quill from 'quill'
import Keys from './constants/keys'
import styles from './index.less'
import './blots/mention'
import _ from 'lodash'
import {isPromise} from 'utils'

const HZItemKey = 'HZITEMKEY'
const HzAbort = 'HZABORT'

class Mention {
    constructor(quill, options) {
        this.isOpen = false
        this.itemIndex = 0
        this.mentionCharPos = null
        this.cursorPos = null
        this.values = []
        this.suspendMouseEnter = false

        this.quill = quill

        this.options = {
            source: null,
            renderItem(item, searchTerm) {
                return `${item.value}`
            },
            renderMentionListLoading(mentionChar, searchTerm) {
                return 'loading...'
            },
            wait: 100,
            mentionDenotationChars: ['@'],
            allowedChars: /^[a-zA-Z0-9_]*$/,
            minChars: 0,
            maxChars: 31,
            offsetTop: 2,
            offsetLeft: 0,
            isolateCharacter: false,
            fixMentionsToQuill: false,
            defaultMenuOrientation: 'bottom',
            mentionListClassName: styles['ql-mention-list'],
            mentionContainerClassName: styles['ql-mention-list-container'],
            mentionClassName: styles['mention'],
            renderItemClassName: styles['ql-mention-list-item'],
            mentionListSelectedClassName: styles['selected'],
        }

        Object.assign(this.options, options)

        this.mentionContainer = document.createElement('div')
        this.mentionContainer.className = this.options.mentionContainerClassName
        this.mentionContainer.style.cssText = 'display: none; position: absolute; z-index: 1000;'
        this.mentionContainer.onmousemove = this.onContainerMouseMove.bind(this)

        this.dataLoading = false

        if(this.options.fixMentionsToQuill) {
            this.mentionContainer.style.width = 'auto'
        }

        this.mentionList = document.createElement('div')
        this.mentionList.className = this.options.mentionListClassName
        this.mentionContainer.appendChild(this.mentionList)

        this.quill.container.appendChild(this.mentionContainer)

        quill.on('text-change', this.onTextChange.bind(this))
        quill.on('selection-change', this.onSelectionChange.bind(this))

        quill.keyboard.addBinding({
            key: Keys.TAB,
        }, this.selectHandler.bind(this))
        quill.keyboard.bindings[9].unshift(quill.keyboard.bindings[9].pop())

        quill.keyboard.addBinding({
            key: Keys.ENTER,
        }, this.selectHandler.bind(this))
        quill.keyboard.bindings[13].unshift(quill.keyboard.bindings[13].pop())

        quill.keyboard.addBinding({
            key: Keys.ESCAPE,
        }, this.escapeHandler.bind(this))

        quill.keyboard.addBinding({
            key: Keys.UP,
        }, this.upHandler.bind(this))

        quill.keyboard.addBinding({
            key: Keys.DOWN,
        }, this.downHandler.bind(this))

        this.getDate = _.debounce(this.warpGetDate, this.options.wait)
    }

    selectHandler() {
        this.isSelected = false
        if(this.isOpen) {
            this.selectItem()
            this.isSelected = true
            return false
        }
        return true
    }

    escapeHandler() {
        if(this.abort) {
            this.abort()
        }
        if(this.isOpen) {
            this.hideMentionList()
            return false
        }
        return true
    }

    upHandler() {
        if(this.isOpen) {
            this.prevItem()
            return false
        }
        return true
    }

    downHandler() {
        if(this.isOpen) {
            this.nextItem()
            return false
        }
        return true
    }

    showMentionList() {
        this.mentionContainer.style.visibility = 'hidden'
        this.mentionContainer.style.display = ''
        this.setMentionContainerPosition()
        this.isOpen = true
    }

    hideMentionList() {
        this.mentionContainer.style.display = 'none'
        this.isOpen = false
    }

    highlightItem(scrollItemInView = true) {
        const mentionListSelectedClassName = this.options.mentionListSelectedClassName
        for(let i = 0; i < this.mentionList.childNodes.length; i += 1) {
            this.mentionList.childNodes[i].classList.remove(mentionListSelectedClassName)
        }
        this.mentionList.childNodes[this.itemIndex].classList.add(mentionListSelectedClassName)

        if(scrollItemInView) {
            const itemHeight = this.mentionList.childNodes[this.itemIndex].offsetHeight
            const itemPos = this.itemIndex * itemHeight
            const containerTop = this.mentionContainer.scrollTop
            const containerBottom = containerTop + this.mentionContainer.offsetHeight

            if(itemPos < containerTop) {
                this.mentionContainer.scrollTop = itemPos
            }else if(itemPos > (containerBottom - itemHeight)) {
                this.mentionContainer.scrollTop += (itemPos - containerBottom) + itemHeight
            }
        }
    }

    getItemData() {
        const targetItem = this.mentionList.childNodes[this.itemIndex]
        if(targetItem && targetItem[HZItemKey]) {
            const denotationChar = targetItem.dataset.denotationChar
            const value = targetItem.dataset.value
            return {
                id: targetItem.dataset.id,
                value,
                renderMentionContent: this.options.renderMentionContent(value, denotationChar),
                denotationChar,
                mentionClassName: this.options.mentionClassName,
            }
        }

        return false
    }

    onContainerMouseMove() {
        this.suspendMouseEnter = false
    }

    selectItem() {
        if(this.dataLoading) {
            return
        }
        const data = this.getItemData()
        if(!data) {
            return
        }
        this.quill.deleteText(this.mentionCharPos, this.cursorPos - this.mentionCharPos, Quill.sources.API)
        this.quill.insertEmbed(this.mentionCharPos, 'mention', data, Quill.sources.API)
        this.quill.insertText(this.mentionCharPos + 1, ' ', Quill.sources.API)
        this.quill.setSelection(this.mentionCharPos + 2, Quill.sources.API)
        this.hideMentionList()
    }

    onItemMouseEnter(e) {
        if(this.suspendMouseEnter) {
            return
        }

        const index = Number(e.target.dataset.index)

        if(!Number.isNaN(index) && index !== this.itemIndex) {
            this.itemIndex = index
            this.highlightItem(false)
        }
    }

    onItemClick(e) {
        e.stopImmediatePropagation()
        e.preventDefault()
        this.itemIndex = e.currentTarget.dataset.index
        this.highlightItem()
        this.selectItem()
    }

    renderList(mentionChar, data, searchTerm) {
        if(data && data.length > 0) {
            this.values = data
            this.mentionList.innerHTML = ''
            for(let i = 0; i < data.length; i += 1) {
                const item = document.createElement('div')
                item[HZItemKey] = true
                item.className = this.options.renderItemClassName
                item.dataset.index = i
                item.dataset.id = data[i].id
                item.dataset.value = data[i].value
                item.dataset.denotationChar = mentionChar
                item.innerHTML = this.options.renderItem(data[i], searchTerm)
                item.onmouseenter = this.onItemMouseEnter.bind(this)
                item.onclick = this.onItemClick.bind(this)
                this.mentionList.appendChild(item)
            }
            this.itemIndex = 0
            this.highlightItem()
            this.showMentionList()
        }else {
            this.hideMentionList()
        }
    }

    nextItem() {
        if(this.dataLoading) {
            return
        }
        this.itemIndex = (this.itemIndex + 1) % this.values.length
        this.suspendMouseEnter = true
        this.highlightItem()
    }

    prevItem() {
        if(this.dataLoading) {
            return
        }
        this.itemIndex = ((this.itemIndex + this.values.length) - 1) % this.values.length
        this.suspendMouseEnter = true
        this.highlightItem()
    }

    hasValidChars(s) {
        return this.options.allowedChars.test(s)
    }

    containerBottomIsNotVisible(topPos, containerPos) {
        const mentionContainerBottom = topPos + this.mentionContainer.offsetHeight + containerPos.top
        return mentionContainerBottom > window.pageYOffset + window.innerHeight
    }

    containerRightIsNotVisible(leftPos, containerPos) {
        if(this.options.fixMentionsToQuill) {
            return false
        }

        const rightPos = leftPos + this.mentionContainer.offsetWidth + containerPos.left
        const browserWidth = window.pageXOffset + document.documentElement.clientWidth
        return rightPos > browserWidth
    }

    setMentionContainerPosition() {
        const containerPos = this.quill.container.getBoundingClientRect()
        const mentionCharPos = this.quill.getBounds(this.mentionCharPos)
        const containerHeight = this.mentionContainer.offsetHeight

        let topPos = this.options.offsetTop
        let leftPos = this.options.offsetLeft

        if(this.options.fixMentionsToQuill) {
            const rightPos = 0
            this.mentionContainer.style.right = `${rightPos}px`
        }else {
            leftPos += mentionCharPos.left
        }

        if(this.containerRightIsNotVisible(leftPos, containerPos)) {
            const containerWidth = this.mentionContainer.offsetWidth + this.options.offsetLeft
            const quillWidth = containerPos.width
            leftPos = quillWidth - containerWidth
        }

        if(this.options.defaultMenuOrientation === 'top') {
            if(this.options.fixMentionsToQuill) {
                topPos = -1 * (containerHeight + this.options.offsetTop)
            }else {
                topPos = mentionCharPos.top - (containerHeight + this.options.offsetTop)
            }

            if(topPos + containerPos.top <= 0) {
                let overMentionCharPos = this.options.offsetTop

                if(this.options.fixMentionsToQuill) {
                    overMentionCharPos += containerPos.height
                }else {
                    overMentionCharPos += mentionCharPos.bottom
                }

                topPos = overMentionCharPos
            }
        }else {
            if(this.options.fixMentionsToQuill) {
                topPos += containerPos.height
            }else {
                topPos += mentionCharPos.bottom
            }

            if(this.containerBottomIsNotVisible(topPos, containerPos)) {
                let overMentionCharPos = this.options.offsetTop * -1

                if(!this.options.fixMentionsToQuill) {
                    overMentionCharPos += mentionCharPos.top
                }

                topPos = overMentionCharPos - containerHeight
            }
        }

        this.mentionContainer.style.top = `${topPos}px`
        this.mentionContainer.style.left = `${leftPos}px`

        this.mentionContainer.style.visibility = 'visible'
    }

    onSomethingChange() {
        const range = this.quill.getSelection()
        if(range == null) return
        this.cursorPos = range.index
        const startPos = Math.max(0, this.cursorPos - this.options.maxChars)
        const beforeCursorPos = this.quill.getText(startPos, this.cursorPos - startPos)
        const mentionCharIndex = this.options.mentionDenotationChars.reduce((prev, cur) => {
            const previousIndex = prev
            const mentionIndex = beforeCursorPos.lastIndexOf(cur)

            return mentionIndex > previousIndex ? mentionIndex : previousIndex
        }, -1)
        if(mentionCharIndex > -1) {
            if(this.options.isolateCharacter && !(mentionCharIndex === 0 || !!beforeCursorPos[mentionCharIndex - 1].match(/\s/g))) {
                this.hideMentionList()
                return
            }

            this.mentionCharPos = this.cursorPos - (beforeCursorPos.length - mentionCharIndex)
            const textAfter = beforeCursorPos.substring(mentionCharIndex + 1)
            if(textAfter.length >= this.options.minChars && this.hasValidChars(textAfter)) {
                const mentionChar = beforeCursorPos[mentionCharIndex]
                this.getDate(textAfter, mentionChar)
            }else {
                this.hideMentionList()
            }
        }else {
            this.hideMentionList()
        }
    }

    createAbortFn(abort = () => {
    }) {
        return new Promise((resolve, reject) => {
            if(typeof abort === 'function') {
                abort(resolve, reject)
            }
            this.abort = () => {
                resolve(HzAbort)
            }
        })
    }

    async warpGetDate(textAfter, mentionChar) {
        try {
            if(this.abort) {
                this.abort()
            }
            this.dataLoading = true
            this.renderListLoading(textAfter, mentionChar)
            let abort, getData
            const options = this.options
            const res = options.source(textAfter, mentionChar)
            if(!res) {
                throw new Error('source error')
            }
            if(!isPromise(res)) {
                if(typeof res.abort === 'function') {
                    abort = res.abort
                }
                getData = res.load()
            }else {
                getData = res
            }
            if(!isPromise(getData)) {
                throw new Error('source error')
            }
            const data = await Promise.race([getData, this.createAbortFn(abort)])

            if(data !== HzAbort) {
                this.renderList(mentionChar, data, textAfter)
            }
            this.dataLoading = false
        }catch(e) {
            this.dataLoading = false
            this.hideMentionList()
        }
    }

    renderListLoading(textAfter, mentionChar) {
        this.mentionList.innerHTML = this.options.renderMentionListLoading(mentionChar, textAfter)
        this.showMentionList()
    }

    onTextChange(delta, oldDelta, source) {
        if(source === Quill.sources.USER) {
            this.onSomethingChange()
        }
    }

    onSelectionChange(range) {
        if(range && range.length === 0) {
            this.onSomethingChange()
        }else {
            this.hideMentionList()
        }
    }
}

Quill.register('modules/mention', Mention)