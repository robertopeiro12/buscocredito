import "server-only";
import { getAuth } from "firebase-admin/auth"

export const create_subaccount = async (name: string, email: string, password: string): Promise<{ status: number, error?: string, userId?: string }> => {

try{
const auth = getAuth();

const userRecord = await auth.createUser({
    email: email,
    emailVerified: false,
    password: password,
    displayName: name,
    disabled: false
});
    console.log('Successfully created new user:', userRecord.uid);
    return { userId: userRecord.uid, status: 200 };
}catch(error){
    console.log('Error creating new user:', error);
    return { error: error.message, status: 500 };
}

}
// Añadir a FireAuthFunc.ts

export const delete_auth_user = async (email: string): Promise<{ status: number, error?: string }> => {
    try {
        const auth = getAuth();
        
        // Primero obtenemos el usuario por email
        const userRecord = await auth.getUserByEmail(email);
        // Luego lo eliminamos usando su UID
        await auth.deleteUser(userRecord.uid);
        
        console.log('Successfully deleted user:', email);
        return { status: 200 };
    } catch (error) {
        console.log('Error deleting user:', error);
        return { error: error.message, status: 500 };
    }
}
