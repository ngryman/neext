let count = 0

const div = document.createElement('div')
div.innerHTML = 'Count: 0'
document.body.appendChild(div)

setInterval(() => {
  count++
  div.innerHTML = `Count: ${count}`
}, 1000)

document.__hot = import.meta.hot

// import.meta.hot?.accept(() => {
//   import.meta.hot?.invalidate()
// })
