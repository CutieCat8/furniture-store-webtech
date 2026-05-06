GenAI Prompt (Contract + Diagrams)

"""
You are a full-stack assistant. Implement user registration.
Backend: Express POST /api/register. Expect JSON body { name, email, password }.
Check if email already exists in auth_user.json. If exists, return 409 with
{ status: "fail", message }.
If new, hash password with bcrypt and store user in auth_user.json.
Return 201 { status: "success", message }.

Frontend: register.js should validate password rules before sending:
- at least 8 characters
- at least 1 uppercase
- at least 1 special character (!@#$%^&*)
Show clear error messages and redirect to login on success.
Add brief comments explaining the flow in both route and register.js.
"""