import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { login, register } = useApp();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("customer"); // 'customer' or 'owner'

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    business_name: "", // owner only
  });

  const [error, setError] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      const res = await register(role, formData);
      if (res.success) {
        navigate(role === 'customer' ? "/customer-dashboard" : "/owner-dashboard");
      } else {
        setError(res.message);
      }
    } else {
      const res = await login(role, formData.username, formData.password);
      if (res.success) {
        navigate(role === 'customer' ? "/customer-dashboard" : "/owner-dashboard");
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-logo">Venue<span>Spot</span></div>
        <p className="tagline">Pakistan's premier venue booking platform</p>
        <hr style={{ borderColor: "var(--color-border)", marginBottom: "1.5rem" }} />

        <div className="d-flex justify-content-center mb-3">
          <div className="btn-group w-100" role="group">
            <input type="radio" className="btn-check" name="role" id="roleCustomer" checked={role === 'customer'} onChange={() => setRole('customer')} />
            <label className="btn btn-outline-primary" htmlFor="roleCustomer">Customer</label>

            <input type="radio" className="btn-check" name="role" id="roleOwner" checked={role === 'owner'} onChange={() => setRole('owner')} />
            <label className="btn btn-outline-primary" htmlFor="roleOwner">Venue Owner</label>
          </div>
        </div>

        <h5 className="mb-3">{isRegister ? 'Create an Account' : 'Sign In'}</h5>
        {error && <div className="alert alert-danger p-2 fs-6">{error}</div>}

        <form onSubmit={handleSubmit} className="text-start">
          {isRegister && (
            <>
              <div className="mb-2">
                <label className="form-label mb-1">Full Name</label>
                <input type="text" name="full_name" className="form-control" required onChange={handleChange} value={formData.full_name} />
              </div>
              <div className="mb-2">
                <label className="form-label mb-1">Email</label>
                <input type="email" name="email" className="form-control" required onChange={handleChange} value={formData.email} />
              </div>
              <div className="mb-2">
                <label className="form-label mb-1">Phone (Optional)</label>
                <input type="text" name="phone" className="form-control" onChange={handleChange} value={formData.phone} />
              </div>
              {role === 'owner' && (
                <div className="mb-2">
                  <label className="form-label mb-1">Business Name (Optional)</label>
                  <input type="text" name="business_name" className="form-control" onChange={handleChange} value={formData.business_name} />
                </div>
              )}
            </>
          )}

          <div className="mb-2">
            <label className="form-label mb-1">Username</label>
            <input type="text" name="username" className="form-control" required onChange={handleChange} value={formData.username} />
          </div>

          <div className="mb-3">
            <label className="form-label mb-1">Password</label>
            <input type="password" name="password" className="form-control" required onChange={handleChange} value={formData.password} />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3" style={{ background: role === 'owner' ? 'var(--color-accent)' : 'var(--color-primary)' }}>
            {isRegister ? 'Register' : 'Login'}
          </button>

          <p className="text-center" style={{ fontSize: "var(--text-sm)" }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setIsRegister(!isRegister); setError(""); }}>
              {isRegister ? 'Login here' : 'Register here'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
