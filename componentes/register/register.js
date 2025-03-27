export function formularioRegistro() {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-registro";

    const formulario = document.createElement('form');
    formulario.className = "formulario-registro";
    formulario.addEventListener('submit', (e) => e.preventDefault());

    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = "Registro";
    formulario.appendChild(titulo);

    // Campos del formulario
    const campos = [
        { id: 'nombre', label: 'Nombre', type: 'text' },
        { id: 'apellido', label: 'Apellido', type: 'text' },
        { id: 'correo', label: 'Correo electrónico', type: 'email' },
        { id: 'contrasena', label: 'Contraseña', type: 'password' }
    ];

    campos.forEach(campo => {
        const label = document.createElement('label');
        label.textContent = campo.label + ":";
        label.htmlFor = campo.id;
        formulario.appendChild(label);

        const input = document.createElement('input');
        input.type = campo.type;
        input.id = campo.id;
        input.required = true;
        formulario.appendChild(input);

        formulario.appendChild(document.createElement('br'));
    });

    // Botón de registrar
    const botonRegistrar = document.createElement('button');
    botonRegistrar.type = "button";
    botonRegistrar.className = "boton-registrar";
    botonRegistrar.textContent = "Registrarse";
    botonRegistrar.addEventListener('click', registrarUsuario);
    formulario.appendChild(botonRegistrar);

    // Botón de volver
    const botonVolver = document.createElement('button');
    botonVolver.type = "button";
    botonVolver.className = "boton-volver";
    botonVolver.textContent = "Volver al Login";
    botonVolver.addEventListener('click', volverALogin);
    formulario.appendChild(botonVolver);

    // Contenedor de mensajes
    const mensajeContainer = document.createElement('div');
    mensajeContainer.className = "mensaje-container";
    formulario.appendChild(mensajeContainer);

    async function registrarUsuario() {
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const correo = document.getElementById('correo').value.trim().toLowerCase();
        const contrasena = document.getElementById('contrasena').value;

        limpiarMensajes();

        // Validaciones
        if (!nombre || !apellido || !correo || !contrasena) {
            mostrarMensaje('Por favor complete todos los campos', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            mostrarMensaje('Ingrese un correo electrónico válido', 'error');
            return;
        }

        if (contrasena.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            mostrarCargando(true);
            
            const response = await fetch('http://localhost:3000/registro', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ nombre, apellido, correo, contrasena })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Error en el registro');
            }

            mostrarMensaje('¡Registro exitoso! Redirigiendo...', 'exito');
            
            // Redirigir después de 1.5 segundos
            setTimeout(volverALogin, 1500);

        } catch (error) {
            console.error('Error en registro:', error);
            
            let mensajeError = error.message;
            if (error.message.includes('ER_DUP_ENTRY')) {
                mensajeError = 'El correo electrónico ya está registrado';
            }
            
            mostrarMensaje(mensajeError, 'error');
        } finally {
            mostrarCargando(false);
        }
    }

    async function volverALogin() {
        try {
            mostrarCargando(true);
            const { formularioLogin } = await import('../login/login.js');
            document.body.innerHTML = '';
            document.body.appendChild(formularioLogin());
        } catch (error) {
            console.error('Error al volver al login:', error);
            mostrarMensaje('Error al cargar el login', 'error');
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
            cargando.textContent = "Procesando...";
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