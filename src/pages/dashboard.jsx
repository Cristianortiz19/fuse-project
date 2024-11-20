import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../app/lib/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

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
        return <p>Cargando...</p>
    }

    return (
        <div>
            <header className="flex">
                <h1>Dashboard</h1>
                <button onClick={handleLogout} className="pd-10px">Cerrar Sesión</button>
            </header>
            <h2>Bienvenido, {user.displayName}</h2>

            <section>
                <h3>Acerca de {company.name}</h3>
                <p><strong>NIT: </strong>{company.nit}</p>
                <p><strong>Correo: </strong>{company.email}</p>
                <p><strong>Teléfono: </strong>{company.phone}</p>
                <p><strong>Dirección: </strong>{company.address}</p>
            </section>

            <section>
                <h3>Indicadores de Progreso</h3>
                <p><strong>Tickets Activos: </strong>{ticketStats.active}</p>
                <p><strong>Tickets En Proceso: </strong>{ticketStats.inProgress}</p>
                <p><strong>Tickets Finalizados: </strong>{ticketStats.completed}</p>
            </section>

            <section>
                <h3>Proyectos</h3>
                {projects.length === 0 ? (
                    <p>No hay proyectos disponibles.</p>
                ) : (
                    <ul>
                        {projects.map((project) => (
                            <li key={project.id}>
                                <h4>{project.name}</h4>
                                <p>{project.description}</p>
                                <p><strong>Tickets: </strong>{project.ticketsCount}</p>
                            </li>
                        ))}
                    </ul>
                )} 
            </section>
        </div>
    )
}

export default Dashboard;