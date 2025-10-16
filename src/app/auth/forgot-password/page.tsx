'use client'

import { sendResetPasswordEmail } from '@/actions/auth.actions'
import { useState, useTransition } from 'react'


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await sendResetPasswordEmail(email)
      setMessage(result.message)
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
        >
          {isPending ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  )
}
