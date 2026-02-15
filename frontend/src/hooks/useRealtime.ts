import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function useSubscribeToAlerts() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'alerts',
                },
                (payload) => {
                    console.log('New alert received!', payload);
                    // Invalidate and refetch
                    queryClient.invalidateQueries({ queryKey: ['activeAlerts'] });

                    toast('New Emergency Alert!', {
                        description: 'A new SOS alert has been triggered.',
                        action: {
                            label: 'View',
                            onClick: () => window.scrollTo(0, 0),
                        },
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}

export function useSubscribeToReports() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('schema-db-changes-reports')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'incident_reports',
                },
                (payload) => {
                    console.log('New report received!', payload);
                    queryClient.invalidateQueries({ queryKey: ['latestIncidents'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
