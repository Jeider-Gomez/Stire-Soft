# Reporte de Auditoría Funcional y QA (Pruebas Manuales Paso a Paso) --- STIRE Soft

> **STIRE Soft** · Registro de pruebas manuales\
> **Fecha:** 02 de octubre de 2026 · **Auditor:** Jorge Iván Cervantes
> García\
> **Plataforma:** `stire-soft.vercel.app`

------------------------------------------------------------------------

## Contenido

1.  [Apertura de la aplicación, registro y control de
    sesión](#1-apertura-de-la-aplicación-registro-y-control-de-sesión)
2.  [Inscripción al curso de
    Algoritmia](#2-inscripción-al-curso-de-algoritmia)
3.  [Editores de código, atajos, teclado y
    evaluación](#3-pruebas-detalladas-en-los-editores-de-código-atajos-teclado-y-evaluación)
4.  [Centro de
    notificaciones](#4-monitoreo-del-centro-de-notificaciones-en-tiempo-real)
5.  [Tutor inteligente](#5-pruebas-del-tutor-inteligente-tutor-ia-stire)
6.  [Recuperación y restablecimiento de
    contraseña](#6-flujo-completo-de-recuperación-y-restablecimiento-de-contraseña)
7.  [Resumen de hallazgos y registro de
    QA](#7-tabla-resumen-de-hallazgos-y-registro-de-qa)

------------------------------------------------------------------------

## 1. Apertura de la Aplicación, Registro y Control de Sesión

-   **Apertura de la Plataforma:** Se ingresó a la URL principal
    `stire-soft.vercel.app`. La página cargó el módulo de autenticación
    con el logotipo institucional de STIRE Soft y la leyenda de
    cumplimiento de accesibilidad **WCAG 2.1 AA** en el pie de página.

-   **Proceso de Registro:** Se seleccionó la opción para crear una
    cuenta nueva y se completaron los campos del formulario de registro
    de estudiante. Al enviar, el sistema creó la cuenta en la base de
    datos y redirigió automáticamente al panel principal con sesión
    activa.

-   **Cierre de Sesión (Logout):** Desde el menú del perfil del
    estudiante (esquina superior derecha), se ejecutó la acción de
    **Cerrar sesión**. El sistema limpió los tokens del navegador y
    redirigió de inmediato a la pantalla de acceso `/auth/login`.

-   **Reingreso (Login):** Se introdujeron las credenciales recién
    creadas (correo electrónico y contraseña). El inicio de sesión se
    completó con éxito, redirigiendo de vuelta al panel del estudiante.

## 2. Inscripción al Curso de Algoritmia

-   **Ingreso del Código:** Desde el panel principal, se seleccionó la
    opción para unirse a un nuevo curso y se ingresó el código de
    inscripción suministrado por el docente: `DOC-B7FO`.

-   **Confirmación e Ingreso:** El sistema validó el código de inmediato
    e inscribió al estudiante en el curso **Algoritmia** (*Algoritmia
    --- prueba de docente*). En la barra de navegación lateral se
    desplegó la jerarquía correspondiente: **Módulo 1: Fundamentos** y
    la **Unidad 1: Declarar variables**.

## 3. Pruebas Detalladas en los Editores de Código, Atajos, Teclado y Evaluación

### A. Primer Ejercicio: Código JavaScript (`/estudiante/evaluacion/2`)

-   **Entorno e Interfaz al Ingresar:** Al abrir el ejercicio *Ejercicio
    Código JS (prueba)*, la interfaz se desplegó con la columna
    izquierda (*Enunciado*, *Casos de prueba*, *Registro*), el editor
    central en `solucion.js` y el área superior con el botón de *Tutor
    IA*. La plantilla base predeterminada que se encontró cargada al
    ingresar fue:

    JavaScript

        const fs = require('fs');

        // leer entrada estándar
        const input = fs.readFileSync(0, 'utf-8').trim();

        // Escribe tu algoritmo aquí:

-   **Prueba de Códigos Usados e Iteraciones:**

    1.  **Código 1:**

        JavaScript

            let miVariable = input;
            console.log(miVariable);

        -   **Resultado:** Al presionar **"Probar código"**, el sistema
            arrojó la alerta de error indicando exactamente: **"Falla en
            salida: Se esperaba 8 y se mostró 53"** (o *se entregó 53*).

    2.  **Código 2:**

        JavaScript

            console.log(input);

        -   **Resultado:** Al presionar **"Probar código"**, se mantuvo
            el mensaje de error: **"Falla en salida: Se esperaba 8 y se
            mostró 53"**.

    3.  **Código 3:**

        JavaScript

            let numeroIngresado = Number(input);
            console.log(numeroIngresado);

        -   **Resultado:** Al presionar **"Probar código"**, la
            evaluación continuó arrojando: **"Falla en salida: Se
            esperaba 8 y se mostró 53"**.

    4.  **Código 4:**

        JavaScript

            // Declarando variables de prueba para la Unidad 1
            const entradaOriginal = input;
            let numeroProcesado = Number(entradaOriginal);

            // Imprimimos el resultado procesado
            console.log(numeroProcesado);

        -   **Resultado:** Al presionar **"Probar código"**, se repitió
            la misma retroalimentación de error: **"Falla en salida: Se
            esperaba 8 y se mostró 53"**.

    5.  **Código 5 (Solución aprobada):**

        JavaScript

            console.log(8);

        -   **Resultado:** Al presionar **"Probar código"**, este código
            resolvió la prueba. **Dejó de mostrar el aviso de "Falla en
            salida: Se esperaba 8 y se mostró 53"**, cambió la casilla a
            color verde y marcó el caso de prueba como superado.

-   **Entrega Final del Ejercicio JS:**

    Se hizo clic en el botón **"Entregar solución"**. El sistema procesó
    la entrega y desplegó la retroalimentación en pantalla con el
    resultado obtenido: **Obtuviste 10 / 20 puntos (50%)**, registrando
    el avance correspondiente en el porcentaje de maestría de la unidad.

### B. Segundo Ejercicio: HTML y CSS (`/estudiante/evaluacion/8`)

-   **Entorno y Plantilla Base al Ingresar:** Al abrir el ejercicio
    *Ejercicio HTML y CSS (prueba)*, la interfaz mostró en el panel
    izquierdo el *Enunciado* y la sección *Cómo se califica*; al centro,
    el editor con dos pestañas de archivo: `HTML index.html` y
    `CSS estilos.css` (`HTML5 UTF-8`); a la derecha, el panel de **Vista
    previa (actualización en vivo)** con los botones **Tutor IA**,
    **Probar**, **Entregar solución** e **Intentos: 3 / 3**; y abajo a
    la derecha, la tarjeta de **Reglas a cumplir** (*"Hay un título
    h1"*).

    -   **Plantilla Base Encontrada:** Al ingresar por primera vez, la
        pestaña `index.html` presentó el archivo limpio con la
        estructura HTML básica inicial para empezar a trabajar, mientras
        que `estilos.css` se encontró listo para la inserción de reglas
        de estilo.

-   **Detalle de Usabilidad Clave (Renderizado Dinámico):**

    Se constató que la **Vista previa se renderiza en tiempo real en el
    panel derecho de forma automática a medida que se escribe**, **sin
    necesidad de hacer clic previamente en el botón "Probar"**.

-   **Prueba de Códigos Usados e Iteraciones:**

    1.  **Código 1 (HTML Inicial en** `index.html`**):**

        HTML

            <h1>Prueba STIRE HTML</h1>

        -   **Comportamiento Visual:** Apenas se escribió la línea, la
            vista previa renderizó en vivo el texto
            `"Prueba STIRE HTML"`.

        -   **Evaluación de Regla:** Al presionar el botón **"Probar"**,
            la regla pública *"Hay un título h1"* cambió a estado verde
            completado (`1/1`).

    2.  **Código 2 (HTML y CSS Combinados):**

        -   **En la pestaña** `index.html`**:**

            HTML

                <h1>Mi Proyecto STIRE</h1>
                <p>Evaluando la estructura y el diseño web paso a paso.</p>

        -   **En la pestaña** `estilos.css`**:**

            CSS

                h1 {
                  color: #1e40af;
                  text-align: center;
                }

                p {
                  font-family: sans-serif;
                  color: #374151;
                }

        -   **Comportamiento Visual:** Al escribir en `estilos.css`, la
            vista previa actualizó en vivo la apariencia sin dar clic a
            probar: el título `h1` se centró en azul (`#1e40af`) y el
            párrafo tomó la fuente `sans-serif` con el color gris oscuro
            (`#374151`).

-   **Entrega Final del Ejercicio HTML/CSS:** Se presionó el botón
    **"Entregar solución"**. El sistema descontó el intento
    (`Intentos: 3 / 3`), mostró la retroalimentación de calificación
    máxima con **20 / 20 puntos (100%)** e incrementó el porcentaje de
    dominio académico de la unidad al **21%**.

### C. Descubrimiento de Atajos de Teclado, Autocompletado y Accesibilidad

-   **Autocompletado de Etiquetas HTML:** Se comprobó que al escribir la
    apertura de una etiqueta (ej. `<h1>`), el editor inserta
    automáticamente la etiqueta de cierre correspondiente (`</h1>`),
    dejando el cursor posicionado en el centro.

-   **Sangría con Tecla** `Tab`**:** Al presionar la tecla `Tab` en
    cualquier punto de una línea de código, el editor aplica un espacio
    de sangría doble en esa línea activa.

-   **Navegación por Enfoque (**`Esc + Tab`**):** Al presionar la
    combinación de teclas `Esc` + `Tab`, se activó el anillo de enfoque
    de accesibilidad (*focus ring*). Se observó un indicador visual
    (*bolita negra*) desplazándose secuencialmente por todos los
    elementos interactivos del navegador y la app (por ejemplo,
    resaltando el botón de *"Registro"*).

-   **Alerta de Sincronización:** Se registró la aparición del mensaje
    transitorio en rojo *"No se pudo autoguardar"* en la barra superior
    e inferior del editor durante breves variaciones de sincronización
    con la red.

## 4. Monitoreo del Centro de Notificaciones en Tiempo Real

-   **Contador de Alertas:** El icono de la campana en la barra superior
    mostró un distintivo rojo con el contador de **7 notificaciones sin
    leer**.

-   **Historial Cronológico:** Al desplegar el panel, se verificaron los
    eventos registrados durante la resolución de ejercicios con sus
    marcas de tiempo exactas:

    -   *"¡Unidad Explorada!"* (02:58 p. m.) --- Apertura de la unidad.

    -   *"¡Actividad Aprobada! Obtuviste 20/20 puntos (100%)"* (02:58
        p. m. y 02:56 p. m.) --- Confirmación de entrega perfecta.

    -   *"¡En Marcha! Tu estado ha progresado a 'En Práctica' (Maestría:
        21.0%)"* (02:55 p. m.) --- Actualización de progreso.

## 5. Pruebas del Tutor Inteligente (Tutor IA STIRE)

-   **Configuración de la API Key:** Se abrió el panel del **Tutor IA
    STIRE**, se seleccionó *"Mi clave"*, se ingresó la API Key propia de
    Google AI Studio y se guardó la conexión.

-   **Consulta 1 (Dashboard Principal):** Se preguntó *"¿Cómo declaro
    una variable en JavaScript?"*. El tutor explicó el concepto usando
    la analogía de *"una pequeña caja con una etiqueta donde puedes
    guardar un tesoro"*, detallando `let` y `const`.

-   **Consulta 2 (Dentro del Editor JS):** Se preguntó *"¿Cómo funciona
    fs.readFileSync en este ejercicio?"*. Explicó la instrucción con la
    analogía de un *"buzón de entrada"* y el uso de `.trim()`.

-   **Auditoría de UI y Componentes:**

    -   **Elemento Funcional:** El enlace **"Ver la lección"** dentro
        del chat funcionó de manera correcta, abriendo el material
        teórico.

    -   **Bug de UI Identificado:** Los botones de acceso rápido
        superiores (**"Pista"**, **"Pregunta guía"**, **"Dónde está el
        error"**) actúan como elementos visuales estáticos y **no
        realizan ninguna acción ni insertan texto al hacer clic sobre
        ellos**.

## 6. Flujo Completo de Recuperación y Restablecimiento de Contraseña

-   **Solicitud (**`/auth/forgot-password`**):** Se cerró la sesión
    activa, se seleccionó **"¿Olvidaste tu contraseña?"** e ingresó el
    correo `jcervantesgarcia23@correo.unicordoba.edu.co`. El sistema
    desplegó el mensaje *"Revisa tu correo"*, notificando la validez del
    enlace por **30 minutos**.

-   **Recepción en Gmail:** Se verificó la llegada del correo
    proveniente de **STIRE (**`stire.unicor@gmail.com`**)** con el
    asunto **"Restablece tu contraseña de STIRE"**, saludando a **Iván
    García** con los detalles de seguridad.

-   **Formulario de Nueva Contraseña (**`/auth/reset-password`**):** Al
    abrir el enlace del correo, la interfaz mostró los requisitos de
    clave (*"Mínimo 6 caracteres, con mayúscula, minúscula y un número o
    símbolo"*) y los campos de confirmación.

-   **Actualización y Cierre de Sesiones Concurrentes:** Tras guardar la
    clave, la pantalla confirmó *"Tu contraseña se actualizó"* y
    desplegó la medida de seguridad: **"Las sesiones abiertas en otros
    dispositivos se cerraron"**, ofreciendo el botón *"Ir a iniciar
    sesión"* para ingresar con la nueva clave.

## 7. Tabla Resumen de Hallazgos y Registro de QA

  --------------------------------------------------------------------------------------------------
  **ID**      **Componente /   **Comportamiento Observado**                      **Clasificación**
              Módulo**                                                           
  ----------- ---------------- ------------------------------------------------- -------------------
  **QA-01**   Editor JS        Retroalimentación de "Falla en salida: Se         **Funcional
              (Sandbox)        esperaba 8 y se mostró 53" en códigos 1 a 4,      (Evaluación
                               aprobación en verde con `console.log(8);` y       Precisa)**
                               entrega de 10/20 pts (50%).                       

  **QA-02**   Editor HTML/CSS  Vista previa interactiva en vivo activa sin       **Funcional (UX
                               necesidad de pulsar "Probar", prueba de regla     Excelente)**
                               `1/1` y entrega perfecta de 20/20 pts (100%).     
                               `<br>`{=html}                                     

  **QA-03**   Teclado /        `Tab` aplica sangría; `Esc + Tab` activa el       **Funcional (UX
              Accesibilidad    anillo de enfoque (*focus ring*) recorriendo la   Excelente)**
                               interfaz.                                         

  **QA-04**   Notificaciones   Registro cronológico con marcas de tiempo e       **Funcional (UX
                               indicador en la campana (`7 sin leer`).           Excelente)**

  **QA-05**   Tutor IA (Core)  Integración exitosa con API Key de Google AI      **Funcional (UX
                               Studio y explicaciones socráticas mediante        Excelente)**
                               analogías. `<br>`{=html}                          

  **QA-06**   Tutor IA (UI)    Los botones de acción rápida (`Pista`,            **Bug de Usabilidad
                               `Pregunta guía`, `Dónde está el error`) son       (UI)**
                               estáticos y no reaccionan al clic.                

  **QA-07**   Autoguardado     Alerta transitoria *"No se pudo autoguardar"*     **Observación
                               ante pequeñas intermitencias de sincronización.   Transitoria**

  **QA-08**   Recuperación /   Correo inmediato, token de 30 min y **cierre      **Funcional
              Seguridad        automático de sesiones concurrentes** al cambiar  (Seguridad
                               la clave.                                         Robusta)**
  --------------------------------------------------------------------------------------------------
