import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Container } from '../components/layout/Container';
import { Alert, Button, Card, CardHeader, FormField, Input, Spinner } from '../components/ui';
import { useChangePassword, useMe, useUpdateProfile } from '../features/auth/api';
import { handleAuthApiError } from '../features/auth/formErrors';
import { changePasswordSchema, updateProfileSchema } from '../features/auth/schemas';

type ProfileFormValues = z.infer<typeof updateProfileSchema>;
type PasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Protected account settings page where signed-in users can update their
 * name/email and change their password.
 */
export function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [profileBanner, setProfileBanner] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);
  const [passwordBanner, setPasswordBanner] = useState<{
    type: 'success' | 'danger';
    message: string;
  } | null>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, email: user.email });
    }
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onProfileSubmit(values: ProfileFormValues) {
    setProfileBanner(null);
    updateProfile.mutate(values, {
      onSuccess: () => {
        setProfileBanner({ type: 'success', message: 'Profile updated successfully.' });
      },
      onError: (error) => {
        const message = handleAuthApiError(
          error,
          profileForm.setError,
          ['name', 'email'],
          'Unable to update profile. Please try again.',
        );
        setProfileBanner({ type: 'danger', message });
      },
    });
  }

  function onPasswordSubmit(values: PasswordFormValues) {
    setPasswordBanner(null);
    changePassword.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          passwordForm.reset();
          setPasswordBanner({ type: 'success', message: 'Password changed successfully.' });
        },
        onError: (error) => {
          const message = handleAuthApiError(
            error,
            passwordForm.setError,
            ['currentPassword', 'newPassword'],
            'Unable to change password. Please try again.',
          );
          setPasswordBanner({ type: 'danger', message });
        },
      },
    );
  }

  if (isLoading) {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-12">
        <Spinner size="lg" label="Loading profile" />
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your account details and security settings.
        </p>
      </div>

      <Card padding="lg" className="space-y-4">
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">Account Details</h2>
          <p className="text-sm text-muted">Update your display name and email address.</p>
        </CardHeader>

        {profileBanner && <Alert variant={profileBanner.type}>{profileBanner.message}</Alert>}

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Full name"
            htmlFor="profile-name"
            required
            error={profileForm.formState.errors.name?.message}
          >
            <Input
              id="profile-name"
              type="text"
              autoComplete="name"
              error={Boolean(profileForm.formState.errors.name)}
              {...profileForm.register('name')}
            />
          </FormField>

          <FormField
            label="Email address"
            htmlFor="profile-email"
            required
            error={profileForm.formState.errors.email?.message}
          >
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              error={Boolean(profileForm.formState.errors.email)}
              {...profileForm.register('email')}
            />
          </FormField>

          <Button type="submit" loading={updateProfile.isPending}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card padding="lg" className="space-y-4">
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">Change Password</h2>
          <p className="text-sm text-muted">Choose a strong password of at least 8 characters.</p>
        </CardHeader>

        {passwordBanner && <Alert variant={passwordBanner.type}>{passwordBanner.message}</Alert>}

        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField
            label="Current password"
            htmlFor="profile-current-password"
            required
            error={passwordForm.formState.errors.currentPassword?.message}
          >
            <Input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              error={Boolean(passwordForm.formState.errors.currentPassword)}
              {...passwordForm.register('currentPassword')}
            />
          </FormField>

          <FormField
            label="New password"
            htmlFor="profile-new-password"
            required
            error={passwordForm.formState.errors.newPassword?.message}
          >
            <Input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              error={Boolean(passwordForm.formState.errors.newPassword)}
              {...passwordForm.register('newPassword')}
            />
          </FormField>

          <FormField
            label="Confirm new password"
            htmlFor="profile-confirm-password"
            required
            error={passwordForm.formState.errors.confirmPassword?.message}
          >
            <Input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              error={Boolean(passwordForm.formState.errors.confirmPassword)}
              {...passwordForm.register('confirmPassword')}
            />
          </FormField>

          <Button type="submit" variant="secondary" loading={changePassword.isPending}>
            Update password
          </Button>
        </form>
      </Card>
    </Container>
  );
}
