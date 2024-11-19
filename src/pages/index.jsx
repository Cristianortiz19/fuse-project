import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../app/lib/firebaseConfig";
import { useRouter } from "next/router";

function Login() {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ error, setError ] = useState("");
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword( auth, email, password );
            router.push("/dashboard")
        } catch (err) {
            setError("Correo o contraseña incorrectos. Intenta de nuevo.")
        }
    }

    return(
        <div>
            <h2>Iniciar sesión</h2>
            {error && <p className="color-red">{error}</p>}
            <form onSubmit={handleLogin}>
                <span>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e => setEmail(e.target.value))} required />
                </span>
                <span>
                    <label>Contraseña:</label>
                    <input type="password" value={password} onChange={(e => setPassword(e.target.value))} required />
                </span>
                <button type="submit">Iniciar Sesión</button>
            </form>
            <p>¿Ya tienes una cuenta? <a href="/register">Regístrate</a></p>
        </div>
    )
}

export default Login;