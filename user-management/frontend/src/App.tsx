// Каркас приложения: страница входа или рабочая область с двумя вкладками.
import { useState } from "react";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";

type Tab = "home" | "users";

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("home");

  if (loading) return null;
  if (!user) return <Login />;

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          Команда
        </div>
        <nav className="tabs">
          <button className={tab === "home" ? "tab active" : "tab"} onClick={() => setTab("home")}>
            Главная
          </button>
          <button className={tab === "users" ? "tab active" : "tab"} onClick={() => setTab("users")}>
            Пользователи
          </button>
        </nav>
        <div className="account">
          <span className="account-name">{user.full_name}</span>
          <button className="btn ghost" onClick={signOut}>
            Выйти
          </button>
        </div>
      </header>
      <main className="content">{tab === "home" ? <Home /> : <Users />}</main>
    </div>
  );
}
