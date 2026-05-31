import { redirect } from 'next/navigation';

export default function SuperAdminRedirect() {
  redirect('/super-admin/dashboard');
}
