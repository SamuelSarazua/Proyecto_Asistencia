export function formularioLogin() {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-login";

    const formulario = document.createElement('form');
    formulario.className = "formulario-login";
    formulario.addEventListener('submit', (e) => e.preventDefault());

    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = "Iniciar Sesión";
    formulario.appendChild(titulo);

    // Campo de email
    const emailLabel = document.createElement('label');
    emailLabel.textContent = "Correo electrónico:";
    emailLabel.htmlFor = "email";
    formulario.appendChild(emailLabel);

    const emailInput = document.createElement('input');
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.required = true;
    formulario.appendChild(emailInput);

    formulario.appendChild(document.createElement('br'));

    // Campo de contraseña
    const contrasenaLabel = document.createElement('label');
    contrasenaLabel.textContent = "Contraseña:";
    contrasenaLabel.htmlFor = "contrasena";
    formulario.appendChild(contrasenaLabel);

    const contrasenaInput = document.createElement('input');
    contrasenaInput.type = "password";
    contrasenaInput.id = "contrasena";
    contrasenaInput.required = true;
    formulario.appendChild(contrasenaInput);

    formulario.appendChild(document.createElement('br'));

    // Botón de inicio de sesión
    const botonEnviar = document.createElement('button');
    botonEnviar.type = "submit";
    botonEnviar.className = "boton-iniciar";
    botonEnviar.textContent = "Iniciar Sesión";
    botonEnviar.addEventListener('click', iniciarSesion);
    formulario.appendChild(botonEnviar);

    // Botón de registro
    const botonRegistro = document.createElement('button');
    botonRegistro.type = "button";
    botonRegistro.className = "boton-registro";
    botonRegistro.textContent = "Registrarse";
    botonRegistro.addEventListener('click', redirigirARegistro);
    formulario.appendChild(botonRegistro);

    // Contenedor de mensajes
    const mensajeContainer = document.createElement('div');
    mensajeContainer.className = "mensaje-container";
    formulario.appendChild(mensajeContainer);

    async function iniciarSesion() {
        const email = emailInput.value.trim().toLowerCase();
        const contrasena = contrasenaInput.value.trim();
    
        limpiarMensajes();
    
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarMensaje('Por favor ingrese un correo válido', 'error');
            return;
        }
    
        if (!contrasena || contrasena.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
    
        try {
            mostrarCargando(true);
            
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ usuario: email, contrasena })
            });
    
            // Verifica primero si hay contenido en la respuesta
            const text = await response.text();
            if (!text) {
                throw new Error('La respuesta del servidor está vacía');
            }
    
            // Intenta parsear solo si hay contenido
            const data = text ? JSON.parse(text) : {};
    
            if (!response.ok) {
                throw new Error(data.error || 'Credenciales incorrectas');
            }
    
            // Guardar datos en sessionStorage
            sessionStorage.setItem('profesor', JSON.stringify(data.profesor));
            
            // Redirigir a la vista de profesores
            cargarVistaProfesores();
            
        } catch (error) {
            console.error('Error en login:', error);
            mostrarMensaje(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            mostrarCargando(false);
        }
    }

    async function cargarVistaProfesores() {
        try {
            const { profesores } = await import('../profesores/profesores.js');
            document.body.innerHTML = '';
            document.body.appendChild(profesores());
        } catch (error) {
            console.error('Error al cargar vista de profesores:', error);
            mostrarMensaje('Error al cargar la aplicación', 'error');
        }
    }


    async function redirigirARegistro() {
        try {
            mostrarCargando(true);
            const { formularioRegistro } = await import('../register/register.js');
            document.body.innerHTML = '';
            document.body.appendChild(formularioRegistro());
        } catch (error) {
            console.error('Error al cargar registro:', error);
            mostrarMensaje('Error al cargar el registro', 'error');
        } finally {
            mostrarCargando(false);
        }
    }

    function mostrarCargando(mostrar) {
        const botones = formulario.querySelectorAll('button');
        botones.forEach(boton => {
            boton.disabled = mostrar;
        });

        if (mostrar) {
            const cargando = document.createElement('div');
            cargando.className = "cargando";
            cargando.textContent = "Cargando...";
            mensajeContainer.appendChild(cargando);
        } else {
            const cargando = mensajeContainer.querySelector('.cargando');
            if (cargando) cargando.remove();
        }
    }

    function mostrarMensaje(texto, tipo) {
        limpiarMensajes();
        const mensaje = document.createElement('div');
        mensaje.className = `mensaje ${tipo}`;
        mensaje.textContent = texto;
        mensajeContainer.appendChild(mensaje);
    }

    function limpiarMensajes() {
        while (mensajeContainer.firstChild) {
            mensajeContainer.removeChild(mensajeContainer.firstChild);
        }
    }

    contenedor.appendChild(formulario);
    return contenedor;
}