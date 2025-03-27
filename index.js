import { formularioLogin } from "./componentes/login/login.js";

function cargarDOM() {
    document.body.innerHTML = '';
    document.body.appendChild(formularioLogin());
}

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarDOM);
} else {
    cargarDOM();
}