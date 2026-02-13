import { useRef, useState } from "react";
import { useUser } from "../contexts/UserProvider"; // Verify this path!
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, login } = useUser();
  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
    isLoginOk: false,
  });

  const emailRef = useRef();
  const passRef = useRef();

  async function onLogin() {
    // 1. Set loading state
    setControlState((prev) => ({ ...prev, isLoggingIn: true }));

    // 2. Get values
    const email = emailRef.current.value;
    const pass = passRef.current.value;

    // 3. Call Login Function from Context
    const result = await login(email, pass);

    // 4. Update state based on result
    setControlState({
      isLoggingIn: false,
      isLoginError: !result,
      isLoginOk: result,
    });
  }

  // If already logged in, redirect to Profile
  if (user && user.isLoggedIn) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>
      <div
        style={{ maxWidth: "400px", border: "1px solid #ccc", padding: "20px" }}
      >
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input type="text" ref={emailRef} placeholder="Enter email" />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password: </label>
          <input type="password" ref={passRef} placeholder="Enter password" />
        </div>

        <button onClick={onLogin} disabled={controlState.isLoggingIn}>
          {controlState.isLoggingIn ? "Logging in..." : "Login"}
        </button>

        {controlState.isLoginError && (
          <p style={{ color: "red", marginTop: "10px" }}>
            Login Failed: Invalid credentials
          </p>
        )}
      </div>
    </div>
  );
}
