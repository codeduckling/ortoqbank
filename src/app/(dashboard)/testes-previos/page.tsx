import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { TestesPreviosClient } from './_components/testes-previos-client';

export default async function TestesPreviosPage() {
  // Handle authentication at the server level
  const user = await currentUser();

  // If not authenticated, redirect to sign-in
  if (!user) {
    redirect('/sign-in');
  }

  // Only render the client component for authenticated users
  return <TestesPreviosClient />;
}
