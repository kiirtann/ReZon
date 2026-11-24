import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Container } from '../components/layout/Container';
import { Alert, Button, Card, FormField, Input } from '../components/ui';
import { useRegister } from '../features/auth/api';
import { handleAuthApiError } from '../features/auth/formErrors';
import { buildAuthLink, getSafeRedirect } from '../features/auth/redirect';
import { registerSchema } from '../features/auth/schemas';
import type { RegisterInput } from '../features/auth/types';

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const destination = getSafeRedirect(redirectParam);

  const registerMutation = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const isSubmitting = registerMutation.isPending;

  const onSubmit = (values: RegisterInput) => {
    setServerError(null);
    registerMutation.mutate(values, {
      onSuccess: () => {
        navigate(destination, { replace: true });
      },
      onError: (error) => {
        setServerError(
          handleAuthApiError(
            error,
            setError,
            ['name', 'email', 'password'],
            'Unable to create account. Please try again.',
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
            <h1 className="text-2xl font-bold tracking-tight text-text">Create account</h1>
            <p className="text-sm text-muted">Sign up to save your orders and check out faster.</p>
          </div>

          {serverError && (
            <Alert variant="danger" className="mb-4">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField label="Name" htmlFor="register-name" error={errors.name?.message} required>
              <Input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                disabled={isSubmitting}
                error={Boolean(errors.name)}
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Email"
              htmlFor="register-email"
              error={errors.email?.message}
              required
            >
              <Input
                id="register-email"
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
              htmlFor="register-password"
              error={errors.password?.message}
              hint="At least 8 characters"
              required
            >
              <Input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                error={Boolean(errors.password)}
                {...register('password')}
              />
            </FormField>

            <Button type="submit" loading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link
              to={buildAuthLink('/login', redirectParam)}
              className="font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </Container>
  );
}
