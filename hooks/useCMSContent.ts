import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCMSContent<T>(slug: string, initialData: T): { data: T, loading: boolean, error: string | null } {
    const [data, setData] = useState<T>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchContent = async () => {
            try {
                const { data: cmsData, error: cmsError } = await (supabase.from('cms_content') as any)
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (cmsError && cmsError.code !== 'PGRST116') throw cmsError;

                if (isMounted && cmsData && cmsData.body) {
                    setData(typeof cmsData.body === 'string' ? JSON.parse(cmsData.body) : cmsData.body);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error(`Error fetching CMS content for ${slug}:`, err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchContent();

        return () => {
            isMounted = false;
        };
    }, [slug]);

    return { data, loading, error };
}
