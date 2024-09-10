import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { FC } from 'hono/jsx'
import { secureHeaders } from 'hono/secure-headers'

type Variables = {
  nonce: string
}
const app = new Hono<{ Variables: Variables }>()
import crypto from 'node:crypto'
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'

// ngrok path
const BASE_URL = ''.replace(/\/$/, '')
const withBasePath = (path: string) => BASE_URL + path

app.use('*', cors())
app.use(logger())
app.use(
  '/public/*',
  serveStatic({
    root: './',
    onNotFound: (path, c) => {
      console.log(`${path} is not found, you access ${c.req.path}`)
    },
  }),
)

const Sample: FC<{ pathname: string; nonce?: string }> = ({ nonce }) => {
  return (
    <html>
      <head>
        <title>CSP Header Playground</title>
        <link rel='stylesheet' href={withBasePath('/public/sample.css')} />
        <script src={withBasePath('/public/sample.js')} nonce={nonce} />
      </head>
      <body>
        <div style={{ display: 'flex', gap: '20px', padding: '10px', borderBottom: '2px solid gray' }}>
          <a href='/'>/</a>
          <a href='/csp'>/csp</a>
          <a href='/nonce'>/nonce</a>
        </div>
        <div class='hello'>hello</div>
      </body>
    </html>
  )
}

app.get('/', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return c.html(<Sample />)
})

app.use(
  '/csp',
  secureHeaders({
    reportingEndpoints: [
      {
        name: 'csp-endpoint',
        url: withBasePath('/report'),
      },
    ],
    contentSecurityPolicy: {
      defaultSrc: [''],
      reportTo: 'csp-endpoint',
      // connectSrc: ["'self'"],
      // imgSrc: ["'self'", 'data:'],
      // scriptSrc: ["'self'"],
      // styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    },
  }),
)
app.get('/csp', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 250))
  return c.html(<Sample />)
})

app.post('/report', async (c) => {
  console.log('got report')
  console.log(await c.req.json())
  return c.text('ok')
})

// nonce
app.use('*', (c, next) => {
  c.set('nonce', crypto.randomBytes(16).toString('hex'))
  return next()
})
app.use(
  '/nonce',
  secureHeaders({
    contentSecurityPolicy: {
      scriptSrc: [(c) => `'nonce-${c.get('nonce')}'`],
    },
  }),
)
app.get('/nonce', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return c.html(<Sample nonce={c.get('nonce')} />)
})

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
