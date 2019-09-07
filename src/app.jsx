import React, { PureComponent } from 'react'
import './assets/bootstrap.min.css'
import './app.scss'
import '@fortawesome/fontawesome-free/css/all.css'
import 'react-toastify/dist/ReactToastify.css'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ytdl from 'ytdl-core'
const remote = window.require('electron').remote
const fs = remote.require('fs')
const downloadDir = './download'
const storageKey = 'last-url'

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.doDownload = this.doDownload.bind(this)
    this.updateUrl = this.updateUrl.bind(this)
    this.state = {
      url: localStorage.getItem(storageKey) || '',
      downloading: false,
      progress: 0,
      startTime: null,
      estimatedTime: 0
    }
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir)
    }
  }
  updateUrl({ target: { value } }) {
    this.setState({
      url: value
    })
    localStorage.setItem(storageKey, value)
  }
  async doDownload() {
    const info = await ytdl.getBasicInfo(this.state.url)
    console.log(info)
    // Setup video source
    const input = ytdl(this.state.url, {
      format: 'mp4'
    })
    input.once('response', () => {
      this.setState({
        downloading: true,
        progress: 0,
        startTime: Date.now(),
        estimatedTime: 0
      })
      toast.info('Скачивание началось')
    })
    input.on('progress', (chunkLength, downloaded, total) => {
      const percent = downloaded / total
      const downloadedTime = Date.now() - this.state.startTime
      this.setState({
        progress: Math.floor(percent * 100),
        estimatedTime: downloadedTime * (1 - 1 / percent)
      })
    })

    // Setup file destination
    const title = info.player_response.videoDetails.title
    const baseName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const output = fs.createWriteStream(`${downloadDir}/${baseName}.mp4`)
    input.on('end', () => {
      toast.info(`Скачивание завершено. Файл: ${baseName}.mp4`)
      this.setState({
        downloading: false,
        progress: 0
      })
    })

    input.pipe(output)
  }
  progress() {
    if (this.state.downloading && !isNaN(this.state.progress)) {
      return (
        <>
          <p>Downloading: {this.state.progress.toFixed(2)}%</p>
          <p>Time left: {this.state.estimatedTime.toFixed(2)}</p>
        </>
      )
    } else if (this.state.downloading) {
      return <div className="loading" />
    }
  }
  render() {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          pauseOnVisibilityChange={false}
          draggable
          pauseOnHover
        />
        <div className="v-layout">
          <div className="col-lg-6 col-md-8 offset-lg-3 offset-md-2 mt-5">
            <Card>
              <Card.Header>Скачать с Youtube</Card.Header>
              <Card.Body>
                <Form className="card-text">
                  <Form.Group>
                    <Form.Label>Введите ссылку</Form.Label>
                    <Form.Control placeholder="ссылка" value={this.state.url} onChange={this.updateUrl} />
                  </Form.Group>
                </Form>
                <footer className="text-center">
                  <Button variant="primary" disabled={!this.state.url} className="w-10em" onClick={this.doDownload}>
                    Скачать
                  </Button>
                </footer>
              </Card.Body>
            </Card>
            {this.progress()}
          </div>
        </div>
      </>
    )
  }
}

export default App
