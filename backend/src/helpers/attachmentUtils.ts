import * as AWS from 'aws-sdk'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const s3 = new XAWS.S3({ signatureVersion: 'v4' })

export async function generateAttachmentUrl(todoId: string): Promise<string> {
  return `https://${bucketName}.s3.amazonaws.com/${todoId}`
}

export async function createSignedUrl(todoId: string): Promise<String> {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: +urlExpiration
  })
}
