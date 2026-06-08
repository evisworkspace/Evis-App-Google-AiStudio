import { initializeApp } from "firebase/app";
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserPopupRedirectResolver, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});

const provider = new GoogleAuthProvider();
// Request Workspace scopes
provider.addScope("https://www.googleapis.com/auth/drive.file");
provider.addScope("https://www.googleapis.com/auth/calendar");
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/gmail.send");

let isSigningIn = false;
let signInPromise: Promise<{ user: User; accessToken: string } | null> | null = null;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (isSigningIn) {
    if (signInPromise) {
      return signInPromise;
    }
    return null;
  }

  isSigningIn = true;
  signInPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error("Failed to get access token from Firebase Auth");
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
      if (
        error.code === 'auth/cancelled-popup-request' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.message?.includes("cancelled-popup") ||
        error.message?.includes("closed-by-user")
      ) {
        console.warn("User closed the sign-in popup.");
        return null;
      }
      console.error("Sign in error:", error);
      throw error;
    } finally {
      isSigningIn = false;
      signInPromise = null;
    }
  })();

  return signInPromise;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
