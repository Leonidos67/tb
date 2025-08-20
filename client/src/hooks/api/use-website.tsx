import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  createWebsiteMutationFn, 
  getWebsiteByUsernameQueryFn, 
  updateWebsiteMutationFn, 
  deleteWebsiteMutationFn 
} from '@/lib/api';
import { CreateWebsiteType } from '@/types/api.type';
import { useToast } from '@/hooks/use-toast';

export const useCreateWebsite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createWebsiteMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Успешно!",
        description: "Ваш сайт создан и доступен по ссылке",
      });
      
      // Инвалидировать кеш для обновления списка сайтов
      queryClient.invalidateQueries({ queryKey: ['website'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сайт. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  });
};

export const useGetWebsiteByUsername = (username: string) => {
  return useQuery({
    queryKey: ['website', username],
    queryFn: () => getWebsiteByUsernameQueryFn(username),
    enabled: !!username,
  });
};

export const useUpdateWebsite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateWebsiteMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Успешно!",
        description: "Ваш сайт обновлен",
      });
      
      // Инвалидировать кеш для обновления данных сайта
      queryClient.invalidateQueries({ queryKey: ['website'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить сайт. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  });
};

export const useDeleteWebsite = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteWebsiteMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Успешно!",
        description: "Ваш сайт удален",
      });
      
      // Инвалидировать кеш для обновления списка сайтов
      queryClient.invalidateQueries({ queryKey: ['website'] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сайт. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  });
};
