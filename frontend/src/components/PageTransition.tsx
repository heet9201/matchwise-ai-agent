import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    mode: 'recruiter' | 'candidate';
}

export default function PageTransition({ children, mode }: PageTransitionProps) {
    return (
        <motion.div
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 0.2,
                ease: 'easeInOut',
            }}
            style={{ width: '100%' }}
        >
            {children}
        </motion.div>
    );
}
