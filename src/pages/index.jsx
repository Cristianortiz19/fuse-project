import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../app/lib/firebaseConfig";
import { useRouter } from "next/router";
import '@fontsource-variable/dm-sans';
import '../styles/index.css'
import Head from "next/head";

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
        <main>
            <Head>
                <title>Fuse Project</title>
                <link rel="icon" href="/icon.png" />
            </Head>
            <div className="flex bg-white flex-col gap-10 justify-center align-center px-36 py-36 rounded-[26px] shadow-2xl">
                <span className="flex flex-col align-center justify-center">
                    <figure className="flex align-center justify-center"><img src="./fuse-project-logo.webp" alt="" /></figure>
                    <p className="text-xl font-extralight text-[#828282] text-center">Monitorea el avance de tus proyectos en tiempo real</p>
                </span>

                <div className="flex flex-col gap-4">
                    <span>
                        <h2 className="text-[#248FFF] text-xl font-extrabold">Iniciar sesión</h2>
                        <p className="text-[#717171]">¡Bienvenido de vuelta!</p>
                    </span>
                    
                    <form className="flex flex-col gap-4" onSubmit={handleLogin}>

                        <input className="border border-[#C7C7C7] px-4 py-2 rounded-full text-[#ABABAB]" placeholder="Correo electrónico" type="email" value={email} onChange={(e => setEmail(e.target.value))} required />
                        
                        <input className="border border-[#C7C7C7] px-4 py-2 rounded-full text-[#ABABAB]" placeholder="Contraseña" type="password" value={password} onChange={(e => setPassword(e.target.value))} required />
                        
                        {error && <p className="text-red">{error}</p>}
                        <button className="bg-[#2490FF] color-white font-bold text-white py-2 rounded-full hover:bg-[#53A8FF]" type="submit">Ingresar</button>
                    </form>
                    <p className="text-[#ABABAB] flex justify-center">¿Ya tienes una cuenta? <a className="text-[#2490FF] font-bold" href="/register">Regístrate</a></p>
                </div>
            </div>
        </main>
    )
}

export default Login;