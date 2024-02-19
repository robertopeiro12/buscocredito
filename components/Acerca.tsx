import React from 'react'
import Image from 'next/image'
const Acerca = () => {
  return (
    <section className='lg:max-w-6xl mx-auto max-w-lg px-5 lg:px-0'   id="acerca">
        <p className='lg:text-5xl text-4xl lg:text-start text-center font-bold lg:mb-16 mb-9'> Acerca de la plataforma</p>
        <div className='flex lg:flex-row flex-col items-center justify-center max-w-6xl'>
            <p className='lg:text-3xl text-xl lg:text-start  text-center lg:mr-32 mb-10'>
                La plataforma de BuscoCredito esta hecha
                con el fin de que las personas puedan encontrar
                las diferentes opciones de prestamos que los 
                bancos les pueden ofrecer, simplemente ingresando
                el tipo de prestamo y la cantidad que requiere. 
            </p>
            <Image
            width={1024}
            height={640}
            src="/img/prestamo.avif"
            alt="Acerca"
            className='lg:w-[50%] w-96'
            />

        </div>
    </section>
  )
}

export default Acerca