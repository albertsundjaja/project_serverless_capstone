import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import { LogIn } from './LogIn'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Menu,
  MenuItemProps
} from 'semantic-ui-react'

import { createJournal, deleteJournal, getPublicJournals, patchJournal, getJournals } from '../api/journals-api'
import Auth from '../auth/Auth'
import { Journal } from '../types/Journal'
import { apiEndpoint } from '../config'

interface JournalsProps {
  auth: Auth
  history: History
}

interface JournalsState {
  journals: Journal[]
  publicJournals: Journal[]
  newJournalTitle: string
  loadingJournals: boolean
  activeMenu: string
}

export class Journals extends React.PureComponent<JournalsProps, JournalsState> {
  state: JournalsState = {
    journals: [],
    publicJournals: [],
    newJournalTitle: '',
    loadingJournals: true,
    activeMenu: 'allJournals'
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newJournalTitle: event.target.value })
  }

  handleMenuClick = async (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: MenuItemProps) => {
    this.setState({loadingJournals: true, activeMenu: data.name ? data.name : ''})
    let journals:Journal[] = []
    if (data.name && data.name == 'myJournal') {
      try {
        journals = await getJournals(this.props.auth.getIdToken())
      }
      catch (e) {
        alert(`Failed to fetch journals: ${e.message}`)
      }
    }
    this.setState({loadingJournals: false, journals})
    
  }

  onEditButtonClick = (journalId: string, title: string) => {
    this.props.history.push(`/journals/${journalId}/edit/${title}`)
  }

  onJournalCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newJournal = await createJournal(this.props.auth.getIdToken(), {
        title: this.state.newJournalTitle,
        content: ''
      })
      this.setState({
        journals: [...this.state.journals, newJournal],
        publicJournals: [...this.state.publicJournals, newJournal],
        newJournalTitle: ''
      })
    } catch {
      alert('Journal creation failed')
    }
  }

  onJournalDelete = async (journalId: string) => {
    try {
      await deleteJournal(this.props.auth.getIdToken(), journalId)
      this.setState({
        journals: this.state.journals.filter(journal => journal.journalId != journalId),
        publicJournals: this.state.publicJournals.filter(journal => journal.journalId != journalId)
      })
    } catch {
      alert('Journal deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const publicJournals = await getPublicJournals(this.props.auth.getIdToken())
      this.setState({
        publicJournals,
        loadingJournals: false
      })
    } catch (e) {
      alert(`Failed to fetch journals: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        
        <Header as="h1">Journals</Header>
        
        {this.renderMenu()}

        {this.renderPublicJournals()}
      </div>
    )
  }

  renderMenu() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }
    return (
        <Grid.Row>
          <Menu>
            <Menu.Item 
              active={this.state.activeMenu == 'allJournals'}
              name="allJournals"
              onClick={this.handleMenuClick}>
                All Journals
            </Menu.Item>
            <Menu.Item
              active={this.state.activeMenu == 'myJournal'}
              name="myJournal"
              onClick={this.handleMenuClick}>
                My Journal
            </Menu.Item>
          </Menu>
          {this.state.activeMenu == 'myJournal' && this.renderCreateJournalInput()}
        </Grid.Row>
    )
  }

  renderCreateJournalInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Journal',
              onClick: this.onJournalCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Title"
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPublicJournals() {
    if (this.state.loadingJournals) {
      return this.renderLoading()
    }

    return this.renderPublicJournalsList()
  }

  

  renderJournals() {
    if (this.state.loadingJournals) {
      return this.renderLoading()
    }

  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Journals
        </Loader>
      </Grid.Row>
    )
  }

  renderPublicJournalsList() {
    let journals = []
    if (!this.props.auth.isAuthenticated() || this.state.activeMenu == 'allJournals')
    {
      journals = this.state.publicJournals
    } else {
      journals = this.state.journals
    }
    return (
      <Grid padded>
        {journals.map((journal, pos) => {
          return (
            <Grid.Row key={journal.journalId}>
              <Grid.Column width={10}>
                <Grid.Row>
                  <Grid.Column width={12} verticalAlign="middle">
                    <b>Title: {journal.title}</b>
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={12} floated="right">
                    {journal.content}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  {journal.attachmentUrl && (
                    <Image src={journal.attachmentUrl} size="small" wrapped />
                  )}
                  
                </Grid.Row>
              </Grid.Column>
              {this.state.activeMenu == 'myJournal' && 
              <React.Fragment>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(journal.journalId, journal.title)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onJournalDelete(journal.journalId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              </React.Fragment>
              }
              
              <Grid.Column width={16}>
                  <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
