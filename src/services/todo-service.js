import { NotFound, BadRequest } from 'fejl'
import pkg from 'lodash'
const { pick } = pkg

// Prefab assert function.
const assertId = BadRequest.makeAssert('No id given')

// Prevent overposting.
const pickProps = data => pick(data, ['title', 'completed'])

/**
 * Todo Service.
 * Gets a todo store injected.
 */
export default class TodoService {
  constructor(createTodoStore) {
    this.createTodoStore = createTodoStore
  }

  async find(params) {
    return this.createTodoStore.find(params)
  }

  async get(id) {
    assertId(id)
    // If `createTodoStore.get()` returns a falsy value, we throw a
    // NotFound error with the specified message.
    return this.createTodoStore
      .get(id)
      .then(NotFound.makeAssert(`Todo with id "${id}" not found`))
  }

  async create(data) {
    BadRequest.assert(data, 'No todo payload given')
    BadRequest.assert(data.title, 'title is required')
    BadRequest.assert(data.title.length < 100, 'title is too long')
    return this.createTodoStore.create(pickProps(data))
  }

  async update(id, data) {
    assertId(id)
    BadRequest.assert(data, 'No todo payload given')

    // Make sure the todo exists by calling `get`.
    await this.get(id)

    // Prevent overposting.
    const picked = pickProps(data)
    return this.createTodoStore.update(id, picked)
  }

  async remove(id) {
    // Make sure the todo exists by calling `get`.
    await this.get(id)
    return this.createTodoStore.remove(id)
  }
}
