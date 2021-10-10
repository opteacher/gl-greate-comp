export async function waitFor (
  iden: string, reqFun?: (el: any) => boolean, lpLimit = 500
) {
  let ret = null
  for (let i = 0; i < lpLimit; ++i) {
    ret = document.getElementById(iden)
    if (ret) {
      if (reqFun) {
        if (reqFun(ret)) {
          return Promise.resolve(ret)
        }
      } else {
        return Promise.resolve(ret)
      }
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.resolve(ret)
}

export async function until (reqFun: () => any, lpLimit = 500) {
  for (let i = 0; i < lpLimit; ++i) {
    const ret = reqFun()
    if (ret) {
      return Promise.resolve(ret)
    }
    await new Promise(res => setTimeout(res, 200))
  }
  return Promise.reject()
}
