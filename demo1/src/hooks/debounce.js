function debounce(fn, timer) {
  let timeId = null;
  function resolve(...args) {
    if (timeId) {
      clearTimeout(timeId);
    }
    timeId = setTimeout(() => {
      fn.apply(this, args);
    }, timer);
  }
  function stop() {
    if (timeId) {
      clearTimeout(timeId);
      timeId = null;
    }
  }
  return { fn: resolve, stop };
}

const { fn, stop } = debounce(() => {
  console.log(1);
}, 1000);
fn();
setTimeout(() => {
  stop();
}, 500);
