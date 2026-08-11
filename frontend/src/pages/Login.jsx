import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";


// =====================================================
// LOGIN PAGE
// =====================================================

const Login = () => {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();


  const [email, setEmail] =
    useState("admin@erp.com");

  const [password, setPassword] =
    useState("password123");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  // ---------------------------------------------------
  // Submit
  // ---------------------------------------------------

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(
        email,
        password
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );

    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      setError(
        error.response?.data
          ?.message ||
          error.message ||
          "Login failed"
      );

    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>
            Mini ERP CRM
          </h1>

          <p>
            Sign in to continue
          </p>
        </div>


        {error && (
          <div className="login-error">
            {error}
          </div>
        )}


        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="Enter email"
              required
            />

          </div>


          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Enter password"
              required
            />

          </div>


          <button
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
};


export default Login;