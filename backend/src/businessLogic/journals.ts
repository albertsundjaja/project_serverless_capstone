import {JournalAccess} from '../dataLayer/journalAccess'
import * as uuid from 'uuid';

import { JournalItem } from '../models/JournalItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as moment from 'moment'

const journalAccess = new JournalAccess()

export async function createJournal(
    newJournal,
    userId
): Promise<JournalItem> {
    const now = moment().format('YYYYMMDD')
    const journalId = uuid.v4()
    const journal: JournalItem = {
        ...newJournal,
            userId: userId,
            journalId,
            createdAt: now
        }
    return await journalAccess.createJournal(journal)
}

export async function deleteTodo(todoId, userId) {
    return await journalAccess.deleteTodo(todoId, userId)
}

export async function getJournals(userId) {
    return await journalAccess.getJournals(userId)
}

export async function getPublicJournals() {
    const startDate = moment().format('YYYYMMDD')
    return await journalAccess.getPublicJournals(startDate)
}   

export async function updateTodo(todoId, userId, data : TodoUpdate) {
    return await journalAccess.updateTodo(todoId, userId, data)
}

export async function updateUrl(todoId, userId) {
    return await journalAccess.updateUrl(todoId, userId)
}