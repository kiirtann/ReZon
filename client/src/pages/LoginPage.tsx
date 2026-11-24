import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Alert, Button, Card, FormField, Input } from '../components/ui';
import { useLogin } from '../features/auth/api';
import { handleAuthApiError } from '../features/auth/formErrors';
import { buildAuthLink, getSafeRedirect } from '../features/auth/redirect';
import { loginSchema } from '../features/auth/schemas';
import type { LoginInput } from '../features/auth/types';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const destination = getSafeRedirect(redirectParam);

  const loginMutation = useLogin();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const isSubmitting = loginMutation.isPending;

  const onSubmit = (values: LoginInput) => {
    setServerError(null);
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate(destination, { replace: true });
      },
      onError: (error) => {
        setServerError(
          handleAuthApiError(
            error,
            setError,
            ['email', 'password'],
            'Unable to sign in. Please try again.',
          ),
        );
      },
    });
  };

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md">
        <Card padding="lg">
          <div className="mb-6 space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-text">Sign in</h1>
            <p className="text-sm text-muted">Welcome back. Enter your credentials to continue.</p>
          </div>

          {serverError && (
            <Alert variant="danger" className="mb-4">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Email" htmlFor="login-email" error={errors.email?.message} required>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                error={Boolean(errors.email)}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Password"
              htmlFor="login-password"
              error={errors.password?.message}
              required
            >
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                error={Boolean(errors.password)}
                {...register('password')}
              />
            </FormField>

            <Button type="submit" loading={isSubmitting} className="w-full">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link
              to={buildAuthLink('/register', redirectParam)}
              className="font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Register
            </Link>
          </p>
        </Card>
      </div>
    </Container>
  );
}
