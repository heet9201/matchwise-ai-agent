import { Button, ButtonProps } from '@mui/material';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedButtonProps extends ButtonProps {
    children: ReactNode;
}

export default function AnimatedButton({ children, ...props }: AnimatedButtonProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block' }}
        >
            <Button
                {...props}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                        left: '100%',
                    },
                    ...props.sx,
                }}
            >
                {children}
            </Button>
        </motion.div>
    );
}
