import { NATIVE_MINT } from "@solana/spl-token";
import cron from "node-cron";
import redisClient from "../services/redis";
const EVERY_1_MIN = "*/5 * * * * *";
const WSOL = NATIVE_MINT.toString();

export const runSOLPriceUpdateSchedule = () => {
  try {
    setInterval(() => {
      updateSolPrice();
    }, 5 * 1000);
    // cron
      // .schedule(EVERY_1_MIN, () => {
        updateSolPrice();
      // })
      // .start();
  } catch (error) {
    console.error(
      `Error running the Schedule Job for fetching the chat data: ${error}`
    );
  }
};

const BIRDEYE_API_KEY = process.env.BIRD_EVEY_API || "";
const REQUEST_HEADER = {
  accept: "application/json",
  "x-chain": "solana",
  "X-API-KEY": BIRDEYE_API_KEY,
};

export const getSolPrice = async (): Promise<number> => {
  const SOL_URL = `https://api.jup.ag/price/v2?ids=${WSOL}`;
  try {
    const BaseURL = SOL_URL;
    const response = await fetch(BaseURL);
    const data = await response.json();
    const price = data.data[WSOL]?.price;
    return price;
  } catch (error) {
    return 0;
  }
};

const updateSolPrice = async () => {
  try {
    const solmint = NATIVE_MINT.toString();
    const key = `${solmint}_price`;
    const price = await getSolPrice();
    await redisClient.set(key, price);
  } catch (e) {
    console.log("🚀 ~ SOL price cron job ~ Failed", e);
  }
};
