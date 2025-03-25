import React from 'react'
import useAxiosPublic from './useAxiosPublic'
import { useQuery } from '@tanstack/react-query';

const useRent = () => {
    const axiosPublic = useAxiosPublic();

    const {data: rent =[], isPending: loading, refetch} = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const res = await axiosPublic.get('/rent');
            console.log(res.data)
            return res.data;
          },
    })

  return [rent, loading, refetch]
}

export default useRent