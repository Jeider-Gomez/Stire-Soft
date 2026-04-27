<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Prompt profesional para VS Code

Usa este prompt en VS Code Copilot / ChatGPT para trabajar con el proyecto STIRE y guiar la creación del backend.

```txt
Actúa como un desarrollador senior experto en NestJS, arquitectura backend y diseño de sistemas educativos.

Estoy desarrollando un sistema llamado STIRE (Sistema Tutor Inteligente con Repetición Espaciada), enfocado en la asignatura Fundamentos de Algoritmia.

Necesito que me ayudes a construir el backend completo usando:

- NestJS
- TypeORM
- MariaDB
- JWT (autenticación)
- Guards y Roles
- Arquitectura modular

-----------------------------------
🎯 CONTEXTO DEL SISTEMA
-----------------------------------

El sistema tiene 3 roles:

1. admin
2. docente
3. estudiante

El sistema combina:

- Tutor inteligente (IA conversacional tipo docente)
- Seguimiento del aprendizaje por "Unidad de Aprendizaje"
- Evaluaciones básicas
- Recomendaciones automáticas
- Comunicación entre docente y estudiante

-----------------------------------
📚 CONCEPTO CLAVE
-----------------------------------

Unidad de Aprendizaje:

Es la unidad mínima evaluable del sistema.

Ejemplo:
- Variables
- Condicionales
- Ciclos FOR

Cada unidad:
- se puede explicar
- se puede practicar
- se puede evaluar

-----------------------------------
🧩 MÓDULOS DEL SISTEMA
-----------------------------------

Necesito trabajar con estos módulos:

- auth
- user
- docente
- estudiante
- grupo (clase)
- unidad-aprendizaje
- progreso
- evaluacion
- resultado
- tutor
- recomendacion
- mensaje
- notificacion

-----------------------------------
🗄️ MODELO DE DATOS (RESUMIDO)
-----------------------------------

user:
- id
- email
- password
- fullName
- role (admin | docente | estudiante)

docente:
- id
- userId

estudiante:
- id
- userId

grupo:
- id
- nombre
- docenteId

estudiante_grupo:
- id
- estudianteId
- grupoId

unidad_aprendizaje:
- id
- nombre
- descripcion
- nivel_dificultad
- orden

progreso:
- id
- estudianteId
- unidadId
- estado_aprendizaje (no_visto, explorado, en_practica, comprension_parcial, dominado)
- porcentaje_dominio
- prioridad
- fecha_ultimo_repaso

evaluacion:
- id
- unidadId
- pregunta
- respuesta_correcta

resultado:
- id
- estudianteId
- evaluacionId
- respuesta
- es_correcta

mensaje:
- id
- emisorId
- receptorId
- contenido
- tipo (consulta, respuesta)

notificacion:
- id
- userId
- titulo
- mensaje
- leido

-----------------------------------
🔐 REQUISITOS DE SEGURIDAD
-----------------------------------

- Implementar JWT
- Guards con roles
- Decoradores personalizados (@Roles, @GetUser)
- Separar rutas públicas y protegidas

-----------------------------------
⚙️ LO QUE NECESITO DE TI
-----------------------------------

Quiero que me ayudes paso a paso a construir este sistema.

Cuando te haga una petición:

1. Genera código limpio y funcional
2. Usa buenas prácticas de NestJS
3. Explica brevemente lo que haces
4. No compliques innecesariamente
5. Mantén todo alineado con este modelo

-----------------------------------
📌 PRIMERA TAREA
-----------------------------------

Quiero que empieces creando:

1. Entidad User con TypeORM
2. Roles (admin, docente, estudiante)
3. Módulo Auth completo con JWT
4. Guards y decoradores de roles

Después seguimos con los demás módulos.
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
