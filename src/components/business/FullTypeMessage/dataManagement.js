/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/12/5
 */
import {createContext} from "react"
import {contextConsumerHocWarp} from 'components/DataManagement'

export const Context = createContext()
export const consumerHoc = contextConsumerHocWarp(Context)