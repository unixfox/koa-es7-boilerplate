import { createController } from 'awilix-koa'

// This is our API controller.
// All it does is map HTTP calls to service calls.
// This way our services could be used in any type of app, not
// just over HTTP.
const api = TodoService => ({
  findTodos: async ctx => ctx.ok(await TodoService.find(ctx.query)),
  getTodo: async ctx => ctx.ok(await TodoService.get(ctx.params.id)),
  createTodo: async ctx =>
    ctx.created(await TodoService.create(ctx.request.body)),
  updateTodo: async ctx =>
    ctx.ok(await TodoService.update(ctx.params.id, ctx.request.body)),
  removeTodo: async ctx =>
    ctx.noContent(await TodoService.remove(ctx.params.id))
})

// Maps routes to method calls on the `api` controller.
// See the `awilix-router-core` docs for info:
// https://github.com/jeffijoe/awilix-router-core
export default createController(api)
  .prefix('/todos')
  .get('', 'findTodos')
  .get('/:id', 'getTodo')
  .post('', 'createTodo')
  .patch('/:id', 'updateTodo')
  .delete('/:id', 'removeTodo')
