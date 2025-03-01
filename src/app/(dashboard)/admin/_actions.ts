'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

import { checkRole } from '@/utils/roles';

export async function setRole(formData: FormData) {
  const client = await clerkClient();

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    throw new Error('Not Authorized');
  }

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    });

    // Revalidate the admin page to refresh the data
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error setting role:', error);
    throw new Error('Failed to set role');
  }
}

export async function removeRole(formData: FormData) {
  const client = await clerkClient();

  // Check that the user trying to remove the role is an admin
  if (!checkRole('admin')) {
    throw new Error('Not Authorized');
  }

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: undefined },
    });

    // Revalidate the admin page to refresh the data
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error removing role:', error);
    throw new Error('Failed to remove role');
  }
}
