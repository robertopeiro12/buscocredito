"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  Plus,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Search,
  Users,
  Calendar,
  Zap,
} from "lucide-react";
import { addToast } from "@heroui/react";

interface BetaToken {
  id: string;
  token: string;
  assignedTo: string;
  active: boolean;
  createdAt: any;
  lastUsed: any;
  usageCount: number;
}

interface BetaManagementProps {
  getAuthToken: () => Promise<string>;
}

export function BetaManagement({ getAuthToken }: BetaManagementProps) {
  const [tokens, setTokens] = useState<BetaToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTokenAssignedTo, setNewTokenAssignedTo] = useState("");
  
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/superadmin/beta-tokens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
      } else {
        addToast({ title: "Error al cargar tokens beta", color: "danger" });
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
      addToast({ title: "Error de conexión", color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = async () => {
    if (!newTokenAssignedTo.trim()) {
      addToast({ title: "Ingresa a quién se le asignará el token", color: "warning" });
      return;
    }

    setIsGenerating(true);
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/superadmin/beta-tokens", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assignedTo: newTokenAssignedTo }),
      });

      if (response.ok) {
        addToast({ title: "Token generado con éxito", color: "success" });
        setNewTokenAssignedTo("");
        onClose();
        fetchTokens();
      } else {
        addToast({ title: "Error al generar token", color: "danger" });
      }
    } catch (error) {
      console.error("Error generating token:", error);
      addToast({ title: "Error de conexión", color: "danger" });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTokenStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/superadmin/beta-tokens/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        addToast({ title: `Token ${!currentStatus ? "activado" : "desactivado"}`, color: "success" });
        fetchTokens();
      } else {
        addToast({ title: "Error al actualizar token", color: "danger" });
      }
    } catch (error) {
      console.error("Error updating token:", error);
      addToast({ title: "Error de conexión", color: "danger" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "Token copiado al portapapeles", color: "success" });
  };

  const filteredTokens = tokens.filter(
    (t) =>
      t.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = date.seconds ? new Date(date.seconds * 1000) : new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Accesos Beta
          </h2>
          <p className="text-gray-500 text-sm">
            Gestiona quién puede entrar a la demo privada del sistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="bordered"
            startContent={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
            onPress={fetchTokens}
            isDisabled={isLoading}
          >
            Actualizar
          </Button>
          <Button
            color="success"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onOpen}
            className="text-white font-bold"
          >
            Generar Token
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardBody className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50">
            <Input
              isClearable
              className="w-full md:max-w-xs"
              placeholder="Buscar por token o persona..."
              startContent={<Search className="text-gray-400 w-4 h-4" />}
              value={searchTerm}
              onValueChange={setSearchTerm}
              variant="bordered"
              size="sm"
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{tokens.filter(t => t.active).length} Activos</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>{tokens.filter(t => !t.active).length} Revocados</span>
              </div>
            </div>
          </div>

          <Table
            aria-label="Tabla de tokens beta"
            removeWrapper
            className="min-h-[200px]"
          >
            <TableHeader>
              <TableColumn>TOKEN</TableColumn>
              <TableColumn>ASIGNADO A</TableColumn>
              <TableColumn>ESTADO</TableColumn>
              <TableColumn>USOS</TableColumn>
              <TableColumn>ÚLTIMO USO</TableColumn>
              <TableColumn align="center">ACCIONES</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<RefreshCw className="animate-spin" />}
              emptyContent={!isLoading && "No se encontraron tokens."}
            >
              {filteredTokens.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono font-bold text-gray-700">
                        {item.token}
                      </code>
                      <Tooltip content="Copiar Token">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => copyToClipboard(item.token)}
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{item.assignedTo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={item.active ? "success" : "danger"}
                      size="sm"
                      variant="flat"
                      startContent={item.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    >
                      {item.active ? "Activo" : "Revocado"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{item.usageCount || 0}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(item.lastUsed)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Tooltip content={item.active ? "Desactivar" : "Activar"}>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color={item.active ? "warning" : "success"}
                          onPress={() => toggleTokenStatus(item.id, item.active)}
                        >
                          {item.active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </Button>
                      </Tooltip>
                      <Tooltip content="Eliminar Permanentemente" color="danger">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          color="danger"
                          onPress={() => {
                            if (window.confirm("¿Seguro que quieres eliminar este token?")) {
                              // Podríamos añadir delete en el futuro
                              toggleTokenStatus(item.id, true); // Por ahora solo desactivamos
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Modal Generar Token */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
        radius="lg"
        classNames={{
          header: "border-b border-gray-100",
          footer: "border-t border-gray-100",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Generar Nuevo Token Beta
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Se generará un código único aleatorio que podrás compartir.
                  </p>
                  <Input
                    label="Asignar a"
                    placeholder="Ej: Gerardo - Inversionista Angel"
                    variant="bordered"
                    value={newTokenAssignedTo}
                    onValueChange={setNewTokenAssignedTo}
                    autoFocus
                  />
                  <div className="p-3 bg-[#0e3a45]/[0.06] text-[#0e3a45] text-xs rounded-lg border border-[#0e3a45]/20">
                    <strong>Nota:</strong> El token será de formato
                    <code className="mx-1 bg-[#0e3a45]/[0.08] px-1 rounded">BETA-XXXX-XXXX</code>
                    y permitirá accesos múltiples desde cualquier dispositivo hasta que sea revocado.
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  color="success" 
                  className="text-white font-bold"
                  onPress={generateToken}
                  isLoading={isGenerating}
                >
                  Generar Acceso
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
