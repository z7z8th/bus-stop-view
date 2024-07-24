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
  // console.log('open db', DB_NAME, DB_VERSION)
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

async function dbDeleteAllBusLines() {
  console.log('dbDeleteAllBusLines')

  let store = await openDBStore()
  return await promiseReq(store.clear())
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

async function dbAddBusLine(busName, busStopList, busInfo) {
  console.log('dbAddBusLine', busName, busStopList, busInfo)
  let db = await openDB()
  let store = db.transaction(DB_STORE, 'readwrite').objectStore(DB_STORE)
  if (!busInfo) {
    busInfo = dbGetBusInfo(busName)
  }

  //   busAddTestData(store)
  let retBusName = await promiseReq(
    store.put({ busName: busName, stops: busStopList, info: busInfo })
  )
  return retBusName
}

// async function busUpdateLine(busName, busStopsArray) {
//   let store = openDB().transaction(DB_STORE, 'readwrite').objectStore(DB_STORE)

//   let businfo = await promiseReq(store.get(busName))
//   businfo.stops = busStopsArray
//   await promiseReq(store.update(businfo))
// }

async function dbDeleteBusLine(busName) {
  console.log('dbDeleteBusLine', busName)

  let store = await openDBStore()
  return await promiseReq(store.delete(busName))
}

async function dbGetBusList() {
  console.log('dbGetBusList')

  let store = await openDBStore()
  let blist = await promiseReq(store.getAllKeys())
  console.log('bus list', blist)
  return blist
}

async function dbGetBusStops(busName) {
  console.log('dbGetBusStops', busName)

  let store = await openDBStore()
  let record = await promiseReq(store.get(busName))
  return record && record.stops
}

async function dbGetBusInfo(busName) {
  console.log('dbGetBusInfo', busName)

  let store = await openDBStore()
  let record = await promiseReq(store.get(busName))
  return record && record.info
}

export {
  dbAddBusLine,
  dbDeleteBusLine,
  dbGetBusList,
  dbGetBusStops,
  dbGetBusInfo,
  dbDeleteAllBusLines
}
