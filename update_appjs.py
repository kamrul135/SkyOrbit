import os

with open('frontend/src/App.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

if 'VerifyEmail' not in app_content:
    app_content = app_content.replace("import Register from './pages/Register';", "import Register from './pages/Register';\nimport VerifyEmail from './pages/VerifyEmail';")
    app_content = app_content.replace("<Route path=\"/register\" element={<Register />} />", "<Route path=\"/register\" element={<Register />} />\n            <Route path=\"/verify/:token\" element={<VerifyEmail />} />")

with open('frontend/src/App.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("App.js updated successfully.")
