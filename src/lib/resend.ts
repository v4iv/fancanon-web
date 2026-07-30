import { Resend } from 'resend'
import { RESEND_API_KEY } from '$app/env/private'

export const resend = new Resend(RESEND_API_KEY)
