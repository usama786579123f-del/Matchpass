import { PayPalButtons } from '@paypal/react-paypal-js';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PayPalCheckoutButton = ({ orderId, paypalOrderId, onSuccess }) => {
  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'pill', label: 'paypal' }}
      createOrder={() => Promise.resolve(paypalOrderId)}
      onApprove={async () => {
        try {
          await api.post('/orders/' + orderId + '/capture-paypal', { paypalOrderId });
          toast.success('Payment successful!');
          onSuccess();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Could not complete PayPal payment.');
        }
      }}
      onError={() => {
        toast.error('PayPal payment failed. Please try again.');
      }}
    />
  );
};

export default PayPalCheckoutButton;