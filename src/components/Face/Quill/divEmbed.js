/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/20
 */
import {Quill} from 'react-quill'

const Block = Quill.import('blots/block')
Block.tagName = 'DIV'
Quill.register(Block, true)