import React, { PureComponent } from 'react'
import './assets/bootstrap.min.css'
import './app.scss'
import '@fortawesome/fontawesome-free/css/all.css'
import 'react-toastify/dist/ReactToastify.css'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ytdl from 'ytdl-core'
const remote = window.require('electron').remote
const fs = remote.require('fs')

const storageKey = 'last-url'

class App extends PureComponent {
  constructor(props) {
    super(props)
    this.doDownload = this.doDownload.bind(this)
    this.updateUrl = this.updateUrl.bind(this)
    this.state = {
      url: localStorage.getItem(storageKey) || ''
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
    const title = info.player_response.videoDetails.title

    ytdl(this.state.url, {
      format: 'mp4'
    }).pipe(fs.createWriteStream(`${title}.mp4`))
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
          </div>
        </div>
      </>
    )
  }
}

export default App
