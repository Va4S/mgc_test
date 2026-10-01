// Окно создания и редактирования пользователя.
import { FormEvent, useState } from "react";
import { api, Role, User } from "../api";

interface Props {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function UserModal({ user, onClose, onSaved }: Props) {
  const [login, setLogin] = useState(user?.login ?? "");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "employee");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (user) {
        await api.updateUser(user.id, {
          login,
          full_name: fullName,
          role,
          ...(password ? { password } : {}),
        });
      } else {
        await api.createUser({ login, full_name: fullName, role, password });
      }
      onSaved();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{user ? "Изменить пользователя" : "Новый пользователь"}</h2>
        <label className="field">
          Имя
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />
        </label>
        <label className="field">
          Логин
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            minLength={3}
            maxLength={50}
            pattern="[A-Za-z0-9_.\-]+"
            title="Латинские буквы, цифры и символы _ . -"
            required
          />
        </label>
        <label className="field">
          Роль
          <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="employee">Сотрудник</option>
            <option value="admin">Администратор</option>
          </select>
        </label>
        <label className="field">
          {user ? "Новый пароль" : "Пароль"}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={72}
            placeholder={user ? "Оставьте пустым, чтобы не менять" : "Не короче 8 символов"}
            required={!user}
          />
        </label>
        {error && <div className="alert">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn primary" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
