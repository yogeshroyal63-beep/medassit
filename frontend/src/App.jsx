/**
 * Root application component — canonical entry point.
 * Imported by src/main.jsx. src/app/App.jsx is a re-export alias; do not add logic there.
 */
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./app/routes";
import { Providers } from "./app/providers";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./shared/components/ErrorBoundary";

const App = () => {
  return (
    <ErrorBoundary>
      <Providers>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </Providers>
    </ErrorBoundary>
  );
};

export default App;