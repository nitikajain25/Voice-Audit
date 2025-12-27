import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { app } from "./firebaseConfig";

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider("YOUR_RECAPTCHA_SITE_KEY"),
  isTokenAutoRefreshEnabled: true
});
