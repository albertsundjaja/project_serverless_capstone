import { apiEndpoint } from '../config'
import { Journal } from '../types/Journal';
import { CreateJournalRequest } from '../types/CreateJournalRequest';
import Axios from 'axios'
import { UpdateJournalRequest } from '../types/UpdateJournalRequest';

export async function getPublicJournals(idToken: string): Promise<Journal[]> {
  console.log('Fetching public journals')

  const response = await Axios.get(`${apiEndpoint}/public-journals`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Public Journals:', response.data)
  return response.data.items
}

export async function getJournals(idToken: string): Promise<Journal[]> {
  console.log('Fetching journals')

  const response = await Axios.get(`${apiEndpoint}/journals`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Journals:', response.data)
  return response.data.items
}

export async function createJournal(
  idToken: string,
  newJournal: CreateJournalRequest
): Promise<Journal> {
  const response = await Axios.post(`${apiEndpoint}/journals`,  JSON.stringify(newJournal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchJournal(
  idToken: string,
  journalId: string,
  updatedJournal: UpdateJournalRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/journals/${journalId}`, JSON.stringify(updatedJournal), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
