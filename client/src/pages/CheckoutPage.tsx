import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../components/layout';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  Skeleton,
} from '../components/ui';
import { useCartValidation } from '../features/cart/api';
import { useCartStore } from '../features/cart/store';
import {
  useAddresses,
  useCreateAddress,
  useCreateOrder,
  useSetDefaultAddress,
} from '../features/checkout/api';
import { AddressForm, type AddressSubmitMeta } from '../features/checkout/components/AddressForm';
import { OrderSummary } from '../features/checkout/components/OrderSummary';
import type { SavedAddress, ShippingAddress } from '../features/checkout/types';
import { ApiError } from '../lib/apiClient';

function toShippingAddress(saved: SavedAddress): ShippingAddress {
  return {
    fullName: saved.fullName,
    line1: saved.line1,
    ...(saved.line2 ? { line2: saved.line2 } : {}),
    city: saved.city,
    state: saved.state,
    postalCode: saved.postalCode,
    country: saved.country,
    phone: saved.phone,
  };
}

/**
 * Protected checkout page (`/checkout`).
 * Validates the persisted cart against the server, lets users pick a saved/default
 * address or add a new one, creates a PENDING order via `POST /orders`, and redirects.
 */
export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const validationQuery = useCartValidation(items);
  const addressesQuery = useAddresses();
  const createAddressMutation = useCreateAddress();
  const setDefaultAddressMutation = useSetDefaultAddress();
  const createOrderMutation = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNewAddress, setAddingNewAddress] = useState(false);

  if (items.length === 0) {
    return (
      <Container className="py-12">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <EmptyState
          title="Your cart is empty"
          description="Add some products to your cart before checking out."
          action={
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Browse products
            </Link>
          }
        />
      </Container>
    );
  }

  if (validationQuery.isLoading) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card padding="lg" className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-11 w-full" />
            </Card>
          </div>
          <div>
            <Card padding="lg" className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-full" />
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  if (validationQuery.isError) {
    return (
      <Container className="py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <Alert
          variant="danger"
          title="Could not validate your cart"
          onRetry={() => validationQuery.refetch()}
        >
          Unable to verify current prices and stock before checkout. Please try again.
        </Alert>
      </Container>
    );
  }

  const data = validationQuery.data;
  if (!data) {
    return null;
  }

  const savedAddresses = addressesQuery.data ?? [];
  const defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
  const effectiveSelectedId =
    savedAddresses.find((a) => a.id === selectedAddressId)?.id ?? defaultAddress?.id ?? null;
  const selectedAddress = savedAddresses.find((a) => a.id === effectiveSelectedId);
  const showSavedSelector = savedAddresses.length > 0 && !addingNewAddress;

  const hasBlockingIssues = data.issues.length > 0;
  const isBusy = createOrderMutation.isPending || createAddressMutation.isPending;

  const orderError = createOrderMutation.error ?? createAddressMutation.error;
  const isConflictError = orderError instanceof ApiError && orderError.status === 409;
  const orderErrorMessage =
    orderError instanceof ApiError
      ? orderError.message
      : orderError instanceof Error
        ? orderError.message
        : 'Unable to create your order. Please try again.';

  async function handleNewAddressSubmit(shippingAddress: ShippingAddress, meta: AddressSubmitMeta) {
    if (hasBlockingIssues || validationQuery.isLoading) {
      return;
    }

    await createAddressMutation.mutateAsync({
      ...shippingAddress,
      ...(meta.label ? { label: meta.label } : {}),
      isDefault: meta.isDefault,
    });

    createOrderMutation.mutate(
      { items, shippingAddress },
      {
        onSuccess: ({ checkoutUrl }) => {
          window.location.assign(checkoutUrl);
        },
      },
    );
  }

  function handleSavedAddressPay() {
    if (!selectedAddress || hasBlockingIssues || validationQuery.isLoading) {
      return;
    }

    createOrderMutation.mutate(
      { items, shippingAddress: toShippingAddress(selectedAddress) },
      {
        onSuccess: ({ checkoutUrl }) => {
          window.location.assign(checkoutUrl);
        },
      },
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text">Checkout</h1>
        <Link to="/cart" className="text-sm font-medium text-primary hover:underline">
          ← Back to cart
        </Link>
      </div>

      {hasBlockingIssues && (
        <div className="mb-6">
          <Alert variant="warning" title="Cart needs attention before checkout">
            Some items in your cart are unavailable or exceed current stock.{' '}
            <Link to="/cart" className="font-semibold underline">
              Review your cart
            </Link>{' '}
            to resolve these issues first.
          </Alert>
        </div>
      )}

      {orderError && (
        <div className="mb-6">
          <Alert variant="danger" title={isConflictError ? 'Stock changed' : 'Checkout failed'}>
            {orderErrorMessage}{' '}
            {isConflictError && (
              <Link to="/cart" className="font-semibold underline">
                Return to cart
              </Link>
            )}
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {showSavedSelector ? (
            <Card padding="lg">
              <CardHeader className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-text">Shipping Address</h2>
                  <p className="text-sm text-muted">
                    Select a saved address or add a new delivery address.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddingNewAddress(true)}
                >
                  + Add new address
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3" role="radiogroup" aria-label="Saved shipping addresses">
                  {savedAddresses.map((addr) => {
                    const isSelected = addr.id === effectiveSelectedId;
                    return (
                      <div
                        key={addr.id}
                        className={`rounded-md border p-4 transition-colors ${
                          isSelected
                            ? 'border-primary bg-surface'
                            : 'border-border bg-bg hover:bg-surface-hover'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex flex-1 cursor-pointer items-start gap-3">
                            <input
                              type="radio"
                              name="savedAddress"
                              value={addr.id}
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 h-4 w-4 accent-primary"
                            />
                            <div className="space-y-1 text-sm">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-text">{addr.fullName}</span>
                                {addr.label && (
                                  <Badge variant="neutral" size="sm">
                                    {addr.label}
                                  </Badge>
                                )}
                                {addr.isDefault && (
                                  <Badge variant="primary" size="sm">
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted">
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state}{' '}
                                {addr.postalCode}, {addr.country}
                              </p>
                              <p className="text-muted">Phone: {addr.phone}</p>
                            </div>
                          </label>

                          {!addr.isDefault && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={setDefaultAddressMutation.isPending}
                              onClick={() => setDefaultAddressMutation.mutate(addr.id)}
                            >
                              Set as default
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isBusy}
                  disabled={hasBlockingIssues || !selectedAddress || isBusy}
                  onClick={handleSavedAddressPay}
                >
                  Deliver to this address &amp; Pay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <AddressForm
              onSubmit={handleNewAddressSubmit}
              isSubmitting={isBusy}
              disabled={hasBlockingIssues}
              onCancel={savedAddresses.length > 0 ? () => setAddingNewAddress(false) : undefined}
            />
          )}
        </div>

        <div>
          <OrderSummary
            items={data.items}
            subtotalCents={data.subtotalCents}
            shippingCents={data.shippingCents}
            totalCents={data.totalCents}
            currency={data.currency}
          />
        </div>
      </div>
    </Container>
  );
}
