import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@/env'

export const r2 = new S3Client({
	region: 'auto',
	endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: env.R2_ACCESS_KEY_ID,
		secretAccessKey: env.R2_SECRET_ACCESS_KEY,
	},
})

interface IUploadToR2Params {
	key: string
	body: Buffer | Uint8Array | Blob
	contentType: string
}

type TUploadToR2Fn = (params: IUploadToR2Params) => Promise<string>

export const uploadToR2: TUploadToR2Fn = async ({ key, body, contentType }) => {
	await r2.send(
		new PutObjectCommand({
			Bucket: env.R2_BUCKET,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	)

	return `${env.R2_PUBLIC_URL}/${key}`
}

interface IDeleteFromR2Params {
	key: string
}

type TDeleteFromR2Fn = (params: IDeleteFromR2Params) => Promise<void>

export const deleteFromR2: TDeleteFromR2Fn = async ({ key }) => {
	await r2.send(
		new DeleteObjectCommand({
			Bucket: env.R2_BUCKET,
			Key: key,
		}),
	)
}
