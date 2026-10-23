import { FormEvent, useEffect, useState } from "react";

type Person = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  congregation: "english" | "renova";
};

type PlanningPerson = { id: string; firstName: string; lastName: string };

type PlanningPreview =
  | { configured: false }
  | { configured: true; ok: false; status: number }
  | { configured: true; ok: true; totalCount: number; people: PlanningPerson[] };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "No se pudo completar la solicitud");
  }
  return response.json() as Promise<T>;
}

export function App() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api<{ email: string }>("/api/auth/me")
      .then((me) => setEmail(me.email))
      .catch(() => setEmail(null))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return <main className="grid min-h-screen place-items-center text-stone-500">Cargando…</main>;
  }

  return email ? <Directory email={email} onLogout={() => setEmail(null)} /> : <Login onSuccess={setEmail} />;
}

function Login({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await api<{ email: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onSuccess(result.email);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo entrar");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-emerald-800">Greenville Oaks Church</p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900">GO Hub</h1>
        <p className="mt-2 text-sm text-stone-600">El directorio es privado. Entra para ver la información.</p>
        <label className="mt-6 block text-sm font-medium text-stone-700">
          Correo
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-stone-700">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

function Directory({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [planning, setPlanning] = useState<PlanningPreview | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [congregation, setCongregation] = useState<"english" | "renova">("english");

  async function load() {
    const [preview, directory] = await Promise.all([
      api<PlanningPreview>("/api/planning-center/people"),
      api<{ people: Person[] }>("/api/people"),
    ]);
    setPlanning(preview);
    setPeople(directory.people);
  }

  useEffect(() => {
    load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Error"));
  }, []);

  async function logout() {
    await api("/api/auth/logout", { method: "POST", body: "{}" });
    onLogout();
  }

  async function addPerson(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/api/people", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email: personEmail, phone, congregation }),
      });
      setFirstName("");
      setLastName("");
      setPersonEmail("");
      setPhone("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo guardar");
    }
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <header className="flex items-center justify-between bg-emerald-900 px-6 py-4 text-white">
        <div>
          <p className="text-sm text-emerald-100">Greenville Oaks Church</p>
          <h1 className="text-xl font-semibold">GO Hub</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>{email}</span>
          <button type="button" onClick={logout} className="rounded-lg bg-white/10 px-3 py-1">
            Salir
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Planning Center</h2>
          {planning?.configured && planning.ok ? (
            <>
              <p className="mt-2 text-sm text-stone-600">{planning.totalCount} personas en People.</p>
              <ul className="mt-4 divide-y divide-stone-100">
                {planning.people.map((person) => (
                  <li key={person.id} className="py-2 text-sm">
                    {person.firstName} {person.lastName}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-stone-600">No se pudo leer Planning Center.</p>
          )}
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Agregar en GO Hub</h2>
          <form onSubmit={addPerson} className="mt-4 grid gap-3">
            <input className="rounded-lg border px-3 py-2" placeholder="Nombre" value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
            <input className="rounded-lg border px-3 py-2" placeholder="Apellido" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
            <input className="rounded-lg border px-3 py-2" placeholder="Correo" value={personEmail} onChange={(event) => setPersonEmail(event.target.value)} />
            <input className="rounded-lg border px-3 py-2" placeholder="Teléfono" value={phone} onChange={(event) => setPhone(event.target.value)} />
            <select className="rounded-lg border px-3 py-2" value={congregation} onChange={(event) => setCongregation(event.target.value as "english" | "renova")}>
              <option value="english">English Campus</option>
              <option value="renova">GO ReNova</option>
            </select>
            <button className="rounded-lg bg-emerald-800 px-4 py-2 font-medium text-white" type="submit">
              Guardar
            </button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          <ul className="mt-4 divide-y divide-stone-100">
            {people.map((person) => (
              <li key={person.id} className="py-2 text-sm">
                {person.first_name} {person.last_name}
                <span className="ml-2 text-stone-500">{person.congregation === "english" ? "English" : "ReNova"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
