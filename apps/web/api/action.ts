'use server';

import { revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';

export default async function revalidate(tag: string) {
  revalidateTag(tag);
}

export async function deleteCookie(name: string) {
  'use server';
  cookies().delete(name);
}
