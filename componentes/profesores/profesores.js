export function profesores() {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-profesores";

    // Verificar sesión
    const profesorData = JSON.parse(sessionStorage.getItem('profesor'));
    if (!profesorData) {
        redirigirALogin();
        return contenedor;
    }

    // Header
    const header = document.createElement('header');
    header.className = "header-profesor";

    // Información del profesor
    const infoProfesor = document.createElement('div');
    infoProfesor.className = "info-profesor";

    const nombreProfesor = document.createElement('h2');
    nombreProfesor.textContent = `${profesorData.nombre} ${profesorData.apellido}`;

    const emailProfesor = document.createElement('p');
    emailProfesor.textContent = profesorData.email;

    infoProfesor.appendChild(nombreProfesor);
    infoProfesor.appendChild(emailProfesor);

    // Botón de cerrar sesión
    const logoutBtn = document.createElement('button');
    logoutBtn.className = "logout-btn";
    logoutBtn.textContent = "Cerrar sesión";
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('profesor');
        redirigirALogin();
    });

    header.appendChild(infoProfesor);
    header.appendChild(logoutBtn);

    // Contenedor de grados
    const gradosContenedor = document.createElement('div');
    gradosContenedor.className = "grados-contenedor";

    const gradosTitulo = document.createElement('h3');
    gradosTitulo.className = "grados-titulo";
    gradosTitulo.textContent = "Grados a cargo:";

    // Definir gradosLista aquí para que esté disponible en todo el componente
    const gradosLista = document.createElement('div');
    gradosLista.className = "grados-lista";

    // Mensaje de carga
    const cargando = document.createElement('p');
    cargando.className = "cargando";
    cargando.textContent = "Cargando grados...";
    gradosLista.appendChild(cargando);

    gradosContenedor.appendChild(gradosTitulo);
    gradosContenedor.appendChild(gradosLista);

    contenedor.appendChild(header);
    contenedor.appendChild(gradosContenedor);

    // Cargar grados
    cargarGrados(gradosLista); // Pasamos gradosLista como parámetro

    return contenedor;
}

// Función para cargar grados (ahora recibe el contenedor como parámetro)
async function cargarGrados(contenedor) {
    try {
        const response = await fetch('http://localhost:3000/grados');
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();

        // Limpiar contenedor
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }

        if (!data || !data.grados || data.grados.length === 0) {
            const mensaje = document.createElement('p');
            mensaje.textContent = "No hay grados asignados";
            contenedor.appendChild(mensaje);
            return;
        }

        // Crear elementos de grado
        data.grados.forEach(grado => {
            const gradoCard = document.createElement('div');
            gradoCard.className = "grado-card";
            
            const gradoNombre = document.createElement('h4');
            gradoNombre.textContent = grado.Nombre_Grado;
            
            const gradoInfo = document.createElement('p');
            gradoInfo.textContent = "Ver asistencia";
            
            gradoCard.appendChild(gradoNombre);
            gradoCard.appendChild(gradoInfo);
            
            // Hacer clickeable toda la tarjeta
            gradoCard.style.cursor = "pointer";
            gradoCard.addEventListener('click', () => {
                cargarVistaAsistencia(grado.id);
            });
            
            contenedor.appendChild(gradoCard);
        });

    } catch (error) {
        console.error("Error al cargar grados:", error);
        
        // Limpiar contenedor
        while (contenedor.firstChild) {
            contenedor.removeChild(contenedor.firstChild);
        }
        
        const errorMsg = document.createElement('p');
        errorMsg.className = "error";
        errorMsg.textContent = "Error al cargar los grados";
        contenedor.appendChild(errorMsg);
    }
}

function cargarVistaAsistencia(gradoId) {
    const app = document.getElementById('app') || document.body;
    
    // Mostrar carga mientras se cambia de vista
    const cargaDiv = document.createElement('div');
    cargaDiv.className = "carga-vista";
    cargaDiv.textContent = "Cargando asistencia...";
    app.textContent = ''; // Limpiar
    app.appendChild(cargaDiv);
    
    import('./asistencia.js').then(module => {
        // Limpiar completamente
        app.textContent = '';
        app.appendChild(module.asistencia(gradoId));
    }).catch(error => {
        console.error("Error al cargar vista:", error);
        app.textContent = '';
        const errorMsg = document.createElement('p');
        errorMsg.className = "error-vista";
        errorMsg.textContent = "Error al cargar la asistencia";
        app.appendChild(errorMsg);
    });
}

function redirigirALogin() {
    // Forzar recarga para limpiar el estado
    window.location.href = '/login.html';
    window.location.reload();
}