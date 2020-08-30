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

import { createJournal, deleteTodo, getPublicJournals, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Journal } from '../types/Journal'

interface TodosProps {
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

export class Todos extends React.PureComponent<TodosProps, JournalsState> {
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

  handleMenuClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, data: MenuItemProps) => {
    this.setState({activeMenu: data.name ? data.name : ''})
  }

  onEditButtonClick = (journalId: string) => {
    this.props.history.push(`/todos/${journalId}/edit`)
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

  // onTodoDelete = async (todoId: string) => {
  //   try {
  //     await deleteTodo(this.props.auth.getIdToken(), todoId)
  //     this.setState({
  //       todos: this.state.todos.filter(todo => todo.todoId != todoId)
  //     })
  //   } catch {
  //     alert('Todo deletion failed')
  //   }
  // }

  // onTodoCheck = async (pos: number) => {
  //   try {
  //     const todo = this.state.todos[pos]
  //     await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
  //       name: todo.name,
  //       dueDate: todo.dueDate,
  //       done: !todo.done
  //     })
  //     this.setState({
  //       todos: update(this.state.todos, {
  //         [pos]: { done: { $set: !todo.done } }
  //       })
  //     })
  //   } catch {
  //     alert('Todo deletion failed')
  //   }
  // }

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
          {this.renderCreateJournalInput()}
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
              content: 'New task',
              onClick: this.onJournalCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
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

  

  renderTodos() {
    if (this.state.loadingJournals) {
      return this.renderLoading()
    }

    // return this.renderTodosList()
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
    return (
      <Grid padded>
        {this.state.publicJournals.map((journal, pos) => {
          return (
            <Grid.Row key={journal.journalId}>
              <Grid.Column width={10} verticalAlign="middle">
                {journal.title}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {journal.content}
              </Grid.Column>
              {journal.attachmentUrl && (
                <Image src={journal.attachmentUrl} size="small" wrapped />
              )}
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
