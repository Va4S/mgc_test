// Список пользователей: поиск, постраничный вывод и управление для администратора.
import { useCallback, useEffect, useState } from "react";
import { api, User } from "../api";
import { useAuth } from "../auth";
import UserModal from "../components/UserModal";

const PAGE_SIZE = 20;

export default function Users() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";

  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [removing, setRemoving] = useState<User | null>(null);

  // Поиск запускается через небольшую паузу после ввода
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.users(page, PAGE_SIZE, search);
      setItems(result.items);
      setTotal(result.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await api.deleteUser(removing.id);
      setRemoving(null);
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      setError((e as Error).message);
      setRemoving(null);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Пользователи</h1>
          <p className="muted">Всего: {total}</p>
        </div>
        {isAdmin && (
          <button className="btn primary" onClick={() => setEditing("new")}>
            Добавить пользователя
          </button>
        )}
      </div>

      <input
        className="search"
        placeholder="Поиск по имени или логину"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />

      {error && <div className="alert">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Логин</th>
              <th>Роль</th>
              <th>Создан</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody className={loading ? "loading" : ""}>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td className="muted">{u.login}</td>
                <td>
                  <span className={`badge ${u.role}`}>
                    {u.role === "admin" ? "Администратор" : "Сотрудник"}
                  </span>
                </td>
                <td className="muted">{new Date(u.created_at).toLocaleDateString("ru-RU")}</td>
                {isAdmin && (
                  <td className="actions">
                    <button className="btn ghost small" onClick={() => setEditing(u)}>
                      Изменить
                    </button>
                    <button
                      className="btn ghost small danger"
                      disabled={u.id === me?.id}
                      onClick={() => setRemoving(u)}
                    >
                      Удалить
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  {search ? "Никого не нашли. Попробуйте изменить запрос." : "Пользователей пока нет."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn ghost small" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Назад
        </button>
        <span className="muted">
          Страница {page} из {pages}
        </span>
        <button
          className="btn ghost small"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          Вперёд
        </button>
      </div>

      {editing && (
        <UserModal
          user={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {removing && (
        <div className="overlay" onClick={() => setRemoving(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Удалить пользователя?</h2>
            <p className="muted">
              Учётная запись «{removing.full_name}» будет удалена без возможности восстановления.
            </p>
            <div className="modal-actions">
              <button className="btn ghost" onClick={() => setRemoving(null)}>
                Отмена
              </button>
              <button className="btn danger-solid" onClick={confirmRemove}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
