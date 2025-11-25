import jwt, { type JwtPayload } from 'jsonwebtoken'
import { env } from '@/env'

interface IGenerateTokenFnParams {
	email: string
}

type TGenerateTokenFn = (params: IGenerateTokenFnParams) => string

export const generateToken: TGenerateTokenFn = ({ email }) => jwt.sign({ email }, env.JWT_SECRET, { expiresIn: '1h' })

interface IVerifyTokenFnParams {
	token: string
}

type TVerifyTokenFn = (params: IVerifyTokenFnParams) => JwtPayload | string

export const verifyToken: TVerifyTokenFn = ({ token }) => jwt.verify(token, env.JWT_SECRET)
