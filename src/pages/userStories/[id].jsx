import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "@/app/lib/firebaseConfig";
import { doc, getDoc, addDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import HashLoader from "react-spinners/HashLoader";
import Header from "@/components/Header";
import '@fontsource-variable/dm-sans';
import '../../styles/index.css'
import { serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

function UserStoryDetails() {

    const router = useRouter();
    const { id: storyId } = router.query;

    const [ userStory, setUserStory ] = useState(null);
    const [ tickets, setTickets ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ userId, setUserId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false);
    const [ newTicket, setNewTicket ] = useState({
        name: "",
        description: "",
        status: "Activo",
        comments: "",
        userId: "",
    })

    useEffect(() => {
        loadUserStoryDetails();
    }, [storyId])

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
        } else {
            setUserId(null);
        }
        });
    
        return () => unsubscribe();
    }, []);

    const loadUserStoryDetails = async () => {

        try {
            const storyDoc = await getDoc(doc(db, "userStories", storyId));
            if (storyDoc.exists()) {
            setUserStory({ id: storyDoc.id, ...storyDoc.data() });

            const ticketsQuery = query(
                collection(db, "tickets"),
                where("userStoryId", "==", storyDoc.id)
            );

            const ticketsDocs = await getDocs(ticketsQuery);

            const ticketsList = ticketsDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            setTickets(ticketsList);
            }
        } catch (error) {
            console.error("Error al cargar la historia de usuario:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    }

    const handleModalClose = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
    }

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        try {
            const ticketRef = doc(db, "tickets", selectedTicket.id);
            await updateDoc(ticketRef, {
                description: selectedTicket.description,
                status: selectedTicket.status,
                comments: selectedTicket.comments || "",
            });

            
            setIsModalOpen(false);
            loadUserStoryDetails();
        } catch (error) {
            console.error("Error al actualizar el ticket", error)
        }
    }

    if (loading) {
        return <HashLoader color="#33b6ff" className="absolute top-[50vh] -right-[50vw]" />
    }

    if (!userStory) {
        return <p>Historia de usuario no encontrada.</p>
    }

    const handleCreateTicket = async (e) => {
        e.preventDefault();

        try {
            const ticketsCollection = collection(db, "tickets");
            await addDoc(ticketsCollection, {
            ...newTicket,
            userStoryId: userStory.id,
            createdAt: serverTimestamp(),
            userId: userId,
            });

            alert("Ticket creado exitosamente.");
            setIsCreateModalOpen(false);
            setNewTicket({
                name: "",
                description: "",
                status: "Activo",
                comments: "",
            });

            loadUserStoryDetails();
        } catch (error) {
            console.error("Error al crear el ticket:", error);
        }
    }

    const cancelTicket = async (ticketId) => {
        try {
            const ticketRef = doc(db, "tickets", ticketId);
            await updateDoc (ticketRef, {
                status: "Cancelado"
            });
            loadUserStoryDetails();

        } catch (err) {
            console.error("Error al cancelar el ticket:", err);
            alert("Hubo un problema al intentar cancelar el ticket. Por favor, inténtalo nuevamente.");
        }
    }

    return(
        <div className="bg-[#EEEEEE] h-[100%]">
            <Head>
                <title>Fuse Project</title>
                <link rel="icon" href="/icon.png" />
            </Head>
            <Header></Header>
            <div className="mt-[20px] px-[130px] py-[50px] flex flex-col gap-8">
                <h1 className="text-3xl text-[#5A5A5A]">Detalles de la historia de usuario</h1>
                <section className="bg-[#2490FF] px-10 py-8 rounded-[16px] text-white flex flex-col gap-4">
                    <h2 className="text-4xl font-bold">{userStory.name}</h2>
                    <p>{userStory.description}</p>
                </section>

                <section className="bg-[#28C06D] flex flex-col px-10 py-8 rounded-[16px] gap-4">
                    <span className="flex justify-between">
                        <h2 className="text-2xl text-white font-bold">Tickets Asociados</h2>
                        <button onClick={() => setIsCreateModalOpen(true)} className="bg-white text-[#28C06D] hover:scale-105 transition-all px-4 py-2 font-bold rounded-full stroke-none">Crear nuevo ticket</button>
                    </span>
                    
                    {tickets.length === 0 ? (
                    <p>No hay tickets asociados a esta historia de usuario.</p>
                    ) : (
                    <table className="bg-white rounded table-fixed caption-top">
                        <thead className="py-8">
                        <tr className="py-8">
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Comentarios</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody className="text-[14px] text-center">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                            <td>{ticket.name}</td>
                            <td className="w-[300px]">{ticket.description}</td>
                            <td>{ticket.status}</td>
                            <td>{ticket.comments || "Sin comentarios"}</td>
                            <td className="flex gap-4">
                                <button
                                className="bg-[#1779F7] text-white font-bold px-4 py-2 rounded-full hover:scale-105 transition-all"
                                onClick={() => handleEditClick(ticket)}>
                                Editar
                                </button>
                                {ticket.status === "Activo" && (
                                <button className="bg-[#FF3F3F] text-white font-bold px-4 py-2 rounded-full hover:scale-105 transition-all" onClick={() => cancelTicket(ticket.id)}>Cancelar</button>
                                )}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    )}
                </section>

                {isModalOpen && (
                    <div 
                    style={{
                        position: "fixed",
                        top: "0",
                        left: "0",
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    >
                    <div className="flex flex-col gap-4 w-[600px]"
                        style={{
                        backgroundColor: "#fff",
                        padding: "40px",
                        borderRadius: "10px",
                        }}
                    >
                        <h2 className="text-[#2490FF] text-xl font-bold">Editar Ticket</h2>
                        <form className="flex flex-col gap-3" onSubmit={handleUpdateTicket}>
                            <input className="border px-4 py-2 rounded-full"
                                placeholder="Nombre del ticket"
                                type="text"
                                value={selectedTicket.name}
                                onChange={(e) =>
                                    setSelectedTicket({
                                    ...selectedTicket,
                                    description: e.target.value,
                                    })
                                }
                                required
                            />
                            <input className="border px-4 py-2 rounded-full"
                                type="text"
                                placeholder="Descripción"
                                value={selectedTicket.description}
                                onChange={(e) =>
                                    setSelectedTicket({
                                    ...selectedTicket,
                                    description: e.target.value,
                                    })
                                }
                                required
                            />
                            <select className="border px-4 py-2 rounded-full"
                                value={selectedTicket.status}
                                onChange={(e) =>
                                    setSelectedTicket({
                                    ...selectedTicket,
                                    status: e.target.value,
                                    })
                                }
                                required
                            >
                                <option value="Activo">Activo</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                            <textarea className="border px-4 py-2 rounded"
                                placeholder="Comentario"
                                value={selectedTicket.comments || ""}
                                onChange={(e) =>
                                    setSelectedTicket({
                                    ...selectedTicket,
                                    comments: e.target.value,
                                    })
                                }
                            />
                            <span className="flex justify-center">
                                <button type="submit" className="bg-[#2490FF] text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition-all">Guardar</button>
                                <button type="button" className="bg-white border border-[#2490FF] text-[#2490FF] px-4 py-2 rounded-full font-bold hover:scale-105 transition-all" onClick={handleModalClose} style={{ marginLeft: "10px" }}>
                                    Cancelar
                                </button>
                            </span>
                            
                        </form>
                    </div>
                    </div>
                )}

                {isCreateModalOpen && (
                <div>
                    <div className="flex flex-col gap-4 w-[600px]"
                    style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    padding: "40px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    borderRadius: "10px",
                    }}
                    >
                        <h2 className="text-[#2490FF] text-xl font-bold">Crear Nuevo Ticket</h2>
                        <form className="flex flex-col gap-3" onSubmit={handleCreateTicket}>
                            <input className="border px-4 py-2 rounded-full"
                            placeholder="Nombre del ticket"
                                type="text"
                                value={newTicket.name}
                                onChange={(e) =>
                                    setNewTicket({ ...newTicket, name: e.target.value })
                                }
                                required
                                />

                            <input className="border px-4 py-2 rounded-full"
                            placeholder="Descripción"
                            type="text"
                            value={newTicket.description}
                            onChange={(e) =>
                                setNewTicket({ ...newTicket, description: e.target.value })
                            }
                            required
                            />
                            <select className="border px-4 py-2 rounded-full"
                            value={newTicket.status}
                            onChange={(e) =>
                                setNewTicket({ ...newTicket, status: e.target.value })
                            }
                            >
                                <option value="Activo">Activo</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>

                            <textarea className="border px-4 py-2 rounded"
                            placeholder="Comentario"
                            value={newTicket.comments}
                            onChange={(e) =>
                                setNewTicket({ ...newTicket, comments: e.target.value })
                            }
                            />
                            <span className="flex justify-center">
                                <button type="submit" className="bg-[#2490FF] text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition-all">
                                    Crear
                                </button>
                                <button className="bg-white border border-[#2490FF] text-[#2490FF] px-4 py-2 rounded-full font-bold hover:scale-105 transition-all"
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    style={{ marginLeft: "10px" }}
                                >
                                Cancelar
                                </button>
                            </span>
                            
                        </form>
                    </div>
                </div>
                
                )}
                {isCreateModalOpen && (
                    <div
                        style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 999,
                        }}
                        onClick={() => setIsCreateModalOpen(false)}
                    />
                )}
            </div>

        </div>
    )
}

export default UserStoryDetails;