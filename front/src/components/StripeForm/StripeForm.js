import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';

const StripeForm = ({totalPrice}) => {
    // console.log(totalPrice);
    const restaurantSelected = useSelector((state) => state.restaurant.restaurantSelected)
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            // Validate the card element
            const cardElement = elements.getElement(CardElement);
            if (!stripe || !cardElement) {
                throw new Error('Stripe.js has not loaded yet. Make sure your fetch is resolving after the Stripe.js load event.');
            }
            // Create a payment method
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
            
            if (stripeError) {
                throw new Error(stripeError.message);
            }
            // Proceed to transfer funds
            const response = await fetch('http://localhost:8000/client/transfer-funds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: totalPrice,
                    paymentMethodId: paymentMethod.id,
                    connectedAccountId: restaurantSelected.stripeAccountId,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to transfer funds');
            }
            console.log('Payment succeeded:', response);
        } catch (error) {
            console.error(error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <CardElement options={{
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#AAB7C4',
                        },
                    },
                    invalid: {
                        color: '#9E2146',
                    },
                },
            }} />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing...' : 'Pay'}
            </button>
        </div>
    );
};
export default StripeForm;