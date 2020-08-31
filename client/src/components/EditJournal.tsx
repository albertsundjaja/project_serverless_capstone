import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, patchJournal } from '../api/journals-api'
import { UpdateJournalRequest } from '../types/UpdateJournalRequest'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditJournalProps {
  match: {
    params: {
      journalId: string,
      title: string
    }
  }
  auth: Auth
}

interface EditJournalState {
  file: any
  uploadState: UploadState
  updateState: boolean
  title: string
  content: string
}

export class EditJournal extends React.PureComponent<
  EditJournalProps,
  EditJournalState
> {
  state: EditJournalState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    updateState: false,
    title: this.props.match.params.title,
    content: ''
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name == "title") {
      this.setState({
        title: event.target.value
      })
    }
    if (event.target.name == 'content') {
      this.setState({
        content: event.target.value
      })
    }
  }

  handleSubmitImage = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.journalId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  handleSubmitData = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    let data: UpdateJournalRequest = {
      title: this.state.title,
      content: this.state.content
    }
    this.setState({updateState : true})
    try {
      await patchJournal(this.props.auth.getIdToken(), this.props.match.params.journalId, data)
      alert('Journal was updated!')
    } catch (e) {
      alert('Could not update journal: ' + e.message)
    }
    this.setState({updateState : false})
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmitImage}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>

        <Form onSubmit={this.handleSubmitData}>
          <Form.Field>
            <label>Title</label>
            <input
              name="title"
              value={this.state.title}
              type="text"
              placeholder="title"
              onChange={this.handleInputChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Content</label>
            <input
              name="content"
              value={this.state.content}
              type="text"
              placeholder="title"
              onChange={this.handleInputChange}
            />
          </Form.Field>
          <Button
            loading={this.state.updateState}
            type="submit"
          >
            Update
          </Button>
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
