class EventBus {
  constructor() {
    // initialize event list
    this.eventObject = {}
    // id of the callback function list
    this.callbackId = 0
  }
  // publish event
  publish(eventName, ...args) {
    // Get all the callback functions of the current event
    const callbackObject = this.eventObject[eventName]

    if (!callbackObject) return console.warn(eventName + ' not found!')

    // execute each callback function
    for (let id in callbackObject) {
      // pass parameters when executing
      callbackObject[id](...args)

      // The callback function that is only subscribed once needs to be deleted
      if (id[0] === 'd') {
        delete callbackObject[id]
      }
    }
  }
  // Subscribe to events
  subscribe(eventName, callback) {
    // initialize this event
    if (!this.eventObject[eventName]) {
      // Use object storage to improve the efficiency of deletion when logging out the callback function
      this.eventObject[eventName] = {}
    }

    const id = this.callbackId++

    // store the callback function of the subscriber
    // callbackId needs to be incremented after use for the next callback function
    this.eventObject[eventName][id] = callback

    // Every time you subscribe to an event, a unique unsubscribe function is generated
    const unSubscribe = () => {
      // clear the callback function of this subscriber
      delete this.eventObject[eventName][id]

      // If this event has no subscribers, also clear the entire event object
      if (Object.keys(this.eventObject[eventName]).length === 0) {
        delete this.eventObject[eventName]
      }
    }

    return { unSubscribe }
  }

  // only subscribe once
  subscribeOnce(eventName, callback) {
    // initialize this event
    if (!this.eventObject[eventName]) {
      // Use object storage to improve the efficiency of deletion when logging out the callback function
      this.eventObject[eventName] = {}
    }

    // Callback function marked as subscribe only once
    const id = 'd' + this.callbackId++

    // store the callback function of the subscriber
    // callbackId needs to be incremented after use for the next callback function
    this.eventObject[eventName][id] = callback

    // Every time you subscribe to an event, a unique unsubscribe function is generated
    const unSubscribe = () => {
      // clear the callback function of this subscriber
      delete this.eventObject[eventName][id]

      // If this event has no subscribers, also clear the entire event object
      if (Object.keys(this.eventObject[eventName]).length === 0) {
        delete this.eventObject[eventName]
      }
    }

    return { unSubscribe }
  }

  // clear event
  clear(eventName) {
    // If no event name is provided, all events are cleared by default
    if (!eventName) {
      this.eventObject = {}
      return
    }

    // clear the specified event
    delete this.eventObject[eventName]
  }
}

// eslint-disable-next-line no-unused-vars
function test1() {
  // test
  const eventBus = new EventBus()

  // Subscribe to event eventX
  eventBus.subscribe('eventX', (obj, num) => {
    console.log('Module A', obj, num)
  })
  eventBus.subscribe('eventX', (obj, num) => {
    console.log('Module B', obj, num)
  })
  eventBus.subscribe('eventX', (obj, num) => {
    console.log('Module C', obj, num)
  })

  // publish event eventX
  eventBus.publish('eventX', { msg: 'EventX published!' }, 1)

  // clear
  eventBus.clear('eventX')

  // Publish the event eventX again, since it has been cleared, all modules will no longer receive the message
  eventBus.publish('eventX', { msg: 'EventX published again!' }, 2)

  // output
  // > Module A {msg: 'EventX published!'} 1
  // > Module B {msg: 'EventX published!'} 1
  // > Module C {msg: 'EventX published!'} 1
  // > eventX not found!
}

// upper instance
class EventBusTool {
  static _eventBus

  constructor() {}

  static getEventBus() {
    // first initialization
    if (this._eventBus == undefined) {
      this._eventBus = new EventBus()
    }

    // Subsequent to directly take a unique instance each time, keep the global singleton
    return this._eventBus
  }
}

// use
// const eventBus = EventBusTool.getEventBus()

export { EventBus, EventBusTool }
