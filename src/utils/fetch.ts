import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import axiosInstance from "./axiosInstance";

type NotificationResponse = {
  notifications: any[];
  totalPages: number;
};

// export const useFetch = <TData = unknown | any>(
//   queryKey: string[],
//   url: string,
//   params?: any,
//   enabled: boolean = true,
// ): {
//   data: TData | undefined;
//   error: unknown;
//   isPending: boolean;
//   refetch: () => void;
// } => {
//   const urlBase = params ? `${url}/${params}` : url;

//   const { data, error, isPending, refetch }: UseQueryResult<TData> = useQuery({
//     queryKey,
//     queryFn: async () => {
//       const res = await axiosInstance.get(`/${urlBase}`);
//       return res.data;
//     },
//     enabled,
//   });

//   return { data, error, isPending, refetch };
// };

export const useFetch = <TData = unknown | any>(
  queryKey: string[],
  url: string,
  options?: {
    params?: any;
    enabled?: boolean;
  },
): {
  data: TData | undefined;
  error: unknown;
  isPending: boolean;
  refetch: () => void;
} => {
  const urlBase = options?.params ? `${url}/${options.params}` : url;

  const { data, error, isPending, refetch }: UseQueryResult<TData> = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await axiosInstance.get(`/${urlBase}`);
      return res.data;
    },
    enabled: options?.enabled ?? true,
  });

  return { data, error, isPending, refetch };
};

export const useInfinity = (queryKey: string[], url: string, limit = 10) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey,
      initialPageParam: 1,
      queryFn: async ({ pageParam }) => {
        const res = await axiosInstance.get<NotificationResponse>(
          `/${url}?page=${pageParam}&limit=${limit}`,
        );

        return {
          notifications: res.data.notifications,
          nextPage: pageParam < res.data.totalPages ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};

export const useMutationPost = (queries: string[], url: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isError, isSuccess } = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post(`/${url}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries });
    },
    onError: (error: any) => {
      console.log("Erro na mutation POST:", error.response?.data);
    },
  });

  return { mutateAsync, isPending, isError, isSuccess };
};
export const useMutationPatch = (queries: string[], url: string) => {
  const queryClient = useQueryClient();

  const {
    mutateAsync: mutateAsyncPatch,
    isPending,
    isSuccess,
    isError,
  } = useMutation({
    mutationFn: async (data: { urlParams?: string; id: string; body: any }) => {
      const urlBase = data.urlParams
        ? `${url}/${data.id}/${data.urlParams}`
        : `${url}/${data.id}`;

      const res = await axiosInstance.patch(`/${urlBase}`, data.body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries });
    },
    onError: (error) => {
      console.log("Erro na mutation PATCH:", error);
    },
  });

  return { mutateAsyncPatch, isPending, isSuccess, isError };
};

export const useMutationDel = (queries: string[], url: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync: mutateAsyncDel, isPending } = useMutation({
    mutationFn: async (id: any) => {
      const res = await axiosInstance.delete(`/${url}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queries });
    },
    onError: (error) => {
      throw error;
      // console.log("Erro na mutation DEL:", error);
    },
  });

  return { mutateAsyncDel, isPending };
};
