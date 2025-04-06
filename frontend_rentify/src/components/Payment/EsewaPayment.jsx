import { useEffect } from "react";
import CryptoJS from "crypto-js";

const EsewaPayment = ({ amount, productCode = "EPAYTEST", onSuccess, onFailure }) => {
  useEffect(() => {
    if (!amount) return;

    const secretKey = "8gBm/:&EnhH.1/q"; // Replace with your actual key
    const transactionUUID = `txn_${Date.now()}`;
    const totalAmount = amount;
    const signedFieldNames = "total_amount,transaction_uuid,product_code";

    const signatureBase = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${productCode}`;

    const signature = CryptoJS.HmacSHA256(signatureBase, secretKey).toString(CryptoJS.enc.Base64);

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const formData = {
      amount,
      tax_amount: 0,
      total_amount: totalAmount,
      transaction_uuid: transactionUUID,
      product_code: productCode,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: "http://localhost:5173/payment/success",
      failure_url: "http://localhost:5173/payment/failure",
      signed_field_names: signedFieldNames,
      signature: signature,
    };

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    return () => {
      document.body.removeChild(form);
    };
  }, [amount, productCode]);

  return null;
};

export default EsewaPayment;
