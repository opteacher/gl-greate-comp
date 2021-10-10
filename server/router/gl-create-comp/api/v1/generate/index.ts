import Router from 'koa-router'
import { Page } from '../../../../../utils/common.js'
import generate from '../../../../../services/page.js'

const router = new Router()

router.post('/fast', async ctx => {
  try {
    const result = {} as { [name: string]: any }
    for (const page of ctx.request.body.pages) {
      result[page.name] = await generate(Page.copy(page))
    }
    ctx.body = { result }
  } catch (e: any) {
    ctx.body = {
      error: e.message || JSON.stringify(e),
    }
  }
})

export default router
