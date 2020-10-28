import {
  createContainer,
  Lifetime,
  InjectionMode,
  asValue,
  asClass,
  asFunction
} from 'awilix'
import { logger } from './logger.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { promises as fs } from 'fs'

/**
 * Using Awilix, the following files and folders (glob patterns)
 * will be loaded.
 */
const modulesToLoad = [
  // Services should be scoped to the request.
  // This means that each request gets a separate instance
  // of a service.
  ['/services/', Lifetime.SCOPED],
  // Stores will be singleton (1 instance per process).
  // This is just for demo purposes, you can do whatever you want.
  ['/stores/', Lifetime.SINGLETON]
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Configures a new container.
 *
 * @return {Object} The container.
 */
export function configureContainer() {
  const opts = {
    // Classic means Awilix will look at function parameter
    // names rather than passing a Proxy.
    injectionMode: InjectionMode.CLASSIC
  }

  const container = createContainer(opts).register({
    logger: asValue(logger)
  })

  modulesToLoad.forEach(modules => {
    const modulesPath = `${__dirname}/..` + modules[0]
    fs.readdir(modulesPath).then(dir => {
      dir.map(async filename => {
        if (filename.endsWith('.js')) {
          import(modulesPath + filename).then(module => {
            const moduleName = module.default.name
            if (module.default.toString().substring(0, 5) === 'funct') {
              const obj = {}
              obj[moduleName] = asFunction(module.default, {
                lifetime: modules[1]
              })
              container.register(obj)
            } else if (module.default.toString().substring(0, 5) === 'class') {
              const obj = {}
              obj[moduleName] = asClass(module.default, {
                lifetime: modules[1]
              })
              container.register(obj)
            }
          })
        }
      })
    })
  })

  return container
}
