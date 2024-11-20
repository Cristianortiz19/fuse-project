import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth, db } from "../app/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
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
            const inProgress = tickets.filter((ticket) => ticket.status === "En Proceso").length;
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

    if (!user || !company) {
        return <p>Cargando...</p>
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <h2>Bienvenido, {user.displayName}</h2>
        </div>
    )
}

export default Dashboard;