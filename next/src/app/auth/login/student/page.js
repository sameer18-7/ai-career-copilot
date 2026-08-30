'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLogin() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/auth/login/college');
    }, [router]);

    return null;
}
