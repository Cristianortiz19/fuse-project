import  { React, useEffect, useState } from "react";
import Header from "@/components/Header";
import '@fontsource-variable/dm-sans';
import '../../styles/index.css'
import { useRouter } from "next/router";
import { db } from "../../app/lib/firebaseConfig"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import HashLoader from "react-spinners/HashLoader";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

function History() {

    const [user, setUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState(""); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
        } else {
            setUser(null);
        }
        });
    
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
        loadTickets();
        }
    }, [user]);

    const loadTickets = async () => {
        try {
    
        const ticketsQuery = query(
            collection(db, "tickets"),
            where("userId", "==", user.uid)
        );
        const ticketsDocs = await getDocs(ticketsQuery);

        console.log(ticketsDocs)
        
        const ticketsList = ticketsDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        console.log(ticketsList)
    
        setTickets(ticketsList);
        setFilteredTickets(ticketsList);

        } catch (error) {
        console.error("Error al cargar los tickets:", error);
        } finally {
        setLoading(false);
        }
    };

    const handleFilterChange = (status) => {
        setFilter(status);

        const filtered =
        status === "all"
            ? tickets
            : tickets.filter((ticket) => ticket.status === status);
    
        setFilteredTickets(
        filtered.filter((ticket) =>
            ticket.description.toLowerCase().includes(search.toLowerCase())
        )
        );
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
    
        const filtered = tickets.filter(
        (ticket) =>
            ticket.description.toLowerCase().includes(value.toLowerCase()) &&
            (filter === "all" || ticket.status === filter)
        );
    
        setFilteredTickets(filtered);
    };

    if (loading) {
        return <HashLoader color="#33b6ff" className="absolute top-[50vh] -right-[50vw]" />
    }

    return (
        <div style={{ padding: "20px" }}>
            <Header></Header>
            <h1>Historial de Tickets</h1>

            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="filter">Filtrar por estado:</label>
                    <select
                    id="filter"
                    value={filter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    style={{ marginLeft: "10px" }}
                    >
                        <option value="all">Todos</option>
                        <option value="Activo">Activo</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Finalizado">Finalizado</option>
                        <option value="Cancelado">Cancelado</option>
                    </select>

                <input
                type="text"
                placeholder="Buscar por descripción..."
                value={search}
                onChange={handleSearchChange}
                style={{
                    marginLeft: "20px",
                    padding: "5px",
                    border: "1px solid #ddd",
                }}
                />
            </div>

            <table style={{ width: "100%", border: "1px solid #ddd", marginTop: "20px" }}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th>Historia de Usuario</th>
                    <th>Comentarios</th>
                </tr>
                </thead>
                <tbody>
                {filteredTickets.length === 0 ? (
                    <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                        No se encontraron tickets.
                    </td>
                    </tr>
                ) : (
                    filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.description}</td>
                        <td>{ticket.status}</td>
                        <td>{ticket.storyName || "Desconocido"}</td>
                        <td>{ticket.comments || "Sin comentarios"}</td>
                    </tr>
                    ))
                    )}
                    </tbody>
                </table>
    </div>
    )
}

export default History;