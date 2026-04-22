import CryptoJS from "crypto-js";

const noqoodyUrl: string = "https://noqoodypay.com/sdk";
const username: string   = import.meta.env.VITE_NOQOODYPAY_USERNAME as string;
const password: string   = import.meta.env.VITE_NOQOODYPAY_PASSWORD as string;

// ---- Types ----
type TokenResponse = {
  access_token: string;
  expires_in: number;
};

type AccountDetail = {
  UserProjects: {
    ProjectCode: string;
    ClientSecret: string;
  }[];
};

type PaymentData = {
  email: string;
  name: string;
  phone: string;
  description: string;
  amount: number | string;
};

// ---- Get Token ----
const getNoqoodyToken = async (): Promise<string | undefined> => {
  try {
    const match = document.cookie.match(
      new RegExp("(^| )noqoody_token=([^;]+)")
    );

    if (match) {
      return match[2];
    }

    const body = new URLSearchParams({
      grant_type: "password",
      username,
      password,
    });

    const res = await fetch(noqoodyUrl + "/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body.toString(),
    });

    const result: TokenResponse = await res.json();

    if (result.access_token) {
      const date = new Date();
      date.setTime(date.getTime() + result.expires_in * 1000);

      document.cookie = `noqoody_token=${result.access_token}; expires=${date.toUTCString()}; path=/; secure; samesite=strict`;

      return result.access_token;
    }
  } catch (error) {}
};

// ---- Get Account Detail ----
const getAccountDetail = async (): Promise<AccountDetail | undefined> => {
  try {
    const token = await getNoqoodyToken();

    const res = await fetch(
      noqoodyUrl + "/api/Members/GetUserSettings",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result: AccountDetail = await res.json();
    return result;
  } catch (error) {}
};

// ---- Create Payment Link ----
export const createNoqoodyPaymentLink = async (
  data: PaymentData
): Promise<any> => {
  try {
    const token = await getNoqoodyToken();
    const accountDetail = await getAccountDetail();

    if (!accountDetail) throw new Error("Account detail not found");

    const projectCode = accountDetail.UserProjects[0].ProjectCode;
    const clientSecret = accountDetail.UserProjects[0].ClientSecret;
    const amount = Number(data.amount).toFixed(2);
    const reference = "REF_" + Date.now();

    const secureHash = generateSecureHash(
      data.email,
      data.name,
      data.phone,
      data.description,
      projectCode,
      reference,
      amount,
      clientSecret
    );

    const res = await fetch(
      noqoodyUrl + "/api/PaymentLink/GenerateLinks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ProjectCode: projectCode,
          Description: data.description,
          Amount: amount,
          CustomerEmail: data.email,
          CustomerMobile: data.phone,
          CustomerName: data.name,
          SecureHash: secureHash,
          Reference: reference,
        }),
      }
    );

    return res.json();
  } catch (error) {}
};

// ---- Generate Secure Hash ----
const generateSecureHash = (
  CustomerEmail: string,
  CustomerName: string,
  CustomerMobile: string,
  Description: string,
  ProjectCode: string,
  Reference: string,
  Amount: string,
  SecretKey: string
): string => {
  const dataString =
    CustomerEmail +
    CustomerName +
    CustomerMobile +
    Description +
    ProjectCode +
    Reference +
    Amount;

  const hash = CryptoJS.HmacSHA256(dataString, SecretKey);
  return CryptoJS.enc.Base64.stringify(hash);
};