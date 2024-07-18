const bnameWidthRatio = 0.2
const bnameHeightRatio = 0.6
const roadWidthRatio = 0.2
const stopRatio = 1 - bnameWidthRatio - roadWidthRatio

function BusStopDraw(canvas, bname, stops, to, road) {
  console.log(`BusStopDraw ${bname}: ${stops}, ->${to} @${road}`)
  to = `->${to}`
  road = road || '未指定路名'
  let width = canvas.width
  let height = canvas.height
  //   let offsetHeight = canvas.offsetHeight
  console.log(`canvas ${width}x${height}`)

  let bnameWidth = width * bnameWidthRatio
  let bnameHeight = height * bnameHeightRatio
  let roadWidth = width * roadWidthRatio
  console.log(`bname geom ${bnameWidth}x${height} ${typeof bnameWidth}`)

  const ctx = canvas.getContext('2d')
  ctx.reset()
  ctx.fillStyle = 'rgb(0 255 0 / 30%)'
  // busname rect
  ctx.fillRect(0, 0, bnameWidth, height)
  // road rect
  let roadOffsetX = width - roadWidth
  ctx.fillRect(roadOffsetX, 0, roadWidth, height)
  // stops rect
  ctx.fillStyle = 'rgb(0 0 255/ 60%)'
  let stopWidth = width - bnameWidth - roadWidth
  ctx.fillRect(bnameWidth, 0, stopWidth, height)

  // bus name text
  ctx.font = '130px sans'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowColor = 'rgb(10 10 10/ 100%)'
  ctx.fillStyle = 'rgb(255 255 255/ 100%)'
  let tm = ctx.measureText(bname)
  console.log(`text metrics ${tm.width}x${tm.emHeightAscent}`)
  ctx.fillText(bname, Math.max((bnameWidth - tm.width) / 2, 0), bnameHeight, bnameWidth)
  ctx.font = '30px sans'
  tm = ctx.measureText(to)
  ctx.fillText(
    to,
    Math.max((bnameWidth - tm.width) / 2, 0),
    bnameHeight + tm.emHeightAscent + height * 0.1,
    bnameWidth
  )

  // road name text
  ctx.font = '100px sans'
  tm = ctx.measureText(road)
  ctx.fillText(
    road,
    roadOffsetX + Math.max((roadWidth - tm.width) / 2, 0),
    height - Math.max((height - tm.emHeightAscent) / 2, 0),
    roadWidth
  )

  // stops text
  if (stops.length == 1) {
    ctx.font = '100px sans'
    tm = ctx.measureText(stops[0])
    ctx.fillText(
      stops[0],
      bnameWidth + Math.max((stopWidth - tm.width) / 2, 0),
      height - Math.max((height - tm.emHeightAscent) / 2, 0),
      stopWidth
    )
  } else {
  }
}

export { BusStopDraw }
