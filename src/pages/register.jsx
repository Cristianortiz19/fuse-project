import { useRouter } from "next/router";
import { React, useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../app/lib/firebaseConfig";
import { db } from "../app/lib/firebaseConfig";
import { collection, doc, getDocs, setDoc } from "firebase/firestore"
import '@fontsource-variable/dm-sans';
import '../styles/index.css'
import Head from "next/head";

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
        <main>
            <Head>
                <title>Fuse Project</title>
                <link rel="icon" href="/icon.png" />
            </Head>
            <div className="flex bg-white flex-col gap-10 justify-center align-center px-36 py-36 rounded-[26px] shadow-2xl" >

                <span className="flex flex-col align-center justify-center">
                    <figure className="flex align-center justify-center"><img src="./fuse-project-logo.webp" alt="" /></figure>
                    <p className="text-xl font-extralight text-[#828282] text-center">Monitorea el avance de tus proyectos en tiempo real</p>
                </span>

                <div className="flex flex-col gap-4">
                    <span>
                        <h2 className="text-[#248FFF] text-xl font-extrabold">Crear Cuenta</h2>
                        <p className="text-[#717171]">¡Unete a nosotros!</p>
                    </span>
                    <form className="flex flex-col gap-4" onSubmit={handleRegister}>
                            
                        <input className="border border-[#C7C7C7] px-4 py-2 rounded-full placeholder:text-[#ABABAB] text-gray" placeholder="Nombre" type="text" value={name} onChange={(e => setName(e.target.value))} required />
                    
                        <input className="border border-[#C7C7C7] px-4 py-2 rounded-full placeholder:text-[#ABABAB]" placeholder="Correo electrónico" type="email" value={email} onChange={(e => setEmail(e.target.value))} required />
                    
                        <input className="border border-[#C7C7C7] px-4 py-2 rounded-full placeholder:text-[#ABABAB]" placeholder="Contraseña" type="password" value={password} onChange={(e => setPassword(e.target.value))} required />
                    
                        <select className="border border-[#C7C7C7] px-4 py-2 rounded-full placeholder:text-[#ABABAB]" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                            <option value="">Selecciona una compañía</option>
                            {companies.map(company => (
                                <option key={company.id} value={company.id}>{company.name}</option>
                            ))}
                        </select>

                        {error && <p>{error}</p>}
                        <button className="bg-[#2490FF] color-white font-bold text-white py-2 rounded-full hover:bg-[#53A8FF]" type="submit">Registrarse</button>
                    </form>
                </div>
                
                
                <p className="text-[#ABABAB] flex justify-center">
                    ¿Ya tienes una cuenta? {" "}
                    <a className="text-[#2490FF] font-bold" href="/"> Inicia Sesión</a>
                </p>
            </div>
        </main>
    )
}

export default Register;