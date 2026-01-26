"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
} from "@heroui/react";
import { Plus, Trash2, Copy, Check, Key, RefreshCw } from "lucide-react";

interface Token {
  id: string;
  token: string;
  description: string;
  used: boolean;
  usedBy: string | null;
  usedByCompany: string | null;
  usedAt: string | null;
  createdAt: string;
}

export function TokenManagement() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [description, setDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/superadmin/tokens", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.tokens) {
        setTokens(data.tokens);
      }
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreateToken = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/superadmin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      if (data.success) {
        setNewToken(data.token);
        setDescription("");
        fetchTokens();
      }
    } catch (error) {
      console.error("Error creating token:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteToken = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/superadmin/tokens?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        fetchTokens();
      }
    } catch (error) {
      console.error("Error deleting token:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Tokens de Registro para Bancos
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="bordered"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={fetchTokens}
            isLoading={loading}
          >
            Actualizar
          </Button>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => setIsModalOpen(true)}
          >
            Crear Token
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Tokens Generados</h3>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay tokens generados</p>
              <p className="text-sm">Crea un token para que un banco pueda registrarse</p>
            </div>
          ) : (
            <Table aria-label="Tokens table">
              <TableHeader>
                <TableColumn>TOKEN</TableColumn>
                <TableColumn>DESCRIPCIÓN</TableColumn>
                <TableColumn>ESTADO</TableColumn>
                <TableColumn>USADO POR</TableColumn>
                <TableColumn>FECHA CREACIÓN</TableColumn>
                <TableColumn>ACCIONES</TableColumn>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {token.token.substring(0, 8)}...
                        </code>
                        <Tooltip content={copiedToken === token.token ? "¡Copiado!" : "Copiar token"}>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            onPress={() => copyToClipboard(token.token)}
                            isDisabled={token.used}
                          >
                            {copiedToken === token.token ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {token.description || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={token.used ? "default" : "success"}
                        variant="flat"
                      >
                        {token.used ? "Utilizado" : "Disponible"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {token.used ? (
                        <div className="text-sm">
                          <p className="font-medium">{token.usedByCompany || "N/A"}</p>
                          <p className="text-xs text-gray-500">{formatDate(token.usedAt)}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(token.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tooltip content="Eliminar token">
                        <Button
                          size="sm"
                          isIconOnly
                          variant="light"
                          color="danger"
                          onPress={() => handleDeleteToken(token.id)}
                          isLoading={deletingId === token.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Token Modal */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setNewToken(null);
        setDescription("");
      }}>
        <ModalContent>
          <ModalHeader>
            {newToken ? "Token Creado" : "Crear Nuevo Token"}
          </ModalHeader>
          <ModalBody>
            {newToken ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">
                    Token generado exitosamente. Cópialo ahora, no podrás verlo completo después.
                  </p>
                  <div className="flex items-center gap-2 bg-white p-3 rounded border">
                    <code className="flex-1 text-sm font-mono break-all">
                      {newToken}
                    </code>
                    <Button
                      size="sm"
                      isIconOnly
                      variant="light"
                      onPress={() => copyToClipboard(newToken)}
                    >
                      {copiedToken === newToken ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Genera un token único para que un banco pueda registrarse en la plataforma.
                  El token solo podrá ser utilizado una vez.
                </p>
                <Input
                  label="Descripción (opcional)"
                  placeholder="Ej: Token para Banco XYZ"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {newToken ? (
              <Button
                color="primary"
                onPress={() => {
                  setIsModalOpen(false);
                  setNewToken(null);
                }}
              >
                Cerrar
              </Button>
            ) : (
              <>
                <Button variant="light" onPress={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateToken}
                  isLoading={creating}
                >
                  Generar Token
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
