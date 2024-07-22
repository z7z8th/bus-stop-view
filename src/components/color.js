export function alphaToHex(a) {
  return Math.ceil((a / 100) * 255)
    .toString(16)
    .padStart(2, '0')
}

export function splitColor(color) {
  color = color.replace(/^#/, '')
  let width = color.length
  for (let w in [3, 4, 6, 8]) {
    if (width == w) break
    if (width < w) {
      color = color.padStart(w, '0')
      break
    }
  }
  let alpha
  if (color.length == 4) {
    alpha = color.substring(3)
    color = color.substring(0, 3)
  } else if (color.length == 8) {
    alpha = color.substring(6)
    color = color.substring(0, 6)
  }

  return [color, alpha]
}

export function testSplitColor() {
  let t = {
    '#fff': ['fff'],
    '#ffff': ['fff', 'f'],
    '#ffffff': ['ffffff'],
    '#ffffffff': ['ffffff', 'ff']
  }

  for (let c in t) {
    let [ec, ea] = t[c]
    let [rc, ra] = splitColor(c)
    if (ec != rc || ea != ra) {
      console.log('test fail', c, 'expect', [ec, ea], 'got', [rc, ra])
    }
  }
}
testSplitColor()

export function invertColor(color) {
  //   console.log('orig color', color)
  let alpha
  ;[color, alpha] = splitColor(color)
  // console.log('color', color, 'alpha', alpha)
  let mask = (1 << (color.length * 4)) - 1
  let invc =
    '#' +
    ((Number('0x' + color) ^ mask) >>> 0).toString(16).padStart(color.length, '0').toUpperCase()
  let fc = invc + (alpha === undefined ? '' : alpha)
  //   console.log('color inverted', invc, 'final', fc)
  return fc
}
