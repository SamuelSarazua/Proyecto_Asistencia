export function asistencia(gradoId) {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-asistencia";

    // Botón de regreso
    const backBtn = document.createElement('button');
    backBtn.className = "back-btn";
    backBtn.textContent = "← Volver a grados";
    backBtn.addEventListener('click', cargarVistaProfesores);

    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = "Registro de Asistencia";
    
    // Contenedor principal
    const mainContent = document.createElement('div');
    mainContent.className = "asistencia-content";

    // Cargar datos
    cargarDatosAsistencia(gradoId, mainContent);

    contenedor.appendChild(backBtn);
    contenedor.appendChild(titulo);
    contenedor.appendChild(mainContent);

    return contenedor;
}

async function cargarDatosAsistencia(gradoId, contenedor) {
    // Mostrar estado de carga
    const cargaDiv = document.createElement('div');
    cargaDiv.className = "carga-datos";
    cargaDiv.textContent = "Cargando estudiantes...";
    contenedor.textContent = ''; // Limpiar
    contenedor.appendChild(cargaDiv);
    
    try {
        const [responseGrado, responseEstudiantes] = await Promise.all([
            fetch(`http://localhost:3000/grados/${gradoId}`),
            fetch(`http://localhost:3000/estudiantes?grado=${gradoId}`)
        ]);
        
        if (!responseGrado.ok || !responseEstudiantes.ok) {
            throw new Error("Error al obtener datos");
        }
        
        const [gradoData, estudiantesData] = await Promise.all([
            responseGrado.json(),
            responseEstudiantes.json()
        ]);
        
        // Limpiar contenedor
        contenedor.textContent = '';
        
        // Mostrar nombre del grado
        const gradoNombre = document.createElement('h3');
        gradoNombre.textContent = `Grado: ${gradoData.grado?.Nombre_Grado || 'Desconocido'}`;
        contenedor.appendChild(gradoNombre);
        
        // Crear tabla de asistencia
        if (estudiantesData.estudiantes && estudiantesData.estudiantes.length > 0) {
            const tabla = crearTablaAsistencia(estudiantesData.estudiantes);
            contenedor.appendChild(tabla);
        } else {
            const mensaje = document.createElement('p');
            mensaje.className = "sin-estudiantes";
            mensaje.textContent = "No hay estudiantes en este grado";
            contenedor.appendChild(mensaje);
        }
        
    } catch (error) {
        console.error("Error:", error);
        contenedor.textContent = '';
        const errorMsg = document.createElement('p');
        errorMsg.className = "error-datos";
        errorMsg.textContent = "Error al cargar los datos";
        contenedor.appendChild(errorMsg);
    }
}

function crearTablaAsistencia(estudiantes) {
    const tabla = document.createElement('table');
    tabla.className = "tabla-asistencia";
    
    // Cabecera
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const th1 = document.createElement('th');
    th1.textContent = "#";
    const th2 = document.createElement('th');
    th2.textContent = "Estudiante";
    const th3 = document.createElement('th');
    th3.textContent = "Asistencia";
    
    headerRow.appendChild(th1);
    headerRow.appendChild(th2);
    headerRow.appendChild(th3);
    thead.appendChild(headerRow);
    tabla.appendChild(thead);
    
    // Cuerpo
    const tbody = document.createElement('tbody');
    
    estudiantes.forEach((estudiante, index) => {
        const row = document.createElement('tr');
        
        // Número
        const tdNum = document.createElement('td');
        tdNum.textContent = index + 1;
        
        // Nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = estudiante.nombre;
        
        // Asistencia
        const tdAsistencia = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = estudiante.asistio || false;
        checkbox.addEventListener('change', () => {
            actualizarAsistencia(estudiante.id, checkbox.checked);
        });
        tdAsistencia.appendChild(checkbox);
        
        row.appendChild(tdNum);
        row.appendChild(tdNombre);
        row.appendChild(tdAsistencia);
        tbody.appendChild(row);
    });
    
    tabla.appendChild(tbody);
    return tabla;
}

async function actualizarAsistencia(estudianteId, asistio) {
    try {
        const response = await fetch('http://localhost:3000/asistencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estudiante_id: estudianteId,
                asistio: asistio
            })
        });
        
        if (!response.ok) {
            throw new Error("Error al guardar");
        }
    } catch (error) {
        console.error("Error al actualizar asistencia:", error);
        alert("No se pudo guardar la asistencia");
    }
}

function cargarVistaProfesores() {
    const app = document.getElementById('app') || document.body;
    app.textContent = '';
    import('./profesores.js').then(module => {
        app.appendChild(module.profesores());
    }).catch(error => {
        console.error("Error al cargar vista profesores:", error);
        const errorMsg = document.createElement('p');
        errorMsg.textContent = "Error al cargar la vista de grados";
        app.appendChild(errorMsg);
    });
}

function redirigirALogin() {
    window.location.href = '/login.js';
}