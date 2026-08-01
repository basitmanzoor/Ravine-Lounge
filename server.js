import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());
app.use(express.static('.'));

app.post("/api/reservation", async (req, res) => {
  const { name, email, phone, partySize, date, time, _honey } = req.body;
  console.log("Reservation request received:", { name, email, phone, partySize, date, time });

  if (_honey && _honey.toString().trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !phone || !partySize || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sendResult = await resend.emails.send({
      from: process.env.FROM_EMAIL || "ravinelounge@gmail.com",
      to: process.env.TO_EMAIL || "ravinelounge@gmail.com",
      subject: `New reservation request from ${name}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#3b2414;">
          <h1>New Reservation Request</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Party Size:</strong> ${partySize}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
        </div>
      `,
    });
    console.log("Resend send result:", sendResult);
    console.log("Resend email sent successfully for", email);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Email send failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
