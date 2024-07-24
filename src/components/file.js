function normWinFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_')
}

// https://datatracker.ietf.org/doc/html/rfc2397
function parseURIMediaType(uri) {
  let m = uri.match(/^data:([^;]+);/)
  console.log('parseURIMediaType', m)
  return m && m.length > 1 && m[1]
}

export function saveAs(data, fname) {
  console.log('saveAs', typeof data, data, fname)
  fname = normWinFileName(fname)
  const link = document.createElement('a')
  link.style.display = 'none'
  document.body.appendChild(link)
  link.setAttribute('download', fname)

  if (data instanceof Blob) {
    data = URL.createObjectURL(data)
  } else {
    let mt = parseURIMediaType(data)
    if (mt) {
      data = data.replace(mt, 'image/octet-stream')
    } else {
      data = 'data:application/octet-stream,' + encodeURIComponent(data)
    }
  }
  link.setAttribute('href', data)

  link.click()
}
