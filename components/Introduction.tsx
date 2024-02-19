import Image from 'next/image'
import 'animate.css';

const Introduction = () => {
  return (
    <section className='flex flex-col items-center justify-center section-min-height' id="home">
        <Image
                width={842}
                height={485}
                src={'/img/logo.png'}
                alt="Logo"
                className='lg:w-[40%] w-72 animate__animated animate__fadeInDown mb-16'
                priority={true}
                />
        <p className='lg:text-5xl text-4xl max-w-3xl text-center'>Encuentra las diferentes opciones de prestamos que puedes tener</p>
                
    </section>
  )
}

export default Introduction