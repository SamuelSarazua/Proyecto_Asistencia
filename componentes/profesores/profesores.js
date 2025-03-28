export function profesores() {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-profesores";

    const profesorData = JSON.parse(sessionStorage.getItem('profesor'));
    if (!profesorData) {
        redirigirALogin();
        return contenedor;
    }

    const header = document.createElement('header');
    header.className = "header-profesor";

    const infoProfesor = document.createElement('div');
    infoProfesor.className = "info-profesor";

    const nombreProfesor = document.createElement('h2');
    nombreProfesor.textContent = `${profesorData.nombre} ${profesorData.apellido}`;

    const emailProfesor = document.createElement('p');
    emailProfesor.textContent = profesorData.email;

    infoProfesor.appendChild(nombreProfesor);
    infoProfesor.appendChild(emailProfesor);

    const logoutBtn = document.createElement('button');
    logoutBtn.className = "logout-btn";
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('profesor');
        redirigirALogin();
    });

    header.appendChild(infoProfesor);
    header.appendChild(logoutBtn);

    const gradosContenedor = document.createElement('div');
    gradosContenedor.className = "grados-contenedor";

    const gradosTitulo = document.createElement('h3');
    gradosTitulo.className = "grados-titulo";
    gradosTitulo.textContent = "Grados a cargo:";

    const gradosLista = document.createElement('div');
    gradosLista.className = "grados-lista";
    gradosContenedor.appendChild(gradosTitulo);
    gradosContenedor.appendChild(gradosLista);

    contenedor.appendChild(header);
    contenedor.appendChild(gradosContenedor);

    cargarGrados(gradosLista);
    return contenedor;
}

async function cargarGrados(contenedor) {
    try {
        const response = await fetch('http://localhost:3000/grados');
        if (!response.ok) {
            throw new Error("Error al cargar los grados");
        }
        
        const { grados } = await response.json();
        
        // Limpiar contenedor
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }

        if (!grados || grados.length === 0) {
            const mensaje = document.createElement('p');
            mensaje.textContent = "No hay grados asignados";
            contenedor.appendChild(mensaje);
            return;
        }

        // Crear cards para cada grado
        grados.forEach(grado => {
            const gradoCard = document.createElement('div');
            gradoCard.className = "grado-card";
            
            const gradoNombre = document.createElement('h4');
            gradoNombre.textContent = grado.Nombre_Grado;
            
            const gradoAccion = document.createElement('p');
            gradoAccion.textContent = "Registrar asistencia";
            
            gradoCard.appendChild(gradoNombre);
            gradoCard.appendChild(gradoAccion);
            
            gradoCard.style.cursor = "pointer";
            gradoCard.addEventListener('click', () => cargarVistaAsistencia(grado.id));
            
            contenedor.appendChild(gradoCard);
        });
    } catch (error) {
        const errorMensaje = document.createElement('p');
        errorMensaje.textContent = error.message;
        contenedor.appendChild(errorMensaje);
    }
}

function cargarVistaAsistencia(gradoId) {
    const app = document.getElementById('app') || document.body;
    app.innerHTML = '';
    import('../asistencia/asistencia.js')
        .then(module => {
            app.appendChild(module.asistencia(gradoId));
        })
        .catch(() => {
            app.textContent = "Error al cargar la asistencia";
        });
}

function redirigirALogin() {
    window.location.href = '../login/login.js';
    window.location.reload();
}
