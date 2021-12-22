import path from 'path'
import { getDbByName } from '../lib/databases/index.js'
import { readConfig } from '../lib/utils/index.js'

export const cfgPath = path.resolve('..', 'configs')
const mdlCfgPath = path.resolve(cfgPath, 'models')
const dbCfgPath = path.resolve(cfgPath, 'db')
const svrCfgPath = path.resolve(cfgPath, 'server')

export function getRootPath () {
  return path.resolve('..')
}

export function getServerInfo () {
  return readConfig(svrCfgPath, true)
}

export function getDatabase() {
  return getDbByName(readConfig(mdlCfgPath).type, dbCfgPath)
}
