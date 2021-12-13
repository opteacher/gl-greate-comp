export async function waitFor (
  iden: string,
  options: {
    reqFun?: (el: any) => boolean,
    loop?: number,
    getBy?: 'id' | 'name'
  } = {}
) {
  if (!options.reqFun) {
    options.reqFun = () => true
  }
  if (!options.loop) {
    options.loop = 500
  }
  if (!options.getBy) {
    options.getBy = 'id'
  }
  let ret = null
  for (let i = 0; i < options.loop; ++i) {
    if (options.getBy === 'id') {
      ret = document.getElementById(iden)
    } else if (options.getBy === 'name') {
      ret = document.getElementsByName(iden)
      if (!ret || !ret.length) {
        await new Promise(res => setTimeout(res, 200))
        continue
      } else {
        ret = ret[0]
      }
    }
    if (ret) {
      if (options.reqFun(ret)) {
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
