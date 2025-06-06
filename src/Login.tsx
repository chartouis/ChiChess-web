import axios from "axios";
import { useState } from "react";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  // States for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fing, setFing] = useState("gnida");
  const [ccode, setCode] = useState("");
  const [name, setName] = useState("");


  const handleSwitch = () => setIsSignUp(!isSignUp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (isSignUp) {
      axios
        .post(
          "http://localhost:8080/register",
          {
            email: email,
            password: password,
            username: name,
            fingerprint: fing,
          },
          { withCredentials: true }
        )
        .then((res) => {
          console.log(res.data);
        });
    }
    if (!isSignUp) {
      axios
        .post(
          "http://localhost:8080/login",
          {
            password: password,
            username: name,
            fingerprint: fing,
          },
          { withCredentials: true }
        )
        .then((res) => {
          console.log(res.data);
        });
    }

    // Handle form submission (send data to backend, etc.)
    console.log("Email:", email);
    console.log("Password:", password);
  };

  const handleCode = (e: React.FormEvent) => {
    e.preventDefault();

    axios.post(
      "http://localhost:8080/code",
      { code: ccode ,fingerprint: fing},
      { withCredentials: true }
    );
  };


  const test = () => {
    axios.get("http://localhost:8080/api/test", {
      withCredentials: true,
    });
  };

  const refresh = () => {
    axios.get("http://localhost:8080/refresh", { withCredentials: true });
  };

  const handleReset = (e: React.FormEvent) =>{
    e.preventDefault()
    axios.post("http://localhost:8080/reset",{email,fingerprint: fing})
  }

  const handleNewPassword = (e: React.FormEvent) =>{
    e.preventDefault();
    axios.post('http://localhost:8080/newpassword', {password,fingerprint: fing,code: ccode})
  }
  
  return (
<div className="p-4 space-y-6">
  <div className="space-x-2">
    <button onClick={test} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">test</button>
    <button onClick={refresh} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">refresh</button>
  </div>

  <form onSubmit={handleReset} className="space-y-2 border p-4 rounded shadow">
    <div className="flex flex-col">
      <label className="mb-1">Reset Password</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
    </div>
    <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">reset</button>
  </form>

  <form onSubmit={handleNewPassword} className="space-y-2 border p-4 rounded shadow">
    <div className="flex flex-col">
      <label className="mb-1">New Password</label>
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
    </div>
    <button type="submit" className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">set</button>
  </form>

  <form onSubmit={handleCode} className="space-y-2 border p-4 rounded shadow">
    <div className="flex flex-col">
      <label className="mb-1">Code</label>
      <input
        type="text"
        value={ccode}
        onChange={(e) => setCode(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
    </div>
    <button type="submit" className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">send code</button>
  </form>

  <div className="border p-4 rounded shadow space-y-4">
    <h2 className="text-xl font-semibold">{isSignUp ? "Sign Up" : "Sign In"}</h2>
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col">
        <label className="mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Username</label>
        <input
          type="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
      </div>
      {isSignUp && (
        <div className="flex flex-col">
          <label className="mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
        </div>
      )}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {isSignUp ? "Sign Up" : "Sign In"}
      </button>
    </form>
    <p className="text-sm">
      {isSignUp ? "Already have an account?" : "Don't have an account?"}
      <button onClick={handleSwitch} className="ml-2 text-blue-600 hover:underline">
        {isSignUp ? "Sign In" : "Sign Up"}
      </button>
    </p>
  </div>
</div>

  );
}
