import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LoginForm } from './login-form';
import { buttonVariants } from '@/components/ui/button'

const Login = () => {
  return (
    <>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Register
      </Link>

      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome Back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to log in
        </p>
      </div>
      <LoginForm />
    </>
  )
}

export default Login;