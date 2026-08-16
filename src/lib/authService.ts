import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut, 
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs
} from './firebase';

export interface AdminUser {
  uid: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt?: string;
  role?: string;
}

const ADMIN_STORAGE_KEY = 'leslie_store_admin_session';
const ADMIN_CREDENTIALS_DOC = 'admin_auth_config';
const SALT = 'leslie_store_salt_2026_cr';

// Default initial admin info
export const DEFAULT_ADMIN: AdminUser = {
  uid: 'admin_master_1',
  username: 'admin',
  email: 'kendallfwd@gmail.com',
  displayName: 'Administrador Leslie Store',
  role: 'superadmin'
};

// SHA-256 password hashing using native Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to resolve identifier (username or email)
export async function resolveEmailFromIdentifier(identifier: string): Promise<string> {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }

  // 1. Check Firestore stored credentials
  try {
    const credRef = doc(db, 'admin_settings', ADMIN_CREDENTIALS_DOC);
    const snap = await getDoc(credRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.username && data.username.toLowerCase() === clean && data.email) {
        return data.email;
      }
    }
  } catch (e) {
    console.warn('Could not read admin_settings:', e);
  }

  // 2. Check localStorage mapping
  try {
    const saved = localStorage.getItem('leslie_admin_username_map');
    if (saved) {
      const map = JSON.parse(saved);
      if (map[clean]) {
        return map[clean];
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback default
  if (clean === 'admin' || clean === 'kendall' || clean === 'leslie') {
    return DEFAULT_ADMIN.email;
  }

  return `${clean}@gmail.com`;
}

// In-database credentials check and update
export async function getStoredAdminCredentials() {
  try {
    const credRef = doc(db, 'admin_settings', ADMIN_CREDENTIALS_DOC);
    const snap = await getDoc(credRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.warn('Error fetching stored admin credentials from Firestore:', e);
  }

  try {
    const local = localStorage.getItem('leslie_store_admin_creds');
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function saveStoredAdminCredentials(creds: {
  username: string;
  email: string;
  passwordHash: string;
  updatedAt?: string;
}) {
  const data = {
    username: creds.username.toLowerCase().trim(),
    email: creds.email.toLowerCase().trim(),
    passwordHash: creds.passwordHash,
    updatedAt: new Date().toISOString()
  };

  try {
    const credRef = doc(db, 'admin_settings', ADMIN_CREDENTIALS_DOC);
    await setDoc(credRef, data, { merge: true });
  } catch (e) {
    console.warn('Could not save credentials to Firestore:', e);
  }

  try {
    localStorage.setItem('leslie_store_admin_creds', JSON.stringify(data));
    const map = { [data.username]: data.email };
    localStorage.setItem('leslie_admin_username_map', JSON.stringify(map));
  } catch (e) {
    // ignore
  }
}

// Main Login Function (Resilient Dual Auth)
export async function loginAdminUser(identifier: string, password: string): Promise<AdminUser> {
  const cleanId = identifier.trim().toLowerCase();
  const email = await resolveEmailFromIdentifier(cleanId);
  const passwordHash = await hashPassword(password);

  // 1. Try Firebase Auth (if enabled on the Firebase console)
  let firebaseAuthSuccess = false;
  let firebaseUser: any = null;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    firebaseUser = userCredential.user;
    firebaseAuthSuccess = true;
  } catch (firebaseErr: any) {
    const code = firebaseErr.code || '';
    // If it's an operation-not-allowed, user-not-found, invalid-credential or network issue,
    // we seamlessly verify against the Firestore / Local database credentials!
    console.info('Firebase auth note (falling back to database credentials if needed):', code);
  }

  if (firebaseAuthSuccess && firebaseUser) {
    const adminUser: AdminUser = {
      uid: firebaseUser.uid,
      username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: firebaseUser.email || email,
      displayName: 'Administrador Leslie Store'
    };
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  // 2. Database Credential Verification (Firestore & Local)
  const storedCreds = await getStoredAdminCredentials();

  if (!storedCreds) {
    // First time login: initialize the entered password as the active password
    await saveStoredAdminCredentials({
      username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: email,
      passwordHash: passwordHash
    });

    const adminUser: AdminUser = {
      uid: 'admin_' + Date.now(),
      username: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: email,
      displayName: 'Administrador Leslie Store'
    };

    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  // If credentials already exist, verify the username/email and passwordHash
  const isUsernameMatch = storedCreds.username === cleanId || storedCreds.email === cleanId || cleanId === 'admin' || cleanId === storedCreds.email;
  const isPasswordMatch = storedCreds.passwordHash === passwordHash;

  if (isUsernameMatch && isPasswordMatch) {
    const adminUser: AdminUser = {
      uid: 'admin_master',
      username: storedCreds.username || cleanId,
      email: storedCreds.email || email,
      displayName: 'Administrador Leslie Store'
    };

    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  if (!isPasswordMatch) {
    throw new Error('La contraseña ingresada es incorrecta. Si la olvidaste, puedes usar el botón de recuperación por correo electrónico.');
  }

  throw new Error('Usuario o correo no autorizado para el panel de administración.');
}

// Request Password Reset by Official Email
export async function requestPasswordReset(identifierOrEmail: string): Promise<{ 
  success: boolean; 
  email: string; 
  code: string;
  gmailComposeUrl: string;
  gmailInboxUrl: string;
  message: string; 
}> {
  const email = await resolveEmailFromIdentifier(identifierOrEmail);

  // 1. Generate a secure 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

  // 2. Save securely to Firestore database in 'admin_password_resets'
  try {
    await setDoc(doc(db, 'admin_password_resets', code), {
      code: code,
      email: email,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      used: false
    });
  } catch (e) {
    console.warn('Could not record reset event in Firestore:', e);
  }

  // 3. Save to local storage cache as backup
  try {
    localStorage.setItem('leslie_active_reset_code', JSON.stringify({
      code: code,
      email: email,
      expiresAt: expiresAt
    }));
  } catch (e) {
    // ignore
  }

  // 4. Try native Firebase Auth Password Reset Email
  let firebaseResetSent = false;
  try {
    await sendPasswordResetEmail(auth, email);
    firebaseResetSent = true;
  } catch (err: any) {
    const errCode = err.code || '';
    console.info('Firebase sendPasswordResetEmail attempt:', errCode);

    if (errCode === 'auth/user-not-found' || errCode === 'auth/invalid-credential') {
      try {
        const tempPass = 'LeslieAuth_' + Math.random().toString(36).slice(2) + '!' + Date.now();
        await createUserWithEmailAndPassword(auth, email, tempPass);
        await sendPasswordResetEmail(auth, email);
        firebaseResetSent = true;
      } catch (createErr: any) {
        console.warn('Could not auto-provision in Firebase Auth:', createErr);
      }
    }
  }

  // 5. Construct Gmail direct compose & search links
  const emailSubject = encodeURIComponent(`Código de Restablecimiento Leslie Store: ${code}`);
  const emailBody = encodeURIComponent(
    `Hola Kendall,\n\nHas solicitado restablecer la contraseña del Panel Administrativo de Leslie Store.\n\n` +
    `🔑 TU CÓDIGO DE SEGURIDAD ES: ${code}\n\n` +
    `Introduce este código de 6 dígitos en la pantalla de Leslie Store junto con tu nueva contraseña para completar el restablecimiento.\n\n` +
    `Fecha y hora: ${new Date().toLocaleString('es-CR')}\n` +
    `Tienda: Leslie Store - El Roble, Puntarenas\n`
  );

  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${emailSubject}&body=${emailBody}`;
  const gmailInboxUrl = `https://mail.google.com/mail/u/0/#search/Leslie+Store+or+Firebase+or+${code}`;

  return {
    success: true,
    email,
    code,
    gmailComposeUrl,
    gmailInboxUrl,
    message: `Código de seguridad ${code} generado para ${email}. Revisa tu Gmail o pulsa el botón directo para acceder a la notificación.`
  };
}

// Verify code from Gmail and update password in Firestore
export async function verifyResetCodeAndSetPassword(
  codeEntered: string, 
  newPassword: string,
  emailOrIdentifier?: string
): Promise<{ success: boolean; admin: AdminUser }> {
  const cleanCode = codeEntered.trim();
  if (!cleanCode || cleanCode.length < 5) {
    throw new Error('Por favor ingresa el código de seguridad válido de 6 dígitos.');
  }

  if (!newPassword || newPassword.length < 4) {
    throw new Error('La nueva contraseña debe tener al menos 4 caracteres.');
  }

  let codeValid = false;
  let targetEmail = emailOrIdentifier ? await resolveEmailFromIdentifier(emailOrIdentifier) : DEFAULT_ADMIN.email;

  // 1. Check Firestore
  try {
    const codeRef = doc(db, 'admin_password_resets', cleanCode);
    const snap = await getDoc(codeRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data.used) {
        const isNotExpired = new Date(data.expiresAt) > new Date();
        if (isNotExpired) {
          codeValid = true;
          if (data.email) targetEmail = data.email;
          // Mark code as used
          await setDoc(codeRef, { used: true, usedAt: new Date().toISOString() }, { merge: true });
        } else {
          throw new Error('El código de seguridad ha expirado. Por favor solicita uno nuevo.');
        }
      } else {
        throw new Error('Este código de seguridad ya fue utilizado previamente.');
      }
    }
  } catch (e: any) {
    if (e.message && e.message.includes('expirado')) throw e;
    if (e.message && e.message.includes('utilizado')) throw e;
    console.warn('Firestore code check note:', e);
  }

  // 2. Check local storage fallback
  if (!codeValid) {
    try {
      const local = localStorage.getItem('leslie_active_reset_code');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.code === cleanCode) {
          const isNotExpired = new Date(parsed.expiresAt) > new Date();
          if (isNotExpired) {
            codeValid = true;
            if (parsed.email) targetEmail = parsed.email;
            localStorage.removeItem('leslie_active_reset_code');
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (!codeValid) {
    throw new Error('Código de seguridad incorrecto. Verifica el código enviado a tu cuenta de Gmail.');
  }

  // 3. Hash and save the new password to Firestore & local storage
  const passwordHash = await hashPassword(newPassword);
  const currentCreds = await getStoredAdminCredentials();
  const username = currentCreds?.username || 'admin';

  await saveStoredAdminCredentials({
    username: username,
    email: targetEmail,
    passwordHash: passwordHash
  });

  const adminUser: AdminUser = {
    uid: 'admin_master_' + Date.now(),
    username: username,
    email: targetEmail,
    displayName: 'Administrador Leslie Store'
  };

  sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));

  return { success: true, admin: adminUser };
}

// Log out Admin
export async function logoutAdminUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  sessionStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

// Check current authenticated session
export function getCurrentAdminSession(): AdminUser | null {
  try {
    const session = sessionStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(ADMIN_STORAGE_KEY);
    if (session) {
      return JSON.parse(session);
    }
  } catch (e) {
    // ignore
  }
  return null;
}
