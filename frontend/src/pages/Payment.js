import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

export default function Payment() {
  const { bookingId } = useParams();

  useEffect(() => {
  async function initiatePayment() {
    try {
      const token = localStorage.getItem("token"); // get JWT

      const res = await axios.post(
        "/payment/create", // axios baseURL is /api
        {
          bookingId,
          returnUrl: `http://localhost:3000/success/${bookingId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // <-- send token
          },
        }
      );

      const { paymentUrl, params } = res.data;

      // create auto-submit form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment: " + (err.response?.data?.msg || err.message));
    }
  }
  initiatePayment();
}, [bookingId]);

  return <div>Redirecting to payment...</div>;
}
