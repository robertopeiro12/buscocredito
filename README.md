# BuscoCredito

BuscoCredito es un marketplace que centraliza perfiles crediticios y permite a prestamistas competir por ofrecer las mejores condiciones.

## Flujos clave

Usuario Solicita Préstamo

1. Registro con datos personales.
2. Solicita préstamo (monto, plazo).
3. Sistema verifica score crediticio.
4. Ofertas de prestamistas llegan en horas.
5. Elige la mejor oferta.

Prestamista
. Accede al marketplace con solicitudes filtradas. 2. Envía oferta con tasa y condiciones. 3. Recibe feedback si pierde: "Tu tasa fue un 5% más alta que la ganadora".

Administrador

1. Registra su compañía con token especial.
2. Crea cuentas para trabajadores.
3. Supervisa actividad y métricas.

## Tecnologia

Componente Herramientas
Frontend Next.js, TypeScript, Tailwind CSS
Backend Firebase (Auth + Firestore), Next.js API Routes
Seguridad Cifrado AES-256, Reglas de Firestore

## Descripcion de participantes (reduntante pero para que quede claro)

**Prestatario / Persona que Busca o Solicita Crédito**

**Datos Indispensables / Iniciales.**

- Nombre completo

  - Apellido Paterno (obligatorio)

  - Apellido Materno

  - Primer Nombre (obligatorio)

  - Segundo Nombre

- Email (para registro, confirmación y seguimiento)

- RFC (para solicitantes de créditos a negocio y personal)

- Domicilio actual

  - Calle

  - Número Exterior

  - Numero Interior

  - Colonia

  - Ciudad

  - Municipio

  - Estado

  - Código Postal

- Fecha de Nacimiento

**Datos Necesarios para Crédito.**

- Propósito del Crédito:

  - Personal:

    - Crédito al consumo, como celulares, vacaciones, adecuaciones
      al hogar, etc.

    - Liquidar Deudas / Consolidación de Deuda

  - Negocio. Crédito que se usará para crecer un negocio y puede
    ser:

    - Capital de Trabajo

    - Adquisición de Maquinaria o Equipo

    - Liquidar Deudas

- Monto deseado \$:

  - Cada plataforma Fintech tiene tabuladores. Los montos y los
    saltos entre monto y monto lo podemos definir estandarizados, es
    decir, comenzar desde montos como \$10 mil pesos e ir dando
    saltos de \$1000 en \$1000, hasta \$5 millones, o lo que sea.

- Plazo. Esto es en cuánto tiempo quiere pagar el crédito, y
  generalmente se usa en el sector así:

  - 3 meses

  - 6 meses

  - 8 meses

  - 12 meses

  - 18 meses

  - 24 meses

  - 36 meses

  - 48 meses

  - 60 meses

  - 72 meses

- Forma de pago. Se refiere a la periodicidad del pago de las
  amortizaciones, y puede ser:

  - Semanal

  - Quincenal

  - Mensual

- [Ingresos Comprobables. A criterio del usuario, aclaración que
  después la institución financiera le pedirá comprobantes una vez
  avanzado el proceso.]{.mark}

**Buró de Crédito.**

- Autorización Digital para revisar el estatus crediticio de cada
  solicitante

- Los "Datos Indispensables" se utilizan para alimentar los
  requerimientos de Buró de Crédito.

**buscocredito.com**

**Buró de Crédito.**

- [API para descargar en tiempo real el formato xml de Buró del
  solicitante y extraer la información crediticia.]{.mark}

**Base de Datos.**

- Datos Personales del Usuario:

  - Nombre, Domicilio, RFC, etc

- Información Crediticia:

  - Tipo de Crédito: Personal / Negocio

  - Propósito del Crédito

  - Características del Crédito: monto \$, plazo, forma de pago
    (periodicidad)

  - Score Crediticio (Buró de Crédito)

  - Ingresos Comprobables

- Calificación Interna:

  - Algoritmo que junte la información de:

    - Score de Buró

    - Ingresos comprobables

**Cliente. Institución Financiera**

**Información Parcial del Prestatatario. [Ojo: solo datos de ubicación y
no de identificación.]{.mark}**

- Ubicación:

  - Ciudad

  - Municipio

  - Estado

**Información Crediticia.**

- Propósito del Crédito:

  - Personal:

    - Crédito al consumo, como celulares, vacaciones, adecuaciones
      al hogar, etc.

    - Liquidar Deudas / Consolidación de Deuda

  - Negocio. Crédito que se usará para crecer un negocio y puede
    ser:

    - Capital de Trabajo

    - Adquisición de Maquinaria o Equipo

    - Liquidar Deudas

- Monto deseado \$:

- Plazo. Esto es en cuánto tiempo quiere pagar el crédito, y
  generalmente se usa en el sector así:

- Forma de pago.

- Ingresos Comprobables.

- Score Crediticio de buscocredito.com

**[Propuesta.]{.mark}**

- Monto \$

- Plazo

- Tasa

- Comisión por apertura

- Seguro de Vida Saldo Deudor

- Amortización (pago semanal, quincenal, mensual).
  [\$\$\$\$\$\$\$\$\$\$\$]{.mark}

## Informacion de la app

tengo un proyecto que es un marketplace financiero where users ask for a loan and the loaners decide if they change something of the request or send them as it is like an offer. Then, the user can decide which offer of the many lenders they choose and accept it. Now, i need you to fix me some bugs and quality of life issues in my proyect

Como funciona es que tu como empresa nos contactas a buscoCredito para que te demos un token el cual habra un signup especial para ti. Como empresa (por ejemplo un banco) tienes varios trabajadores. Tu seras el administrador de esos trabajadores y podras crearle una cuenta para que se puedan meter al "marketplace" y puedan buscar solicitudes de prestamo.

El trabajador ya que su administrar le haya creado una cuenta va a poder iniciar sesion y empezar a buscar solicitudes de prestamo y hacerles una oferta.

Tu como usuario en tu perspectiva lo que vas a querer hacer es hacer solicitudes de prestamo y poder ver en un apartado tambien las ofertas que los trabajadores te han hecho llegar

Take note that im using next js typescript and tailwind so that you can get familiar

Tomar en cuenta que BuscoCredito no ofrece prestamos, es un marketplace financiero. Es un intermediario entre prestamistas y prestamiantes.

## Figma

https://www.figma.com/file/77OQziJaORO4hYF91wu3fQ/BuscoCredito

## Miro

https://miro.com/app/board/uXjVKL2-Ghw=/

## How to Use

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

## License

Licensed under the [MIT license](https://github.com/nextui-org/next-app-template/blob/main/LICENSE).
