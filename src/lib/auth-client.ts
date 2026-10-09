/**
 * Client-side authentication helpers for Auth.js.
 * Handles fetching CSRF tokens and submitting sign-in/sign-out requests.
 */

export async function signIn(provider: string, options?: { callbackUrl?: string }) {
  try {
    const res = await fetch("/api/auth/csrf");
    const { csrfToken } = await res.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `/api/auth/signin/${provider}`;

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = options?.callbackUrl || "/dashboard";
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Sign in error:", error);
  }
}

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl = "/dashboard",
  profile?: { name: string; dob: string; address: string; pii: string }
) {
  try {
    const res = await fetch("/api/auth/csrf");
    const { csrfToken } = await res.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/callback/credentials";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const emailInput = document.createElement("input");
    emailInput.type = "hidden";
    emailInput.name = "email";
    emailInput.value = email;
    form.appendChild(emailInput);

    const passInput = document.createElement("input");
    passInput.type = "hidden";
    passInput.name = "password";
    passInput.value = password;
    form.appendChild(passInput);

    if (profile) {
      for (const [key, value] of Object.entries(profile)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }
    }

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = callbackUrl;
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Credentials sign in error:", error);
  }
}

export async function signOut(options?: { callbackUrl?: string }) {
  try {
    const res = await fetch("/api/auth/csrf");
    const { csrfToken } = await res.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/auth/signout";

    const csrfInput = document.createElement("input");
    csrfInput.type = "hidden";
    csrfInput.name = "csrfToken";
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    const callbackInput = document.createElement("input");
    callbackInput.type = "hidden";
    callbackInput.name = "callbackUrl";
    callbackInput.value = options?.callbackUrl || "/";
    form.appendChild(callbackInput);

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}
