/**
 +-------------------------------------------------------------------
 * leo-tools
 +-------------------------------------------------------------------
 * @version    1.0.0 beta
 * @author     leo
 +-------------------------------------------------------------------
 */

import {concat} from '../constant'
import {$is, $filter} from './query'
import {$} from "./core"
import {nodeName, merge} from '../util'
import {uniqueSort} from './selector'

function sibling(cur, dir) {
    while((cur = cur[dir]) && cur.nodeType !== 1) {
    }

    return cur
}

function dir(elem, dir, until) {
    let matched = [],
        truncate = until !== undefined

    while((elem = elem[dir]) && elem.nodeType !== 9) {
        if(elem.nodeType === 1) {
            if(truncate && $is(elem, until)) {
                break
            }

            matched.push(elem)
        }
    }

    return matched
}

function siblings(n, elem) {
    let matched = []

    for(; n; n = n.nextSibling) {
        if(n.nodeType === 1 && n !== elem) {
            matched.push(n)
        }
    }

    return matched
}

const rparentsprev = /^(?:parents|prev(?:Until|All))/

const guaranteedUnique = {
    children: true,
    contents: true,
    next: true,
    prev: true,
}

function warpTraversing(fn, name) {
    return (selector, until, treeSelector) => {
        selector = $(selector)

        let matched = selector.map((elem, i) => {
            return fn(elem, i, until)
        })

        matched = concat.apply([], matched)

        if(name.slice(-5) !== 'Until') {
            treeSelector = until
        }

        if(treeSelector && typeof treeSelector === 'string') {
            matched = $filter(matched, treeSelector)
        }

        if(selector.length > 1) {
            if(!guaranteedUnique[name]) {
                uniqueSort(matched)
            }

            if(rparentsprev.test(name)) {
                matched.reverse()
            }
        }

        return matched
    }
}

export const $parent = warpTraversing((elem) => {
    let parent = elem.parentNode
    return parent && parent.nodeType !== 11 ? parent : null
}, 'parent')

export const $parents = warpTraversing((elem) => {
    return dir(elem, 'parentNode')
}, 'parents')

export const $parentsUntil = warpTraversing((elem, i, until) => {
    return dir(elem, 'parentNode', until)
}, 'parentsUntil')

export const $next = warpTraversing((elem) => {
    return sibling(elem, "nextSibling")
}, 'next')

export const $prev = warpTraversing((elem) => {
    return sibling(elem, "previousSibling")
}, 'prev')

export const $nextAll = warpTraversing((elem) => {
    return dir(elem, "nextSibling")
}, 'nextAll')

export const $prevAll = warpTraversing((elem) => {
    return dir(elem, "previousSibling")
}, 'prevAll')

export const $nextUntil = warpTraversing((elem, i, until) => {
    return dir(elem, "nextSibling", until)
}, 'nextUntil')

export const $prevUntil = warpTraversing((elem, i, until) => {
    return dir(elem, "previousSibling", until)
}, 'prevUntil')

export const $siblings = warpTraversing((elem) => {
    return siblings((elem.parentNode || {}).firstChild, elem)
}, 'siblings')

export const $children = warpTraversing((elem) => {
    return siblings(elem.firstChild)
}, 'children')

export const $contents = warpTraversing((elem) => {
    if(typeof elem.contentDocument !== "undefined") {
        return elem.contentDocument
    }

    if(nodeName(elem, 'template')) {
        elem = elem.content || elem
    }

    return merge([], elem.childNodes)
}, 'contents')