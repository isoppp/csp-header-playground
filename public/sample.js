console.log('hello from sample.js!')

const script = document.createElement('script')
script.src = '/public/additional.js'
document.head.appendChild(script)
