// Страница входа.
import { FormEvent, useState } from "react";
import { useAuth } from "../auth";

export default function Login() {
  const { signIn } = useAuth();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(login.trim(), password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="brand large">
          <span className="brand-mark" />
          Команда
        </div>
        <h1>Вход в систему</h1>
        <p className="muted">Введите логин и пароль, чтобы продолжить.</p>
        <label className="field">
          Логин
          <input value={login} onChange={(e) => setLogin(e.target.value)} autoFocus required />
        </label>
        <label className="field">
          Пароль
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="alert">{error}</div>}
        <button className="btn primary wide" disabled={busy}>
          {busy ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
