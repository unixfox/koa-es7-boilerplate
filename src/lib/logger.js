import { Bristol } from 'bristol'
import palin from 'palin'
import { env } from './env.js'

export const logger = new Bristol()

/* istanbul ignore next */
if (env.LOG_LEVEL !== 'off') {
  logger.addTarget('console').withFormatter(palin, {
    rootFolderName: 'koa-es7-boilerplate' // Edit this to match your actual foldername
  })
}
