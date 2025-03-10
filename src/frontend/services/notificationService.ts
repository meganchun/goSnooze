import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } from "@env";
import { useAuth } from "../context/AuthContext";

const accountSid = TWILIO_ACCOUNT_SID;
const authToken = TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const { userPhone } = useAuth();

// Create and send SMS
async function createMessage(station: String) {
  if (userPhone) {
    const message = await client.messages.create({
      body: `It looks like you're approaching ${station}, reply with OKAY so we know that you're awake!`,
      from: TWILIO_NUMBER,
      to: userPhone,
    });
  }
}

// Send outgoing call
async function createCall() {
  if (userPhone) {
    const call = await client.calls.create({
      from: TWILIO_NUMBER,
      to: userPhone,
      url: "TODO: ADD VOICE MESSAGE",
    });
  }
}

createCall();
