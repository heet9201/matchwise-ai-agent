import React, { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { useSpring, animated, config } from '@react-spring/web'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { AnimatedLottie } from './ui/animated-lottie'
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '../lib/animations'
import { cn } from '../lib/cn'
import {
    CloudArrowUpIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

interface UploadedFile {
    file: File
    id: string
    preview?: string
    progress: number
    status: 'uploading' | 'success' | 'error'
    error?: string
}

interface EnhancedDropzoneProps {
    onFilesAccepted?: (files: File[]) => void
    onFileRemove?: (fileId: string) => void
    maxFiles?: number
    maxSize?: number
    accept?: Record<string, string[]>
    multiple?: boolean
    disabled?: boolean
    className?: string
    uploadedFiles?: UploadedFile[]
    showPreview?: boolean
    variant?: 'default' | 'compact' | 'glassmorphism'
}

const EnhancedDropzone: React.FC<EnhancedDropzoneProps> = ({
    onFilesAccepted,
    onFileRemove,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB
    accept = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple = true,
    disabled = false,
    className,
    uploadedFiles = [],
    showPreview = true,
    variant = 'default',
}) => {
    const [isDragActive, setIsDragActive] = useState(false)
    const [rejectedFiles, setRejectedFiles] = useState<FileRejection[]>([])

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setRejectedFiles(fileRejections)
            if (acceptedFiles.length > 0) {
                onFilesAccepted?.(acceptedFiles)
            }
            setIsDragActive(false)
        },
        [onFilesAccepted]
    )

    const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        onDragEnter: () => setIsDragActive(true),
        onDragLeave: () => setIsDragActive(false),
        accept,
        maxFiles,
        maxSize,
        multiple,
        disabled: disabled || uploadedFiles.length >= maxFiles,
    })

    // Animated border color based on drag state
    const borderSpring = useSpring({
        borderColor: isDragReject
            ? '#ef4444'
            : isDragAccept
                ? '#10b981'
                : isDragActive
                    ? '#6366f1'
                    : '#475569',
        backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.05)' : 'rgba(15, 23, 42, 0.4)',
        scale: isDragActive ? 1.02 : 1,
        config: config.wobbly,
    })

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFileIcon = (file: File) => {
        if (file.type.includes('pdf')) return '📄'
        if (file.type.includes('word')) return '📝'
        if (file.type.includes('image')) return '🖼️'
        return '📎'
    }

    const getStatusIcon = (status: UploadedFile['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
            case 'uploading':
                return <AnimatedLottie animation="loading" size="sm" />
            default:
                return null
        }
    }

    const variantClasses = {
        default: 'glassmorphism border-2 border-dashed',
        compact: 'bg-slate-800/50 border border-slate-700',
        glassmorphism: 'glassmorphism-strong border-2 border-dashed',
    }

    return (
        <div className={cn('w-full space-y-4', className)}>
            {/* Dropzone Area */}
            <animated.div
                style={borderSpring}
                className={cn(
                    'rounded-xl transition-all duration-300 overflow-hidden',
                    variantClasses[variant]
                )}
            >
                <div
                    {...getRootProps()}
                    className={cn(
                        'relative p-8 cursor-pointer transition-all duration-300',
                        disabled || uploadedFiles.length >= maxFiles
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-primary-500/5'
                    )}
                    role="button"
                    aria-label={isDragActive ? 'Drop files to upload' : 'Click to upload files or drag and drop'}
                    tabIndex={0}
                >
                    <input
                        {...getInputProps()}
                        id="file-upload-input"
                        aria-label="File upload"
                    />

                    <motion.div
                        {...fadeInUp}
                        className="flex flex-col items-center justify-center text-center space-y-4"
                    >
                        {/* Upload Icon with Animation */}
                        <motion.div
                            animate={{
                                y: isDragActive ? -10 : 0,
                                scale: isDragActive ? 1.1 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {isDragActive ? (
                                <AnimatedLottie animation="upload" size="xl" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center">
                                    <CloudArrowUpIcon className="w-8 h-8 text-primary-400" />
                                </div>
                            )}
                        </motion.div>

                        {/* Upload Text */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-white">
                                {isDragActive
                                    ? 'Drop files here'
                                    : uploadedFiles.length >= maxFiles
                                        ? `Maximum ${maxFiles} files reached`
                                        : 'Drag & drop files here'}
                            </h3>
                            <p className="text-sm text-white/60">
                                or click to browse • Max {formatFileSize(maxSize)} per file
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {Object.values(accept).flat().map((ext) => (
                                    <span
                                        key={ext}
                                        className="px-2 py-1 text-xs rounded-md bg-primary-500/10 text-primary-300"
                                    >
                                        {ext}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* File Count */}
                        {uploadedFiles.length > 0 && (
                            <div className="text-sm text-white/70">
                                {uploadedFiles.length} of {maxFiles} files uploaded
                            </div>
                        )}
                    </motion.div>
                </div>
            </animated.div>

            {/* Error Messages */}
            <AnimatePresence>
                {rejectedFiles.length > 0 && (
                    <motion.div
                        {...scaleIn}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-2"
                    >
                        {rejectedFiles.map(({ file, errors }) => (
                            <Card key={file.name} className="bg-red-500/10 border-red-500/50">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <ExclamationCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-300">{file.name}</p>
                                            <ul className="mt-1 text-xs text-red-400 space-y-1">
                                                {errors.map((e) => (
                                                    <li key={e.code}>
                                                        {e.code === 'file-too-large'
                                                            ? `File is too large. Max size is ${formatFileSize(maxSize)}`
                                                            : e.code === 'file-invalid-type'
                                                                ? 'Invalid file type'
                                                                : e.message}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setRejectedFiles((prev) => prev.filter((f) => f.file !== file))
                                            }
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Uploaded Files Grid */}
            {showPreview && uploadedFiles.length > 0 && (
                <motion.div {...staggerContainer} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">
                            Uploaded Files ({uploadedFiles.length})
                        </h4>
                        {uploadedFiles.length > 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => uploadedFiles.forEach((f) => onFileRemove?.(f.id))}
                                className="text-red-400 hover:text-red-300"
                            >
                                Clear All
                            </Button>
                        )}
                    </div>

                    <AnimatePresence mode="popLayout">
                        {uploadedFiles.map((uploadedFile) => (
                            <motion.div
                                key={uploadedFile.id}
                                {...staggerItem}
                                layout
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <Card className="glassmorphism hover:bg-white/5 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            {/* File Icon/Preview */}
                                            <div className="flex-shrink-0">
                                                {uploadedFile.preview ? (
                                                    <img
                                                        src={uploadedFile.preview}
                                                        alt={uploadedFile.file.name}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center text-2xl">
                                                        {getFileIcon(uploadedFile.file)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {uploadedFile.file.name}
                                                    </p>
                                                    {getStatusIcon(uploadedFile.status)}
                                                </div>
                                                <p className="text-xs text-white/60">
                                                    {formatFileSize(uploadedFile.file.size)}
                                                </p>

                                                {/* Progress Bar */}
                                                {uploadedFile.status === 'uploading' && (
                                                    <div className="mt-2">
                                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadedFile.progress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-white/50 mt-1">
                                                            {uploadedFile.progress}%
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Error Message */}
                                                {uploadedFile.error && (
                                                    <p className="text-xs text-red-400 mt-1">{uploadedFile.error}</p>
                                                )}
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onFileRemove?.(uploadedFile.id)}
                                                className="flex-shrink-0 text-white/60 hover:text-red-400"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    )
}

export default EnhancedDropzone
export type { UploadedFile, EnhancedDropzoneProps }
