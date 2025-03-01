import { clerkClient } from '@clerk/nextjs/server';

import { removeRole, setRole } from './_actions';
import { SearchUsers } from './search-users';

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  // Role check moved to layout

  const searchParams = await params.searchParams;
  const query = searchParams.search;

  const client = await clerkClient();

  // Fetch all users if no query is provided, otherwise fetch by search
  const userList = await client.users.getUserList({
    limit: 3, // Set a reasonable limit
    ...(query ? { query } : {}),
  });

  const users = userList.data;

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-semibold">Permissões de Usuários</h2>
      <SearchUsers />

      {query && (
        <div className="mt-4 px-1">
          <p className="text-muted-foreground text-sm">
            {users.length > 0
              ? `Encontrados ${users.length} usuário${users.length === 1 ? '' : 's'} correspondentes a &ldquo;${query}&rdquo;`
              : `Nenhum usuário encontrado correspondente a &ldquo;${query}&rdquo;`}
          </p>
        </div>
      )}

      {!query && (
        <div className="mt-4 px-1">
          <p className="text-muted-foreground text-sm">
            Mostrando todos os {users.length} usuário
            {users.length === 1 ? '' : 's'}
          </p>
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map(user => {
            const email = user.emailAddresses.find(
              email => email.id === user.primaryEmailAddressId,
            )?.emailAddress;
            const role = user.publicMetadata.role as string;

            return (
              <div
                key={user.id}
                className="rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  {user.imageUrl && (
                    <img
                      src={user.imageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-muted-foreground text-wrap">{email}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    Cargo Atual:
                  </span>
                  <span
                    className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      role === 'admin'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
                    }`}
                  >
                    {role || 'None'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <form action={setRole}>
                    <input type="hidden" value={user.id} name="id" />
                    <input type="hidden" value="admin" name="role" />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center rounded-md border border-transparent bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                      disabled={role === 'admin'}
                    >
                      Tornar Admin
                    </button>
                  </form>

                  <form action={setRole}>
                    <input type="hidden" value={user.id} name="id" />
                    <input type="hidden" value="moderator" name="role" />
                    <button
                      type="submit"
                      className="hover:bg-muted inline-flex h-8 items-center rounded-md border px-3 text-xs font-medium focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                      disabled={role === 'moderator'}
                    >
                      Tornar Moderador
                    </button>
                  </form>

                  <form action={removeRole}>
                    <input type="hidden" value={user.id} name="id" />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center rounded-md border border-red-200 px-3 text-xs font-medium text-red-900 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:border-red-900/30 dark:text-red-600 dark:hover:bg-red-900/20"
                      disabled={!role}
                    >
                      Remover Cargo
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
