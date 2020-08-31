import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

import { JournalItem } from '../models/JournalItem'
import { JournalUpdate } from '../models/JournalUpdate'

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.IMAGES_S3_BUCKET

export class JournalAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly journalTable = process.env.JOURNAL_TABLE,
        private readonly userIdIndex = process.env.JOURNAL_USERID_INDEX,
        private readonly createdAtIndex = process.env.JOURNAL_CREATEDAT_INDEX ) {}
    
    async createJournal(journal): Promise<JournalItem> {
        
        await this.docClient.put({
            TableName: this.journalTable,
            Item: journal
          }).promise()
          
        
        return journal
    }

    async deleteTodo(todoId, userId) {
        return await this.docClient.delete({
            TableName: this.journalTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
    }

    async getJournals(userId) {
        return await this.docClient.query({
            TableName: this.journalTable,
            IndexName : this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
            }).promise()
    }

    async getPublicJournals(startDate) {
        return await this.docClient.query({
            TableName: this.journalTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'createdAt = :createdAt',
            ExpressionAttributeValues: {
                ':createdAt': startDate
            }
        }).promise()
    }

    async updateJournal(journalId, userId, updatedJournal: JournalUpdate) {
        return await this.docClient.update({
            TableName: this.journalTable,
            Key: {
                journalId,
                userId
            },
            AttributeUpdates: {
                'title': {
                    Action: 'PUT',
                    Value: updatedJournal.title
                },
                'content': {
                    Action: 'PUT',
                    Value: updatedJournal.content
                }
            }
        }).promise()
    }

    async updateUrl(todoId, userId) {
        return await this.docClient.update({
            TableName: this.journalTable,
            Key: {
                todoId,
                userId
            },
            AttributeUpdates: {
                attachmentUrl: {
                    Action: 'PUT',
                    Value: `https://${bucketName}.s3.amazonaws.com/${todoId}`
                }
            }
        }).promise()
    }
}