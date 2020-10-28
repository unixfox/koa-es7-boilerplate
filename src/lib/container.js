import { createContainer, Lifetime, asValue, asClass, asFunction } from 'awilix'
import { logger } from './logger.js'
import TodoService from '../services/todo-service.js'
import todoStore from '../stores/todo-store.js'

/**
 * Configures a new container.
 *
 * @return {Object} The container.
 */
export function configureContainer() {
  const container = createContainer().register({
    todoService: asClass(TodoService, { lifetime: Lifetime.SCOPED }),
    todoStore: asFunction(todoStore, { lifetime: Lifetime.SINGLETON }),
    logger: asValue(logger)
  })
  return container
}
