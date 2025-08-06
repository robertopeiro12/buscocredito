import { Card, CardBody } from "@nextui-org/react";

export const HelpCenter = () => {
  return (
    <Card className="bg-white max-w-2xl mx-auto">
      <CardBody className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Centro de Ayuda
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Preguntas Frecuentes
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  ¿Cómo solicito un préstamo?
                </h4>
                <p className="text-gray-600">
                  Para solicitar un préstamo, dirígete a la sección de &quot;Préstamos&quot;
                  y haz clic en el botón &quot;Solicitar Préstamo&quot;. Completa el formulario
                  con la información requerida y envía tu solicitud.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  ¿Cómo funciona el proceso?
                </h4>
                <p className="text-gray-600">
                  Una vez enviada tu solicitud, nuestros prestamistas la revisarán
                  y te enviarán ofertas si están interesados. Podrás ver todas las
                  ofertas recibidas en la sección de &quot;Préstamos&quot;.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Contacto</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-2">
                Si necesitas asistencia adicional, no dudes en contactarnos:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>Email: soporte@buscocredito.com</li>
                <li>Teléfono: +1 (555) 123-4567</li>
                <li>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</li>
              </ul>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
