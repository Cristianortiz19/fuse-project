import { useRouter } from "next/router";
import { React, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../app/lib/firebaseConfig";

function Register() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            router.push("./dashboard")
        } catch (err) {
            setError("Hubo un problema al crear la cuenta. Inténtalo de nuevo")
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
        }
    }

    return(
        <div>
            <h2>Crear Cuenta</h2>
            {error && <p>{error}</p>}
            <form onSubmit={handleRegister}>
                <span>
                    <label>Nombre</label>
                    <input type="text" value={name} onChange={(e => setName(e.target.value))} required />
                </span>
                <span>
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e => setEmail(e.target.value))} required />
                </span>
                <span>
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e => setPassword(e.target.value))} required />
                </span>
                <button type="submit">Registrarse</button>
            </form>
            <p>
                ¿Ya tienes una cuenta? 
                <a href="/">Inicia Sesión</a>
            </p>
        </div>
    )
}

export default Register;