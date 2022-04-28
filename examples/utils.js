const a = require('./constants');

console.log(JSON.stringify(a.BOOK_SOURCES, null, 2))

function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, delay);
  });
}

module.exports.sleep = sleep;

let callback = null;
function series(requests) {
  function run() {
    const request = requests.shift();
    console.log(request);
    if (request) {
      request().then((resp) => {
        if (callback !== null) {
          callback(resp);
        }
        run();
      });
    }
  }
  run();
  return {
    listen(fn) {
      callback = fn;
    },
  };
}

series([
  () => sleep(1000),
  () => sleep(3000),
  () => sleep(2000),
  () => sleep(8000),
]).listen(() => {
  console.log("1");
});
