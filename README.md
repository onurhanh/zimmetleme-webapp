📦 Device Assignment App

The Device Assignment App is a user-friendly React application developed to facilitate equipment tracking within teams and organizations. Devices can be registered through a form with details such as device name, serial number, and assignee, along with mandatory assignment and optional return dates. All records are stored in the browser using localStorage, making it a simple yet effective inventory tool.

🚀 Features

📋 Register devices with name, serial number, and assignee

📅 Select assignment date and optional return date

⛔ Past dates are disabled; dates can be selected up to 6 months in advance

🧠 Records are stored using localStorage (no backend required)

✏️ Edit and delete existing records

💨 Clean UI with modal dialogs and fade-in/blur animations

🛠️ Built With

React

ShadCN UI

Tailwind CSS

date-fns – for date utilities

🔧 Installation

bash
Kopyala
Düzenle
git clone https://github.com/yourusername/device-assignment-app.git
cd device-assignment-app
npm install
npm run dev

🖼️ Screenshots

<img width="1059" alt="Ekran Resmi 2025-04-18 20 54 09" src="https://github.com/user-attachments/assets/744b53a8-34d1-488b-93cf-23cd27b8fe1d" />

📌 Notes

The return date field is optional.

All required fields must be filled before saving a record.

Users are selected via a dropdown menu.

🤝 Contributing

Suggestions, improvements, and pull requests are always welcome. Feel free to contribute!




