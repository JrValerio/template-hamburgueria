import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";
import { OffersPage } from "./pages/OffersPage";
import { DeliveryPage } from "./pages/DeliveryPage";
import { ContactPage } from "./pages/ContactPage";
import "./styles/index.scss";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/cardapio" element={<MenuPage />} />
          <Route path="/ofertas" element={<OffersPage />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/contato" element={<ContactPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
