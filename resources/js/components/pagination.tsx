import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Paginated } from '@/types';

interface PaginationProps<T> {
  data: Paginated<T>;
  perPageOptions?: number[];
}

export function Pagination<T>({ data, perPageOptions = [5, 10, 25] }: PaginationProps<T>) {
  const { current_page, last_page, per_page, from, to, total } = data;

  const handlePageChange = (url: string | null) => {
    if (url) {
      router.get(url, {}, { preserveState: true, preserveScroll: true });
    }
  };

  const handlePerPageChange = (value: string) => {
    const newPerPage = parseInt(value, 10);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('per_page', newPerPage.toString());
    currentUrl.searchParams.set('page', '1'); // Reset to first page
    router.get(currentUrl.toString(), {}, { preserveState: true, preserveScroll: true });
  };

  if (total === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Mostrando <span className="font-medium text-foreground">{from}</span> a{' '}
          <span className="font-medium text-foreground">{to}</span> de{' '}
          <span className="font-medium text-foreground">{total}</span> resultados
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Por página:</span>
          <Select value={per_page.toString()} onValueChange={handlePerPageChange}>
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handlePageChange(data.prev_page_url)}
            disabled={!data.prev_page_url}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>

          <div className="flex items-center gap-1 px-2">
            <span className="text-sm font-medium">
              {current_page} de {last_page}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => handlePageChange(data.next_page_url)}
            disabled={!data.next_page_url}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Página siguiente</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

