import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TestPage() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>
        Ouvrir
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
