import * as http from 'http'
import Koa from 'koa'
import cors from '@koa/cors'
import respond from 'koa-respond'
import bodyParser from 'koa-bodyparser'
import compress from 'koa-compress'
import { scopePerRequest, controller } from 'awilix-koa'

import { logger } from './logger.js'
import { configureContainer } from './container.js'
import { notFoundHandler } from '../middleware/not-found.js'
import { errorHandler } from '../middleware/error-handler.js'
import { registerContext } from '../middleware/register-context.js'

import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { promises as fs } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Creates and returns a new Koa application.
 * Does *NOT* call `listen`!
 *
 * @return {Promise<http.Server>} The configured app.
 */
export async function createServer() {
  logger.debug('Creating server...')
  const app = new Koa()

  // Container is configured with our services and whatnot.
  const container = (app.container = await configureContainer())

  app
    // Top middleware is the error handler.
    .use(errorHandler)
    // Compress all responses.
    .use(compress())
    // Adds ctx.ok(), ctx.notFound(), etc..
    .use(respond())
    // Handles CORS.
    .use(cors())
    // Parses request bodies.
    .use(bodyParser())
    // Creates an Awilix scope per request. Check out the awilix-koa
    // docs for details: https://github.com/jeffijoe/awilix-koa
    .use(scopePerRequest(container))
    // Create a middleware to add request-specific data to the scope.
    .use(registerContext)

  const modulesPath = `${__dirname}/../routes/`
  const files = await fs.readdir(modulesPath)
  for await (const filename of files) {
    if (filename.endsWith('.js')) {
      console.log(modulesPath + filename)
      const module = await import(modulesPath + filename)
      await app.use(controller(module.default))
    }
  }

  // Default handler when nothing stopped the chain.
  app.use(notFoundHandler)

  // Creates a http server ready to listen.
  const server = http.createServer(app.callback())

  // Add a `close` event listener so we can clean up resources.
  server.on('close', () => {
    // You should tear down database connections, TCP connections, etc
    // here to make sure Jest's watch-mode some process management
    // tool does not release resources.
    logger.debug('Server closing, bye!')
  })

  logger.debug('Server created, ready to listen', { scope: 'startup' })
  return server
}
