import  { React, useEffect, useState } from "react";
import Header from "@/components/Header";
import '@fontsource-variable/dm-sans';
import '../../styles/index.css'
import { useRouter } from "next/router";
import { db } from "../../app/lib/firebaseConfig"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import HashLoader from "react-spinners/HashLoader";
import Head from "next/head";

function ProjectDetails() {

    const router = useRouter();
    const { id: projectId } = router.query;

    const [ project, setProject]  = useState(null);
    const [ userStories, setUserStories ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        if (projectId) {
            loadProjectDetails();
        }
    }, [projectId])

    const loadProjectDetails = async () => {
        try {
            const projectDoc = await getDoc(doc(db, "projects", projectId));
            if (projectDoc.exists()) {
                setProject({ id: projectDoc.id, ...projectDoc.data() });

                const userStoriesQuery = query(collection(db, "userStories"), where("projectId", "==", projectDoc.id));

                const userStoriesDocs = await getDocs(userStoriesQuery);

                const stories = userStoriesDocs.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUserStories(stories);
            }
        } catch (error) {
            console.error("Error al cargar los detalles del proyecto:", error)
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <HashLoader color="#33b6ff" className="absolute top-[50vh] -right-[50vw]" />
    }

    if (!project) {
        return <p>Proyecto no encontrado.</p>
    }

    return(
        <div className="bg-[#EEEEEE] h-[100%]">
            <Head>
                <title>Fuse Project</title>
                <link rel="icon" href="/icon.png" />
            </Head>
            <Header></Header>

            <div className="mt-[20px] px-[130px] py-[50px] flex flex-col gap-8">
                <h1 className="text-3xl text-[#5A5A5A]">Detalles del Proyecto</h1>

                <section className="bg-[#2490FF] px-10 py-8 rounded-[16px] text-white flex flex-col gap-4">
                    <h2 className="text-4xl font-bold">{project.name}</h2>
                    <p>{project.description}</p>
                </section>

                <section className="bg-[#28C06D] flex flex-col px-10 py-8 rounded-[16px] gap-4">
                    <h2  className="text-2xl text-white font-bold">Historias de Usuario</h2>
                    {userStories.length === 0 ? (
                    <p>No hay historias de usuario asociadas a este proyecto.</p>
                    ) : (
                    <ul className="grid grid-cols-2 gap-6">
                        {userStories.map((story) => (
                        <li className="bg-white px-10 py-8 rounded-[12px] flex flex-col gap-4" key={story.id} style={{ marginBottom: "10px" }}>
                            <h3 className="text-2xl font-bold text-[#28C06D]">{story.name}</h3>
                            <p><strong>Descripción:</strong> {story.description}</p>
                            <button className="bg-[#28C06D] w-fit rounded text-white hover:scale-105 transition-all"
                            onClick={() => router.push(`/userStories/${story.id}`)}
                            style={{ padding: "5px 10px", marginTop: "10px" }}
                            >
                            Ver Detalles
                            </button>
                        </li>
                        ))}
                    </ul>
                    )}
                </section>

                <button
                    onClick={() => router.push("/dashboard")}
                    style={{ marginTop: "20px", padding: "10px 20px" }}
                >
                    Volver al Dashboard
                </button>
            </div>
            
        </div>
    );
}

export default ProjectDetails;