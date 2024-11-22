import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../app/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import '@fontsource-variable/dm-sans';
import '../styles/index.css'
import Header from "@/components/Header";
import HashLoader from "react-spinners/HashLoader";
import Head from "next/head";
import Link from 'next/link';

function Dashboard() {

    const [ user, setUser ] = useState(null);
    const [ company, setCompany ] = useState(null);
    const [ projects, setProjects ] = useState([]);
    const [ ticketStats, setTicketStats ] = useState({
        active: 0,
        inProgress: 0,
        completed: 0,
    })

    const router = useRouter();

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/");
            } else {
                setUser(currentUser);

                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const companyDoc = await getDoc(doc(db, "companies", userData.companyId))
                    if (companyDoc.exists()) {
                        setCompany(companyDoc.data());
                    }

                    await loadProjects(userData.companyId)
                }
            }
        });

        return () => unSubscribe();
    }, [router]);

    const loadProjects = async (companyId) => {
        const projectsQuery = query(collection(db, "projects"), where("companyId", "==", companyId));
        const projectDocs = await getDocs(projectsQuery);
        const projectsData = [];
        
        for (const projectDoc of projectDocs.docs) {
            const project = { id: projectDoc.id, ...projectDoc.data() };

            const userStoriesQuery = query(collection(db, "userStories"), where("projectId", "==", project.id));

            const userStoriesDocs = await getDocs(userStoriesQuery);

            let tickets = [];

            for (const storyDoc of userStoriesDocs.docs) {
                const storyId = storyDoc.id;

                const ticketsQuery = query(collection(db, "tickets"), where("userStoryId", "==", storyId));

                const ticketDocs = await getDocs(ticketsQuery);

                tickets = [...tickets, ...ticketDocs.docs.map((doc) => doc.data())];
            }

            const active = tickets.filter((ticket) => ticket.status === "Activo").length;
            const inProgress = tickets.filter((ticket) => ticket.status === "En proceso").length;
            const completed = tickets.filter((ticket) => ticket.status === "Finalizado").length;

            projectsData.push({
                ...project,
                ticketsCount: tickets.length,
                ticketStats: { active, inProgress, completed },
            })
        };

        setProjects(projectsData);

        const totalActive = projectsData.reduce((sum, p) => sum + p.ticketStats.active, 0);
        const totalInProgress = projectsData.reduce((sum, p) => sum + p.ticketStats.inProgress, 0);
        const totalCompleted = projectsData.reduce((sum, p) => sum + p.ticketStats.completed, 0);

        setTicketStats({ active: totalActive, inProgress: totalInProgress, completed: totalCompleted })
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/");
        } catch (err) {
            console.error("Error al cerrar sesión: ", err.message)
        }
    }

    if (!user || !company) {
        return <HashLoader color="#33b6ff" className="absolute top-[50vh] -right-[50vw]" />
    }

    return (
        
        <div className="bg-[#EEEEEE] h-[100%]">
            <Head>
                <title>Fuse Project</title>
                <link rel="icon" href="/icon.png" />
            </Head>
            <Header />
            
            <div className="mt-[20px] px-[130px] py-[50px] flex flex-col gap-8">
                
                <h2 className="text-3xl text-[#5A5A5A]">Bienvenido, <strong className="text-[#2490FF]">{user.displayName}</strong></h2>

                <section className="bg-[#F4D30A] px-12 py-12 rounded-[55px] flex justify-between">
                    <div>
                        <h3 className="text-white text-6xl font-black">{company.name}</h3>
                        <p><strong>NIT: </strong>{company.nit}</p>
                        <p><strong>Correo: </strong>{company.email}</p>
                        <p><strong>Teléfono: </strong>{company.phone}</p>
                        <p><strong>Dirección: </strong>{company.address}</p>
                    </div>
                    <div className="bg-white px-10 py-10 rounded-[24px]">
                        <h3 className="text-xl font-bold text-[#6A6A6A]">Indicadores de progreso</h3>
                        <ul className="flex flex-col gap-2">
                            <li className="flex justify-between items-center">  
                                <p className="text-[#9B9B9B]">Tickets activos:</p>
                                <strong className="bg-[#28C06D] text-white px-4 py-2 rounded-full">{ticketStats.active}</strong>
                            </li>
                            <li className="flex justify-between">
                                <p className="text-[#9B9B9B]">Tickets en proceso:</p>
                                <strong className="bg-[#F4D30A] text-white px-4 py-2 rounded-full">{ticketStats.inProgress}</strong>
                            </li>
                            <li className="flex justify-between">
                                <p className="text-[#9B9B9B]">Tickets finalizados:</p>
                                <strong className="bg-[#F45555] text-white px-4 py-2 rounded-full">{ticketStats.completed}</strong>
                            </li>
                        </ul>
                    </div>
                </section>
                
                <section className="flex flex-col gap-6">
                    <h3 className="text-3xl text-[#5A5A5A]">Proyectos</h3>
                    {projects.length === 0 ? (
                        <p>No hay proyectos disponibles.</p>
                    ) : (
                        <nav className="grid grid-cols-2 gap-6">
                            {projects.map((project) => (
                                <Link onClick={() => router.push(`/projects/${project.id}`)} className="bg-white rounded-[14px] px-8 py-8 flex flex-col gap-4 cursor-pointer hover:scale-105 transition-all" key={project.id}>
                                    <h4 className="text-xl font-bold">{project.name}</h4>
                                    <p>{project.description}</p>
                                    <p><strong>Tickets: </strong>{project.ticketsCount}</p>
                                </Link>
                            ))}
                        </nav>
                    )} 
                </section>
            </div>
        </div>
    )
}

export default Dashboard;