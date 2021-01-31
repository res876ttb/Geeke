class DataManager {
  constructor(eventListener) {
    this.counter = 0;
    this.eventListener = eventListener;
  }

  count() {
    this.counter += 1;
    this.fire();
    console.log(this.counter);
  }

  getCounter() {
    return this.counter;
  }

  fire() {
    this.eventListener(this.counter);
  }
}

export default DataManager;