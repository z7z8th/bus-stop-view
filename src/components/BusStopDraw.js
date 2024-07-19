const bnameWidthRatio = 0.2
const bnameHeightRatio = 0.6
const roadWidthRatio = 0.2

function getLines(ctx, text, maxWidth) {
  var words = text.split('')
  var lines = []
  var currentLine = words[0]

  for (var i = 1; i < words.length; i++) {
    var word = words[i]
    var width = ctx.measureText(currentLine + word).width
    if (width < maxWidth) {
      currentLine += word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)
  return lines
}

function BusStopDraw(canvas, bname, stops, finalStop, road) {
  console.log(`BusStopDraw ${bname}: ${stops}(${typeof stops}), →${finalStop} @${road}`)
  finalStop = finalStop && `→${finalStop}`
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
  console.log(`text metrics ${tm.width}x${tm.actualBoundingBoxAscent}`, tm)
  let fm = { x: Math.max((bnameWidth - tm.width) / 2, 0), y: bnameHeight, mw: bnameWidth }
  console.log('bus name fm', fm)
  ctx.fillText(bname, fm.x, fm.y, fm.mw)

  // final stop text
  ctx.font = '50px sans'
  tm = ctx.measureText(finalStop)
  ctx.fillText(
    finalStop,
    Math.max((bnameWidth - tm.width) / 2, 0),
    bnameHeight + tm.actualBoundingBoxAscent + height * 0.1,
    bnameWidth
  )

  // road name text
  ctx.font = '100px sans'
  tm = ctx.measureText(road)
  ctx.fillText(
    road,
    roadOffsetX + Math.max((roadWidth - tm.width) / 2, 0),
    height - Math.max((height - tm.actualBoundingBoxAscent) / 2, 0),
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
      height - Math.max((height - tm.actualBoundingBoxAscent) / 2, 0),
      stopListWidth
    )
    return
  }

  // middle stops
  ctx.font = '60px sans'

  let stopWidth = stopListWidth / 3
  let stopColors = ['red', 'orange', 'green']
  let stopListInfo = []
  stops.forEach((stop, i) => {
    console.log(`[${i}] ${stop}`)
    stopListInfo[i] = {
      icon: {
        x: stopListOffsetX + i * stopWidth + stopWidth / 2,
        y: height / 4,
        r: height / 12,
        lw: height / 20,
        color: stopColors[i]
      },
      stop: {
        x: stopListOffsetX + i * stopWidth + stopWidth / 30,
        y: height / 3,
        mw: stopWidth * (1 - 1 / 10),
        // h: (height * 2) / 3,
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
    // let lines = getLines(ctx, stop.text, stop.mw)
    // let text = lines.join('\r\n')
    // console.log('stop lines', text)
    let text = stop.text
    let tm = ctx.measureText(text)
    stop.x = stop.x + Math.max(stopWidth - tm.width, 0) / 2
    stop.y = height - Math.max(height - stop.y - tm.actualBoundingBoxAscent, 0) / 2
    ctx.fillText(text, stop.x, stop.y, stop.mw)
  }
}

export { BusStopDraw }
