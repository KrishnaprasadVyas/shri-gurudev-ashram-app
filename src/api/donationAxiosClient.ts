import axios from "axios";
import { getDonationToken } from "../services/auth";
import { getBaseUrl } from "../utils/config";

const donationApi = axios.create({
  baseURL: getBaseUrl(process.env.EXPO_PUBLIC_DONATION_API_BASE_URL),
  timeout: 10000,
});

donationApi.interceptors.request.use(async (config) => {
  const token = await getDonationToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

donationApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 404) {
      return Promise.resolve({
        data: null,
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: error.config,
      });
    }
    return Promise.reject(error);
  }
);

export default donationApi;
