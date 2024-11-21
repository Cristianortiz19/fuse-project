import React from "react";
import { userIcon } from "./Icons";

function Header() {
    return(
        <header className="bg-white flex justify-between align-center px-28 py-4 w-[100%]">
            <figure className="w-52"><img className="" src="./fuse-project-logo.webp" alt="" /></figure>
            <nav className="flex align-center justify-center gap-16">
                <a className="h-6" href="">Inicio</a>
                <a className="h-6" href="">Historial de tickets</a>
                <button className="h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none"><path d="M15.4999 12.9167C18.3534 12.9167 20.6666 10.6035 20.6666 7.75001C20.6666 4.89654 18.3534 2.58334 15.4999 2.58334C12.6464 2.58334 10.3333 4.89654 10.3333 7.75001C10.3333 10.6035 12.6464 12.9167 15.4999 12.9167Z" fill="#2490FF"/><path d="M25.8334 22.6042C25.8334 25.8139 25.8334 28.4167 15.5001 28.4167C5.16675 28.4167 5.16675 25.8139 5.16675 22.6042C5.16675 19.3944 9.7935 16.7917 15.5001 16.7917C21.2067 16.7917 25.8334 19.3944 25.8334 22.6042Z" fill="#2490FF"/></svg>
                </button>
                
            </nav>
        </header>
    )
}

export default Header;