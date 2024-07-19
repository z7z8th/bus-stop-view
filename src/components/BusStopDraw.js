const bnameWidthRatio = 0.2
const bnameHeightRatio = 0.6
const roadWidthRatio = 0.2
const stopRatio = 1 - bnameWidthRatio - roadWidthRatio

function BusStopDraw(canvas, bname, stops, to, road) {
  console.log(`BusStopDraw ${bname}: ${stops}(${typeof stops}), →${to} @${road}`)
  to = `→${to}`
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
  let stopListWidth = width - bnameWidth - roadWidth
  ctx.fillRect(bnameWidth, 0, stopListWidth, height)

  // bus name text
  ctx.font = '130px sans'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowColor = 'rgb(10 10 10/ 100%)'
  ctx.fillStyle = 'rgb(255 255 255/ 100%)'
  let tm = ctx.measureText(bname)
  console.log(`text metrics ${tm.width}x${tm.emHeightAscent}`, tm)
  let fm = { x: Math.max((bnameWidth - tm.width) / 2, 0), y: bnameHeight, mw: bnameWidth }
  console.log('bus name fm', fm)
  ctx.fillText(bname, fm.x, fm.y, fm.mw)
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
  // first and last stop
  let stopListOffsetX = bnameWidth
  if (stops.length == 1) {
    ctx.font = '100px sans'
    tm = ctx.measureText(stops[0])
    ctx.fillText(
      stops[0],
      stopListOffsetX + Math.max((stopListWidth - tm.width) / 2, 0),
      height - Math.max((height - tm.emHeightAscent) / 2, 0),
      stopListWidth
    )
    return
  }

  // middle stops
  ctx.font = '40px sans'

  let stopWidth = stopListWidth / 3
  let stopColors = ['red', 'orange', 'green']
  let stopListInfo = []
  stops.forEach((stop, i) => {
    console.log(`[${i}] ${stop}`)
    stopListInfo[i] = {
      icon: {
        x: stopListOffsetX + i * stopWidth + stopWidth / 2,
        y: height / 6,
        r: height / 12,
        lw: height / 20,
        color: stopColors[i]
      },
      stop: {
        x: stopListOffsetX + i * stopWidth,
        y: height / 3,
        w: stopWidth,
        h: (height * 2) / 3,
        text: stop
      }
    }
  })

  // draw lines connecting icons
  for (let i = 0; i < stopListInfo.length - 1; i++) {
    let start = stopListInfo[i].icon
    let stop = stopListInfo[i + 1].icon
    let startInfo = { x: start.x + start.r, y: start.y, lw: (start.r - start.lw / 2) * 2 }
    let stopInfo = { x: stop.x - start.r, y: stop.y }

    ctx.save()
    ctx.lineWidth = startInfo.lw
    ctx.strokeStyle = 'gray'
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(startInfo.x, startInfo.y)
    ctx.lineTo(stopInfo.x, stopInfo.y)
    ctx.stroke()
    ctx.restore()
  }

  for (let info of stopListInfo) {
    // draw circle icon
    let icon = info.icon
    let stop = info.stop
    console.log('icon', icon, 'stop', stop)
    ctx.save()
    ctx.strokeStyle = icon.color
    ctx.lineWidth = icon.lw
    // ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(icon.x, icon.y, icon.r, 0, 2 * Math.PI, true)
    ctx.stroke()
    ctx.restore()

    // draw stop names
    let tm = ctx.measureText(stop.text)
    stop.x = stop.x + Math.max(stopWidth - tm.width, 0) / 2
    stop.y = height - Math.max(height - stop.y - tm.emHeightAscent, 0) / 2
    ctx.fillText(stop.text, stop.x, stop.y, stop.mw)
  }
}

export { BusStopDraw }
