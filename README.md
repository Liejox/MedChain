MedChain – Decentralized Healthcare with DID
MedChain is a decentralized healthcare platform that uses Decentralized Identity (DID) to give patients full control over their medical data.
This prototype demonstrates secure patient login using DID, viewing health records, and sharing them with doctors — powered by blockchain for security and transparency.

📌 Features
🔐 Primary Login with DID (Google login as backup)

👤 Patient Dashboard – Medical history, appointments, and reports in one place

🧑‍⚕️ Doctor View – Request and verify patient data instantly

📄 Share Access – Patients can grant/revoke access anytime

📜 Access Logs – Every view of your data is recorded for transparency

📱 Responsive UI – Works on desktop and mobile

🎨 Clean UI/UX – Calming healthcare colors, modern design

🗂 Fake Data for Demo – Sample appointments, lab results, and credentials

💡 Why MedChain?
You Own Your Data – Not hospitals, not the government.

No More Repeated Tests – Your records follow you.

Secure by Design – Blockchain prevents tampering or unauthorized access.

Global Access – Works across hospitals and countries.

🛠 Tech Stack
Frontend

React.js + TailwindCSS

Responsive, mobile-first design

Backend

Node.js + Express.js

DID authentication with did-jwt and did-resolver

Temporary JSON-based database (for prototype)

Blockchain / DID

DID creation & verification

Example network: Ethereum / ION

🚀 Getting Started
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/YourUsername/MedChain.git
cd MedChain
2. Install Dependencies
bash
Copy
Edit
npm install
3. Start the Backend Server
bash
Copy
Edit
npm run server
4. Start the Frontend
bash
Copy
Edit
npm run dev
5. Open in Browser
Visit: http://localhost:3000

🔑 Demo Login Credentials
Primary Login: DID Authentication

Example DID: did:example:123456789abcdef

Private key is stored locally during login

Backup Login: Google Sign-In

Use any Google account for quick access

📂 Temporary Database Example
File: /data/fake-data.json

json
Copy
Edit
{
  "patients": [
    {
      "id": "did:example:123456789abcdef",
      "name": "John Doe",
      "age": 32,
      "appointments": ["2025-08-20 – General Checkup", "2025-09-10 – Lab Test"],
      "reports": ["Blood Test – Normal", "X-Ray – No Issues"]
    }
  ]
}


⚠️ Disclaimer
This is a prototype for demonstration and educational purposes.
Not intended for production use without proper security, compliance (HIPAA/GDPR), and blockchain network integration.

