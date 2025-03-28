export function formularioLogin() {
    const contenedor = document.createElement('div');
    contenedor.className = "contenedor-login";

    const formulario = document.createElement('form');
    formulario.className = "formulario-login";
    formulario.addEventListener('submit', (e) => e.preventDefault());

    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = "Iniciar";
    formulario.appendChild(titulo);

    // Campo de email
    const emailInput = document.createElement('input');
    emailInput.type = "email";
    emailInput.id = "email";
    emailInput.placeholder = "Correo electrónico";
    emailInput.required = true;
    formulario.appendChild(emailInput);

    // Campo de contraseña
    const contrasenaInput = document.createElement('input');
    contrasenaInput.type = "password";
    contrasenaInput.id = "contrasena";
    contrasenaInput.placeholder = "Contraseña";
    contrasenaInput.required = true;
    formulario.appendChild(contrasenaInput);

    // Botón de inicio de sesión
    const botonEnviar = document.createElement('button');
    botonEnviar.type = "submit";
    botonEnviar.className = "boton-iniciar";
    botonEnviar.textContent = "Iniciar";
    botonEnviar.addEventListener('click', iniciarSesion);
    formulario.appendChild(botonEnviar);

    // Botón de registro
    const botonRegistro = document.createElement('button');
    botonRegistro.type = "button";
    botonRegistro.className = "boton-registro";
    botonRegistro.textContent = "Registrarse";
    botonRegistro.addEventListener('click', redirigirARegistro);
    formulario.appendChild(botonRegistro);

    async function iniciarSesion() {
        const email = emailInput.value.trim().toLowerCase();
        const contrasena = contrasenaInput.value.trim();
    
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || contrasena.length < 6) {
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: email, contrasena })
            });
    
            const data = await response.json();
            if (!response.ok) return;
    
            sessionStorage.setItem('profesor', JSON.stringify(data.profesor));
            cargarVistaProfesores();
            
        } catch (error) {
            console.error('Error en login:', error);
        }
    }

    async function cargarVistaProfesores() {
        try {
            const { profesores } = await import('../profesores/profesores.js');
            document.body.innerHTML = '';
            document.body.appendChild(profesores());
        } catch (error) {
            console.error('Error al cargar vista de profesores:', error);
        }
    }

    async function redirigirARegistro() {
        try {
            const { formularioRegistro } = await import('../register/register.js');
            document.body.innerHTML = '';
            document.body.appendChild(formularioRegistro());
        } catch (error) {
            console.error('Error al cargar registro:', error);
        }
    }

    contenedor.appendChild(formulario);
    return contenedor;
}
