import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Card, CardContent, CardHeader, FormField, Input } from '../../../components/ui';
import { shippingAddressSchema, type ShippingAddressFormValues } from '../schemas';
import type { ShippingAddress } from '../types';

export interface AddressFormProps {
  onSubmit: (address: ShippingAddress) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitLabel?: string;
}

/**
 * Shipping address form for `/checkout`, validated with Zod + react-hook-form.
 */
export function AddressForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
  submitLabel = 'Pay with Stripe',
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: '',
    },
  });

  const isFormDisabled = isSubmitting || disabled;

  const handleFormSubmit = (values: ShippingAddressFormValues) => {
    const cleanedLine2 = values.line2?.trim();
    onSubmit({
      fullName: values.fullName,
      line1: values.line1,
      ...(cleanedLine2 ? { line2: cleanedLine2 } : {}),
      city: values.city,
      state: values.state,
      postalCode: values.postalCode,
      country: values.country,
      phone: values.phone,
    });
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <h2 className="text-lg font-semibold text-text">Shipping Address</h2>
        <p className="text-sm text-muted">Enter where you would like your order delivered.</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
          <FormField
            label="Full name"
            htmlFor="shipping-full-name"
            error={errors.fullName?.message}
            required
          >
            <Input
              id="shipping-full-name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              disabled={isFormDisabled}
              error={Boolean(errors.fullName)}
              {...register('fullName')}
            />
          </FormField>

          <FormField
            label="Address line 1"
            htmlFor="shipping-line1"
            error={errors.line1?.message}
            required
          >
            <Input
              id="shipping-line1"
              type="text"
              autoComplete="address-line1"
              placeholder="123 MG Road"
              disabled={isFormDisabled}
              error={Boolean(errors.line1)}
              {...register('line1')}
            />
          </FormField>

          <FormField
            label="Address line 2"
            htmlFor="shipping-line2"
            error={errors.line2?.message}
            hint="Apartment, suite, landmark (optional)"
          >
            <Input
              id="shipping-line2"
              type="text"
              autoComplete="address-line2"
              placeholder="Apt 4B"
              disabled={isFormDisabled}
              error={Boolean(errors.line2)}
              {...register('line2')}
            />
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="City" htmlFor="shipping-city" error={errors.city?.message} required>
              <Input
                id="shipping-city"
                type="text"
                autoComplete="address-level2"
                placeholder="Bengaluru"
                disabled={isFormDisabled}
                error={Boolean(errors.city)}
                {...register('city')}
              />
            </FormField>

            <FormField
              label="State"
              htmlFor="shipping-state"
              error={errors.state?.message}
              required
            >
              <Input
                id="shipping-state"
                type="text"
                autoComplete="address-level1"
                placeholder="Karnataka"
                disabled={isFormDisabled}
                error={Boolean(errors.state)}
                {...register('state')}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Postal code"
              htmlFor="shipping-postal-code"
              error={errors.postalCode?.message}
              required
            >
              <Input
                id="shipping-postal-code"
                type="text"
                autoComplete="postal-code"
                placeholder="560001"
                disabled={isFormDisabled}
                error={Boolean(errors.postalCode)}
                {...register('postalCode')}
              />
            </FormField>

            <FormField
              label="Country"
              htmlFor="shipping-country"
              error={errors.country?.message}
              required
            >
              <Input
                id="shipping-country"
                type="text"
                autoComplete="country-name"
                placeholder="India"
                disabled={isFormDisabled}
                error={Boolean(errors.country)}
                {...register('country')}
              />
            </FormField>
          </div>

          <FormField label="Phone" htmlFor="shipping-phone" error={errors.phone?.message} required>
            <Input
              id="shipping-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              disabled={isFormDisabled}
              error={Boolean(errors.phone)}
              {...register('phone')}
            />
          </FormField>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isFormDisabled}
              className="w-full"
            >
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
