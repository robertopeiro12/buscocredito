export interface AdminAccount {
    Empresa: string
    Empresa_id: string
    Nombre: string
    email: string
    type: "b_sale" | "b_admin"
    id?: string
  }
  
  export interface Notification {
    type: "success" | "error"
    message: string
    show: boolean
  }
  
  