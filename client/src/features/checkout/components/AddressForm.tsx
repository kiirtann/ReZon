import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FormField,
  Input,
  Select,
} from '../../../components/ui';
import { COUNTRY_CODES, shippingAddressSchema, type ShippingAddressFormValues } from '../schemas';
import type { ShippingAddress } from '../types';

export interface AddressSubmitMeta {
  label?: string;
  isDefault: boolean;
}

export interface AddressFormProps {
  onSubmit: (address: ShippingAddress, meta: AddressSubmitMeta) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitLabel?: string;
  showSaveOptions?: boolean;
  onCancel?: () => void;
}

/**
 * Shipping address form for `/checkout`, validated with Zod + react-hook-form.
 * Enforces a separate country code selector and exact 10-digit phone number.
 */
export function AddressForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
  submitLabel = 'Pay with Stripe',
  showSaveOptions = true,
  onCancel,
}: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      label: '',
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      countryCode: '+91',
      phoneNumber: '',
      isDefault: true,
    },
  });

  const isFormDisabled = isSubmitting || disabled;

  const handleFormSubmit = (values: ShippingAddressFormValues) => {
    const cleanedLine2 = values.line2?.trim();
    const cleanedLabel = values.label?.trim();
    onSubmit(
      {
        fullName: values.fullName,
        line1: values.line1,
        ...(cleanedLine2 ? { line2: cleanedLine2 } : {}),
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        phone: `${values.countryCode} ${values.phoneNumber}`,
      },
      {
        ...(cleanedLabel ? { label: cleanedLabel } : {}),
        isDefault: Boolean(values.isDefault),
      },
    );
  };

  return (
    <Card padding="lg">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-text">Shipping Address</h2>
          <p className="text-sm text-muted">Enter where you would like your order delivered.</p>
        </div>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Use saved address
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-4">
          {showSaveOptions && (
            <FormField
              label="Address label"
              htmlFor="shipping-label"
              error={errors.label?.message}
              hint="Optional (e.g. Home, Office)"
            >
              <Input
                id="shipping-label"
                type="text"
                placeholder="Home"
                disabled={isFormDisabled}
                error={Boolean(errors.label)}
                {...register('label')}
              />
            </FormField>
          )}

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              label="Country code"
              htmlFor="shipping-country-code"
              error={errors.countryCode?.message}
              required
            >
              <Select
                id="shipping-country-code"
                disabled={isFormDisabled}
                error={Boolean(errors.countryCode)}
                {...register('countryCode')}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                label="Phone number"
                htmlFor="shipping-phone"
                error={errors.phoneNumber?.message}
                hint="10 digits without spaces or country code"
                required
              >
                <Input
                  id="shipping-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  placeholder="9876543210"
                  disabled={isFormDisabled}
                  error={Boolean(errors.phoneNumber)}
                  {...register('phoneNumber')}
                />
              </FormField>
            </div>
          </div>

          {showSaveOptions && (
            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm text-text">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border accent-primary"
                disabled={isFormDisabled}
                {...register('isDefault')}
              />
              <span>Set as my default address</span>
            </label>
          )}

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
