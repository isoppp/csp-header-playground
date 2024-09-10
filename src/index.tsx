import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { FC } from 'hono/jsx'
import { secureHeaders } from 'hono/secure-headers'

const app = new Hono()
import { serveStatic } from '@hono/node-server/serve-static'
import { logger } from 'hono/logger'

// ngrok path
const BASE_URL = ''
const withBasePath = (path: string) => BASE_URL + path

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
app.use('*', cors())
app.use(
  '*',
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
      connectSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    },
  }),
)

const Sample: FC = () => {
  return (
    <html>
      <head>
        <title>CSP Header Playground</title>
        <link rel='stylesheet' href={withBasePath('/public/sample.css')} />
        <script src={withBasePath('/public/sample.js')} />
      </head>
      <body>
        <div class='hello'>hello</div>
      </body>
    </html>
  )
}

app.get('/', async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return c.html(<Sample />)
})

app.post('/report', async (c) => {
  console.log('got report')
  console.log(await c.req.json())
  return c.text('ok')
})

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
