import Router from 'koa-router'

const router = new Router()

router.get('/table', ctx => {
  ctx.body = {
    result: {
      name: 'test',
      gender: 'male',
      phone: '13918559376'
    }
  }
})

export default router
