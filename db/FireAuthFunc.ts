import "server-only"
import { getAuth } from "firebase-admin/auth"

export const create_subaccount = async (
  name: string,
  email: string,
  password: string,
): Promise<{ status: number; error?: string; userId?: string }> => {
  try {
    const auth = getAuth()

    const userRecord = await auth.createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: name,
      disabled: false,
    })
    return { userId: userRecord.uid, status: 200 }
  } catch (error: any) {
    console.error("Error creating new user:", error)
    return { error: error.message, status: 500 }
  }
}

export async function delete_subaccount(userId: string) {
  try {
    const auth = getAuth()
    await auth.deleteUser(userId)
    return { status: 200, message: "Usuario eliminado correctamente" }
  } catch (error: any) {
    console.error("Error al eliminar usuario en Authentication:", error)
    return {
      status: 500,
      error: `Error al eliminar usuario en Authentication: ${error.message}`,
    }
  }
}

