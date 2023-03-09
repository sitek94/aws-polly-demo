import express from 'express'
import 'dotenv/config'

const app = express()

console.log(process.env)

app.get('/', (req, res) => {
  res.send(/* html */ `
    <h1>Hello</h1>

    <script>
      (async () => {
        const response = await fetch('/synthesize')
        console.log(response)
      })()
      
    </script>
  `)
})

app.get('/synthesize', async (req, res) => {
  res.send('Hello')
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
