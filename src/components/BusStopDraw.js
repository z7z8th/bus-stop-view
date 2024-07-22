const bnameWidthRatio = 0.2
const bnameHeightRatio = 0.6
const roadWidthRatio = 0.2

import { alphaToHex } from './color.js'
// split long text to multiple lines
// eslint-disable-next-line no-unused-vars
function splitLongTextToLines(ctx, text, maxWidth) {
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

function getStopName(text) {
  if (!text) return text

  let m = text.split('@')
  return m[0]
}

function getRoadName(text) {
  if (!text) return text

  let m = text.split('@')
  return m.length > 1 ? m[1] : ''
}

function parseStopRoadName(text) {
  if (!text) return [undefined, undefined]

  let m = text.split('@')
  if (m.length > 1) {
    return [m[0], m[1]]
  }

  m = text.match(/([^()（）]*)[(（](.*)[)）](.*)/)
  if (!m) return [text, undefined]

  // console.log('parseStopRoadName', m)

  if (m[2].search(/[^（(∙](路|街|道|高架)/) < 0) {
    // console.log('not a road name')
    return [text, undefined]
  }
  return [m[1] + (m[3] || ''), m[2]]
}

function DrawTextCentered(ctx, text, area) {
  let tm = ctx.measureText(text)
  // console.log(`text ${text} metrics ${tm.width}x${tm.actualBoundingBoxAscent}`, tm)
  let fm = {
    x: area.x + Math.max((area.w - tm.width) / 2, 0),
    y: area.y + area.h - Math.max((area.h - tm.actualBoundingBoxAscent) / 2, 0),
    mw: area.w
  }
  // console.log('text', text, 'fill metrics', fm)
  ctx.fillText(text, fm.x, fm.y, fm.mw)
}

function BusStopDraw(canvas, bname, stops, finalStop, road, colors) {
  console.log(`BusStopDraw ${bname}: ${stops}, →${finalStop}, @${road},`, colors)
  finalStop = finalStop && `→${finalStop}`
  let sname
  let prname = road
  if (!road) {
    if (stops.length > 2) {
      ;[sname, prname] = parseStopRoadName(stops[1])
      stops[1] = sname || stops[1]
    } else {
      ;[sname, prname] = parseStopRoadName(stops[0])
      stops[0] = sname || stops[0]
    }
  }
  road = road || prname || '无路名'
  let width = canvas.width
  let height = canvas.height
  //   let offsetHeight = canvas.offsetHeight
  // console.log(`canvas ${width}x${height}`)

  let bnameWidth = width * bnameWidthRatio
  let bnameHeight = height * bnameHeightRatio
  let roadWidth = width * roadWidthRatio
  // console.log(`bname geom ${bnameWidth}x${height} ${typeof bnameWidth}`)

  const ctx = canvas.getContext('2d')
  ctx.reset()
  ctx.fillStyle = colors.busNameBg //'rgb(0 255 0 / 30%)'
  // busname rect
  ctx.fillRect(0, 0, bnameWidth, height)
  // road rect
  ctx.fillStyle = colors.roadNameBg //'rgb(0 255 0 / 30%)'
  let roadOffsetX = width - roadWidth
  ctx.fillRect(roadOffsetX, 0, roadWidth, height)
  // stops rect
  ctx.fillStyle = colors.busStopBg //'rgb(0 0 255/ 60%)'
  let stopListWidth = width - bnameWidth - roadWidth
  ctx.fillRect(bnameWidth, 0, stopListWidth, height)

  // bus name text
  ctx.font = '130px sans'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowColor = 'rgb(10 10 10/ 100%)'
  ctx.fillStyle = colors.textColor //'rgb(255 255 255/ 100%)'
  DrawTextCentered(ctx, bname, { x: 0, y: 0, w: bnameWidth, h: bnameHeight })

  // final stop text
  ctx.font = '50px sans'
  DrawTextCentered(ctx, getStopName(finalStop), {
    x: bnameWidth * 0.05,
    y: bnameHeight,
    w: bnameWidth * 0.9,
    h: height - bnameHeight
  })

  // road name text
  ctx.font = '100px sans'
  DrawTextCentered(ctx, road, {
    x: roadOffsetX + roadWidth * 0.05,
    y: 0,
    w: roadWidth * 0.9,
    h: height
  })

  // stops text
  // first and last stop
  let stopListOffsetX = bnameWidth
  if (stops.length == 1) {
    ctx.font = '100px sans'
    DrawTextCentered(ctx, getStopName(stops[0]), {
      x: stopListOffsetX,
      y: 0,
      w: stopListWidth,
      h: height
    })
    return
  }

  // middle stops
  ctx.font = '60px sans'

  let stopWidth = stopListWidth / 3
  let stopColors = ['red', 'orange', 'green']
  let stopListInfo = []
  stops.forEach((stop, i) => {
    // console.log(`[${i}] ${stop}`)
    stopListInfo[i] = {
      icon: {
        x: stopListOffsetX + i * stopWidth + stopWidth / 2,
        y: height / 4,
        r: height / 12,
        lw: height / 20,
        color: stopColors[i]
      },
      stop: {
        x: stopListOffsetX + i * stopWidth + stopWidth * 0.05,
        y: height / 3,
        w: stopWidth * 0.9,
        h: (height * 2) / 3,
        text: getStopName(stop)
      }
    }
  })

  // draw lines connecting icons
  for (let i = 0; i < stopListInfo.length - 1; i++) {
    let start = stopListInfo[i].icon
    let end = stopListInfo[i + 1].icon
    let startInfo = { x: start.x + start.r, y: start.y, lw: (start.r - start.lw / 2) * 2 }
    let endInfo = { x: end.x - start.r, y: end.y }

    ctx.save()
    ctx.lineWidth = startInfo.lw
    ctx.strokeStyle = 'gray'
    ctx.strokeStyle += alphaToHex(colors.alpha)
    ctx.lineCap = 'butt'
    ctx.beginPath()
    ctx.moveTo(startInfo.x, startInfo.y)
    ctx.lineTo(endInfo.x, endInfo.y)
    ctx.stroke()
    ctx.restore()
  }

  for (let info of stopListInfo) {
    // draw circle icon
    let icon = info.icon
    let stop = info.stop
    // console.log('icon', icon, 'stop', stop)
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
    DrawTextCentered(ctx, stop.text, stop)
  }
}

function DrawText(canvas, msg) {
  let ctx = canvas.getContext('2d')
  ctx.reset()
  ctx.font = '130px sans'
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2
  ctx.shadowColor = 'rgb(10 10 10/ 100%)'
  ctx.fillStyle = 'rgb(200 200 200/ 100%)'
  DrawTextCentered(ctx, msg, { x: 0, y: 0, w: canvas.width, h: canvas.height })
}

export { BusStopDraw, DrawText, getStopName, getRoadName }
