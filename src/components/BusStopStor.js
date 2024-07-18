function promiseReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

let DB_NAME = 'busstopstore'
let DB_VERSION = 1
let DB_STORE = 'busInfo'

async function openDB() {
  console.log('open db', DB_NAME, DB_VERSION)
  const request = indexedDB.open(DB_NAME, DB_VERSION)

  request.onupgradeneeded = function () {
    console.log('onupgradeneeded')
    const db = request.result
    db.createObjectStore(DB_STORE, { keyPath: 'busName' })
  }
  let db = await promiseReq(request)
  return db
}
async function openDBStore() {
  let store = (await openDB()).transaction(DB_STORE, 'readwrite').objectStore(DB_STORE)
  return store
}

// async function busAddTestData(store) {
//   console.log('busAddTestData')
//   await promiseReq(
//     store.put({
//       busName: '36',
//       stops: ['abc', 'def', 'ghi', 'jkl', '北京路', '博物馆', '超市', '云龙湖']
//     })
//   )
// }

async function busAddLine(busName, busStopsArray) {
  console.log('busAddLine', busName, busStopsArray)
  let db = await openDB()
  let store = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE)

  //   busAddTestData(store)
  let retBusName = await promiseReq(store.put({ busName: busName, stops: busStopsArray }))
  return retBusName
}

// async function busUpdateLine(busName, busStopsArray) {
//   let store = openDB().transaction(DB_STORE, 'readwrite').objectStore(DB_STORE)

//   let businfo = await promiseReq(store.get(busName))
//   businfo.stops = busStopsArray
//   await promiseReq(store.update(businfo))
// }

async function busDeleteLine(busName) {
  console.log('busDeleteLine', busName)

  let store = await openDBStore()
  return await promiseReq(store.delete(busName))
}

async function busGetBusList() {
  console.log('busGetBusList')

  let store = await openDBStore()
  let blist = await promiseReq(store.getAllKeys())
  console.log('bus list', blist)
  return blist
}

async function busGetBusStops(busName) {
  console.log('busGetBusStops')

  let store = await openDBStore()
  return (await promiseReq(store.get(busName))).stops
}
export { busAddLine, busDeleteLine, busGetBusList, busGetBusStops }
