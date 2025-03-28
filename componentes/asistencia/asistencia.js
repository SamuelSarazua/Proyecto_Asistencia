export function asistencia(gradoId) {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-asistencia";

    // Botón de regreso
    const backBtn = document.createElement('button');
    backBtn.className = "back-btn";
    backBtn.textContent = "← Volver a grados";
    backBtn.addEventListener('click', cargarVistaProfesores);

    // Título principal
    const titulo = document.createElement('h2');
    titulo.textContent = "Registro de Asistencia";

    // Controles de fecha
    const fechaControl = document.createElement('div');
    fechaControl.className = "fecha-control";
    
    const fechaLabel = document.createElement('label');
    fechaLabel.textContent = "Fecha:";
    fechaLabel.htmlFor = "fecha-input";
    
    const fechaInput = document.createElement('input');
    fechaInput.type = 'date';
    fechaInput.id = "fecha-input";
    fechaInput.value = new Date().toISOString().split('T')[0];
    
    const actualizarBtn = document.createElement('button');
    actualizarBtn.className = "btn-actualizar";
    actualizarBtn.textContent = "Actualizar";
    
    fechaControl.appendChild(fechaLabel);
    fechaControl.appendChild(fechaInput);
    fechaControl.appendChild(actualizarBtn);

    // Contenedor principal
    const mainContent = document.createElement('div');
    mainContent.className = "asistencia-content";

    // Función para actualizar
    const actualizarDatos = () => {
        const fecha = fechaInput.value;
        if (!fecha) {
            mostrarError(mainContent, "Seleccione una fecha válida");
            return;
        }
        cargarAsistencia(gradoId, fecha, mainContent);
    };

    actualizarBtn.addEventListener('click', actualizarDatos);
    fechaInput.addEventListener('change', actualizarDatos);

    // Carga inicial
    actualizarDatos();

    // Ensamblar componentes
    contenedor.appendChild(backBtn);
    contenedor.appendChild(titulo);
    contenedor.appendChild(fechaControl);
    contenedor.appendChild(mainContent);
    
    return contenedor;
}

async function cargarAsistencia(gradoId, fecha, contenedor) {
    // Mostrar estado de carga
    mostrarEstadoCarga(contenedor);

    try {
        // Obtener datos en paralelo
        const [gradoData, alumnosData] = await Promise.all([
            obtenerGrado(gradoId),
            obtenerAlumnos(gradoId, fecha)
        ]);

        // Mostrar los datos
        mostrarDatosAsistencia(contenedor, gradoData, alumnosData, fecha);
    } catch (error) {
        console.error("Error al cargar asistencia:", error);
        mostrarError(contenedor, error.message);
    }
}

async function obtenerGrado(gradoId) {
    const response = await fetch(`http://localhost:3000/grados/${gradoId}`);
    if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener el grado`);
    }
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Error al obtener datos del grado");
    }
    
    return data.grado;
}

async function obtenerAlumnos(gradoId, fecha) {
    const response = await fetch(
        `http://localhost:3000/alumnos-asistencia?grado_id=${gradoId}&fecha=${fecha}`
    );
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener la lista de alumnos`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error || "Error al obtener datos de alumnos");
    }
    
    return data;
}

function mostrarDatosAsistencia(contenedor, grado, data, fecha) {
    // Limpiar contenedor
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    // Mostrar encabezados
    const tituloGrado = document.createElement('h3');
    tituloGrado.textContent = `Grado: ${grado.Nombre_Grado}`;
    contenedor.appendChild(tituloGrado);
    
    const tituloFecha = document.createElement('h4');
    tituloFecha.textContent = `Fecha: ${fecha}`;
    contenedor.appendChild(tituloFecha);

    // Verificar si hay alumnos
    if (!data.alumnos || data.alumnos.length === 0) {
        const mensaje = document.createElement('p');
        mensaje.className = "sin-alumnos";
        mensaje.textContent = "No hay alumnos registrados en este grado";
        contenedor.appendChild(mensaje);
        return;
    }

    // Crear tabla
    const tabla = document.createElement('table');
    tabla.className = "tabla-asistencia";
    
    // Cabecera
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    ["#", "Alumno", "Asistencia"].forEach(texto => {
        const th = document.createElement('th');
        th.textContent = texto;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);
    
    // Cuerpo
    const tbody = document.createElement('tbody');
    
    data.alumnos.forEach((alumno, index) => {
        const tr = document.createElement('tr');
        
        // Número
        const tdNum = document.createElement('td');
        tdNum.textContent = index + 1;
        tr.appendChild(tdNum);
        
        // Nombre
        const tdNombre = document.createElement('td');
        tdNombre.textContent = `${alumno.Apellido} ${alumno.Nombre}`;
        tr.appendChild(tdNombre);
        
        // Asistencia
        const tdAsistencia = document.createElement('td');
        const select = document.createElement('select');
        select.className = "select-asistencia";
        
        ["Presente", "Ausente"].forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            option.selected = alumno.Estado === estado;
            select.appendChild(option);
        });
        
        select.addEventListener('change', () => {
            guardarAsistencia(alumno.id, fecha, select.value);
        });
        
        tdAsistencia.appendChild(select);
        tr.appendChild(tdAsistencia);
        
        tbody.appendChild(tr);
    });
    
    tabla.appendChild(tbody);
    contenedor.appendChild(tabla);
}

async function guardarAsistencia(alumnoId, fecha, estado) {
    try {
        const response = await fetch('http://localhost:3000/asistencia', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                alumno_id: alumnoId,
                fecha: fecha,
                estado: estado
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || "Error al guardar la asistencia");
        }

        mostrarNotificacion("Asistencia guardada correctamente", "exito");
        
    } catch (error) {
        console.error("Error al guardar asistencia:", error);
        mostrarNotificacion(error.message, "error");
        
        // Revertir visualmente el cambio
        const select = document.querySelector(`select[data-alumno-id="${alumnoId}"]`);
        if (select) {
            select.value = select.dataset.estadoAnterior;
        }
    }
}

// Funciones auxiliares
function mostrarEstadoCarga(contenedor) {
    limpiarContenedor(contenedor);
    
    const divCarga = document.createElement('div');
    divCarga.className = "estado-carga";
    
    const spinner = document.createElement('div');
    spinner.className = "spinner";
    
    const texto = document.createElement('p');
    texto.textContent = "Cargando datos...";
    
    divCarga.appendChild(spinner);
    divCarga.appendChild(texto);
    contenedor.appendChild(divCarga);
}

function mostrarError(contenedor, mensaje) {
    limpiarContenedor(contenedor);
    
    const divError = document.createElement('div');
    divError.className = "error-mensaje";
    divError.textContent = mensaje;
    contenedor.appendChild(divError);
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
}

function limpiarContenedor(contenedor) {
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }
}

// Función para cargar la vista de profesores
function cargarVistaProfesores() {
    const app = document.getElementById('app') || document.body;
    import('../profesores/profesores.js')
        .then(module => {
            app.textContent = '';
            app.appendChild(module.profesores());
        })
        .catch(error => {
            console.error("Error al cargar vista:", error);
            app.textContent = "Error al cargar la vista de profesores";
        });
}