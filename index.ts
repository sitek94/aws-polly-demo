import express from 'express'
import {Readable} from 'stream'
import {
  PollyClient,
  SynthesizeSpeechCommand,
  SynthesizeSpeechCommandInput,
} from '@aws-sdk/client-polly'
import 'dotenv/config'

const app = express()

const {AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY} = process.env
if (!AWS_ACCESS_KEY || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('Missing AWS credentials')
}

const polly = new PollyClient({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
})

const input = {
  Text: `Hello, I'm Matthew.`,
  OutputFormat: 'mp3',
  VoiceId: 'Matthew',
  Engine: 'neural',
  LanguageCode: 'en-US',
} satisfies SynthesizeSpeechCommandInput

app.get('/', (req, res) => {
  res.send(/* html */ `
    <button onclick="synthesize()">Synthesize</button>
    <script>
      async function synthesize() {
        fetch('/synthesize')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          var audioContext = new AudioContext();
          audioContext.decodeAudioData(arrayBuffer, function(buffer) {
            var source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start(0);
          });
        })
        .catch(error => console.error(error));
      }
    </script>
  `)
})

app.get('/synthesize', async (req, res) => {
  try {
    const command = new SynthesizeSpeechCommand(input)
    const {AudioStream} = await polly.send(command)

    if (!AudioStream) {
      throw new Error('No AudioStream')
    }

    if (AudioStream instanceof Readable) {
      res.set('Content-Type', 'audio/mpeg')
      AudioStream.pipe(res)
    }
  } catch (error: any) {
    console.error(error)
    res.status(500).send(error.message)
  }
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
  console.log('Try http://localhost:3000/ in your browser')
})
