import { useRouter } from "next/router";
import { React, useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../app/lib/firebaseConfig";
import { db } from "../app/lib/firebaseConfig";
import { collection, doc, getDocs, setDoc } from "firebase/firestore"

function Register() {

    const [ email, setEmail ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ name, setName ] = useState("");
    const [ companyId, setCompanyId ] = useState("");
    const [ companies, setCompanies ] = useState([]);
    const [ error, setError ] = useState("");
    const router = useRouter();

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesCollection = collection(db, "companies");
            const companySnapshot = await getDocs(companiesCollection);
            const companyList = companySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            setCompanies(companyList)
        };
        fetchCompanies();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!companyId) {
            setError("Por favor selecciona una compañía");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            console.log("Usuario creado: ", userCredential)
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            console.log("Perfil actualizado")

            const userData = {
                uid: user.uid,
                name,
                email,
                companyId,
            };
            await setDoc (doc(db, "users", user.uid), userData)
            console.log("Usuario registrado y subido a Firestore")

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
                <span>
                    <label>Selecciona tu Compañía</label>
                    <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        {companies.map(company => (
                            <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                    </select>
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