// Основная страница: приветствие и сведения о текущем пользователе.
import { useAuth } from "../auth";

export default function Home() {
  const { user } = useAuth();
  if (!user) return null;
  const isAdmin = user.role === "admin";

  return (
    <section className="hero">
      <h1>Здравствуйте, {user.full_name}</h1>
      <p className="muted">
        {isAdmin
          ? "У вас полный доступ: на вкладке «Пользователи» можно добавлять, изменять и удалять учётные записи."
          : "На вкладке «Пользователи» вы можете посмотреть список коллег."}
      </p>
      <dl className="facts">
        <div>
          <dt>Логин</dt>
          <dd>{user.login}</dd>
        </div>
        <div>
          <dt>Роль</dt>
          <dd>{isAdmin ? "Администратор" : "Сотрудник"}</dd>
        </div>
        <div>
          <dt>В системе с</dt>
          <dd>{new Date(user.created_at).toLocaleDateString("ru-RU")}</dd>
        </div>
      </dl>
    </section>
  );
}
